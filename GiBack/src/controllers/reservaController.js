const Reserva = require('../models/Reserva');
const User    = require('../models/User');
const Clase   = require('../models/Clase');
const moment  = require('moment');

// Crear reserva
exports.create = async (req, res) => {
  try {
    const atletaId = req.userId;
    const { clase: claseId } = req.body;

    // 0) Comprueba si ya tiene una reserva (pendiente, confirmada o en_espera)
    const yaReservado = await Reserva.exists({
      atleta: atletaId,
      clase: claseId,
      status: { $in: ['pendiente','confirmada','en_espera'] }
    });
    if (yaReservado) {
      return res
        .status(400)
        .json({ error: 'Ya tienes una reserva activa para esta clase' });
    }

    // 1) Cuenta ocupadas (pendiente o confirmada)
    const ocupadas = await Reserva.countDocuments({
      clase: claseId,
      status: { $in: ['pendiente','confirmada'] }
    });

    // 2) Trae la clase
    const clase = await Clase.findById(claseId);
    if (!clase) {
      return res.status(404).json({ error: 'Clase no encontrada' });
    }

    // 3) Determina el estado inicial
    const statusInicial = ocupadas < clase.maxPlazas
      ? 'pendiente'
      : 'en_espera';

    // 4) Crea la reserva
    const reserva = await Reserva.create({
      atleta: atletaId,
      clase:  claseId,
      status: statusInicial
    });

    return res.status(201).json(reserva);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// Listar reservas del usuario
exports.listUser = async (req, res) => {
  try {
    const reservas = await Reserva.find({ atleta: req.userId })
      .populate('clase','titulo fechaEspecial diasSemana horaInicio');
    res.json(reservas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cancelar reserva (solo si faltan >2h)
exports.cancel = async (req, res) => {
  try {
    const reserva = await Reserva.findById(req.params.id).populate('clase');
    const now = moment();
    const claseTime = reserva.clase.fechaEspecial
      ? moment(reserva.clase.fechaEspecial)
      : moment().day(reserva.clase.diasSemana[0]).hour(reserva.clase.horaInicio.split(':')[0]).minute(reserva.clase.horaInicio.split(':')[1]);
    if (claseTime.diff(now, 'hours') < 2 && reserva.status === 'confirmada') {
      return res.status(400).json({ error: 'No puedes cancelar con menos de 2 horas' });
    }
    reserva.status = 'cancelada';
    await reserva.save();
    res.json({ message: 'Reserva cancelada', reserva });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.confirmAttendance = async (req, res) => {
  try {
    // 1) Busca la reserva y población básica
    const reserva = await Reserva.findById(req.params.id).populate('clase atleta');
    if (!reserva) return res.status(404).json({ error: 'Reserva no encontrada' });

    // 2) Cambia el estado a confirmada
    reserva.status = 'confirmada';
    await reserva.save();

    // 3) Incrementa el contador de asistencias del atleta
    await User.findByIdAndUpdate(reserva.atleta._id, {
      $inc: { clasesAsistidas: 1 }
    });

    // 4) Incrementa el contador de clases impartidas del instructor
    await User.findByIdAndUpdate(reserva.clase.instructor, {
      $inc: { clasesImpartidas: 1 }
    });

    // 5) Devuelve la reserva confirmada
    res.json(reserva);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

