const Reserva = require('../models/Reserva');
const Clase   = require('../models/Clase');
const moment  = require('moment');

// Crear reserva
exports.create = async (req, res) => {
  try {
    const { clase: claseId } = req.body;
    // Comprueba aforo
    const totalConfirmadas = await Reserva.countDocuments({
      clase: claseId, status: 'confirmada'
    });
    const clase = await Clase.findById(claseId);
    if (totalConfirmadas >= clase.maxPlazas) {
      // Añadir a espera
      const espera = await Reserva.create({ 
        atleta: req.userId, clase: claseId, status: 'en_espera' 
      });
      return res.status(201).json({ reserva: espera, message: 'En lista de espera' });
    }
    // Crear y confirma
    const nueva = await Reserva.create({ atleta: req.userId, clase: claseId, status: 'confirmada' });
    res.status(201).json(nueva);
  } catch (err) {
    res.status(400).json({ error: err.message });
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

