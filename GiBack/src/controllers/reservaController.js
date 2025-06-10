const Reserva = require('../models/Reserva');
const User    = require('../models/User');
const Clase   = require('../models/Clase');
const moment  = require('moment');

// Crear una nueva reserva
exports.create = async (req, res) => {
  try {
    const { claseId } = req.body;
    const userId = req.userId;

    // Verificar que el usuario existe y tiene los permisos necesarios
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar si el usuario puede reservar (tiene suscripción activa o es maestro/admin)
    const puedeReservar = req.role === 'maestro' || 
                         req.role === 'admin' || 
                         (req.role === 'atleta' && user.activo === true) ||
                         (req.role === 'instructor' && user.activo === true);

    if (!puedeReservar) {
      return res.status(403).json({ 
        message: 'No tienes permiso para reservar clases. Necesitas una suscripción activa.' 
      });
    }

    // Verificar que la clase existe
    const clase = await Clase.findById(claseId);
    if (!clase) {
      return res.status(404).json({ message: 'Clase no encontrada' });
    }

    // Verificar que la clase no es de un día anterior
    const ahora = moment();
    const fechaClaseReserva = moment(clase.fecha || 
      moment().day(clase.diaSemana).format('YYYY-MM-DD'));
    const horaClaseReserva = moment(clase.horaInicio, 'HH:mm');
    const fechaHoraClaseReserva = fechaClaseReserva.set({
      hour: horaClaseReserva.hour(),
      minute: horaClaseReserva.minute()
    });

    if (fechaHoraClaseReserva.isBefore(ahora)) {
      return res.status(400).json({ 
        message: 'No se pueden reservar clases que ya han pasado' 
      });
    }

    // Verificar si ya existe una reserva para esta clase
    if (req.role !== 'maestro' && req.role !== 'admin') {
      const reservaExistente = await Reserva.findOne({
        atleta: userId,
        clase: claseId,
        status: { $in: ['pendiente', 'confirmada'] }
      });

      if (reservaExistente) {
        return res.status(400).json({ 
          message: 'Ya tienes una reserva activa para esta clase' 
        });
      }
    }

    // Verificar si es una clase fija y si está dentro del período permitido
    if (clase.diaSemana) {
      const inicioSemana = moment().startOf('week').add(1, 'days'); // Lunes
      const finSemana = moment().endOf('week').subtract(1, 'days'); // Sábado
      
      // Si es domingo después de las 15:00, permitir reservas para la semana siguiente
      if (ahora.day() === 0 && ahora.hour() >= 15) {
        inicioSemana.add(1, 'week');
        finSemana.add(1, 'week');
      }

      if (ahora.isBefore(inicioSemana) || ahora.isAfter(finSemana)) {
        return res.status(400).json({ 
          message: 'Las reservas para clases fijas solo están disponibles para la semana en curso' 
        });
      }
    }

    // Verificar si el usuario ya tiene una reserva en la misma hora
    const fechaClaseMismoHorario = clase.fecha || moment().day(clase.diaSemana).format('YYYY-MM-DD');
    const horaInicio = clase.horaInicio;
    const horaFin = clase.horaFin;

    const reservaMismoHorario = await Reserva.findOne({
      atleta: userId,
      status: { $in: ['pendiente', 'confirmada'] },
      $or: [
        {
          'clase.fecha': fechaClaseMismoHorario,
          'clase.horaInicio': { $lt: horaFin },
          'clase.horaFin': { $gt: horaInicio }
        }
      ]
    }).populate('clase');

    if (reservaMismoHorario) {
      return res.status(400).json({ 
        message: 'Ya tienes una reserva en este horario' 
      });
    }

    // Verificar si hay plazas disponibles
    const reservasActivas = await Reserva.countDocuments({
      clase: claseId,
      status: { $in: ['pendiente', 'confirmada'] }
    });

    if (reservasActivas >= clase.maxPlazas) {
      return res.status(400).json({ 
        message: 'No hay plazas disponibles para esta clase' 
      });
    }

    // Crear la reserva
    const reserva = new Reserva({
      atleta: userId,
      clase: claseId,
      status: 'pendiente'
    });

    await reserva.save();

    // Actualizar el array de reservas en la clase
    await Clase.findByIdAndUpdate(claseId, {
      $push: { reservas: reserva._id }
    });

    res.status(201).json(reserva);
  } catch (error) {
    console.error('Error al crear la reserva:', error);
    
    // Manejar específicamente el error de clave duplicada
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Ya tienes una reserva para esta clase' 
      });
    }
    
    res.status(500).json({ message: 'Error al crear la reserva' });
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

// Cancelar una reserva
exports.cancel = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const reserva = await Reserva.findById(id).populate('clase');
    if (!reserva) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    // Verificar que el usuario es el propietario de la reserva o es admin/maestro
    const user = await User.findById(userId);
    if (reserva.atleta.toString() !== userId && 
        req.role !== 'admin' && 
        req.role !== 'maestro') {
      return res.status(403).json({ 
        message: 'No tienes permiso para cancelar esta reserva' 
      });
    }

    // Verificar si se puede cancelar (2 horas antes)
    const ahora = moment();
    const fechaClase = moment(reserva.clase.fecha || 
      moment().day(reserva.clase.diaSemana).format('YYYY-MM-DD'));
    const horaClase = moment(reserva.clase.horaInicio, 'HH:mm');
    const fechaHoraClase = fechaClase.set({
      hour: horaClase.hour(),
      minute: horaClase.minute()
    });

    if (fechaHoraClase.diff(ahora, 'hours') < 2) {
      return res.status(400).json({ 
        message: 'No se puede cancelar la reserva menos de 2 horas antes de la clase' 
      });
    }

    // Eliminar la reserva del array de la clase
    await Clase.findByIdAndUpdate(reserva.clase, {
      $pull: { reservas: reserva._id }
    });

    // Eliminar completamente la reserva
    await Reserva.findByIdAndDelete(id);

    res.json({ message: 'Reserva eliminada correctamente' });
  } catch (error) {
    console.error('Error al cancelar la reserva:', error);
    res.status(500).json({ message: 'Error al cancelar la reserva' });
  }
};

// Confirmar asistencia
exports.confirmarAsistencia = async (req, res) => {
  try {
    const { id } = req.params;
    const { asistio } = req.body;
    const userId = req.userId;

    // Verificar que el usuario es maestro o admin
    if (req.role !== 'maestro' && req.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Solo los maestros pueden confirmar asistencia' 
      });
    }

    const reserva = await Reserva.findById(id).populate('clase');
    if (!reserva) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    // Verificar que la clase es de hoy
    const hoy = moment().format('YYYY-MM-DD');
    const fechaClase = moment(reserva.clase.fecha || 
      moment().day(reserva.clase.diaSemana).format('YYYY-MM-DD'));

    if (fechaClase.format('YYYY-MM-DD') !== hoy) {
      return res.status(400).json({ 
        message: 'Solo se puede confirmar asistencia el día de la clase' 
      });
    }

    // Actualizar el estado de la reserva
    reserva.status = asistio ? 'asistio' : 'no_asistio';
    reserva.asistenciaConfirmada = true;
    reserva.fechaAsistencia = new Date();

    // Si asistió, incrementar el contador de clases asistidas
    if (asistio) {
      await User.findByIdAndUpdate(reserva.atleta, {
        $inc: { clasesAsistidas: 1 }
      });
    }

    await reserva.save();

    res.json(reserva);
  } catch (error) {
    console.error('Error al confirmar asistencia:', error);
    res.status(500).json({ message: 'Error al confirmar asistencia' });
  }
};

// Obtener reservas de una clase
exports.getByClase = async (req, res) => {
  try {
    const { claseId } = req.params;
    const userId = req.userId;

    // Verificar que el usuario es maestro o admin
    if (req.role !== 'maestro' && req.role !== 'admin') {
      return res.status(403).json({ 
        message: 'No tienes permiso para ver las reservas de esta clase' 
      });
    }

    const reservas = await Reserva.find({ clase: claseId })
      .populate('atleta', 'nombre foto')
      .sort({ fechaReserva: 1 });

    res.json(reservas);
  } catch (error) {
    console.error('Error al obtener las reservas:', error);
    res.status(500).json({ message: 'Error al obtener las reservas' });
  }
};

// Limpiar reservas antiguas
exports.limpiarReservasAntiguas = async (req, res) => {
  try {
    const userId = req.userId;

    // Verificar que el usuario es maestro o admin
    if (req.role !== 'maestro' && req.role !== 'admin') {
      return res.status(403).json({ 
        message: 'No tienes permiso para limpiar reservas' 
      });
    }

    const hoy = moment().startOf('day');
    
    // Encontrar todas las reservas de clases pasadas que ya tienen la asistencia confirmada
    const reservasParaBorrar = await Reserva.find({
      'clase.fecha': { $lt: hoy },
      asistenciaConfirmada: true
    });

    // Borrar las reservas
    await Reserva.deleteMany({
      _id: { $in: reservasParaBorrar.map(r => r._id) }
    });

    res.json({ 
      message: 'Reservas limpiadas correctamente',
      cantidad: reservasParaBorrar.length 
    });
  } catch (error) {
    console.error('Error al limpiar reservas:', error);
    res.status(500).json({ message: 'Error al limpiar reservas' });
  }
};

// Crear una nueva reserva (solo para maestros y admin)
exports.createAdminReserva = async (req, res) => {
  try {
    const { claseId } = req.body;
    const userId = req.userId;

    // Verificar que la clase existe
    const clase = await Clase.findById(claseId);
    if (!clase) {
      return res.status(404).json({ message: 'Clase no encontrada' });
    }

    // Verificar si hay plazas disponibles
    const reservasActivas = await Reserva.countDocuments({
      clase: claseId,
      status: { $in: ['pendiente', 'confirmada'] }
    });

    if (reservasActivas >= clase.maxPlazas) {
      return res.status(400).json({ 
        message: 'No hay plazas disponibles para esta clase' 
      });
    }

    try {
      // Crear la reserva
      const reserva = new Reserva({
        atleta: userId,
        clase: claseId,
        status: 'pendiente',
        fechaReserva: new Date()
      });

      await reserva.save();

      // Actualizar el array de reservas en la clase
      await Clase.findByIdAndUpdate(claseId, {
        $push: { reservas: reserva._id }
      });

      res.status(201).json(reserva);
    } catch (saveError) {
      console.error('Error al guardar la reserva:', saveError);
      if (saveError.code === 11000) {
        // Si es un error de duplicado, intentamos crear la reserva con un timestamp ligeramente diferente
        const reserva = new Reserva({
          atleta: userId,
          clase: claseId,
          status: 'pendiente',
          fechaReserva: new Date(Date.now() + 1) // Añadimos 1ms para evitar duplicados
        });

        await reserva.save();

        // Actualizar el array de reservas en la clase
        await Clase.findByIdAndUpdate(claseId, {
          $push: { reservas: reserva._id }
        });

        res.status(201).json(reserva);
      } else {
        throw saveError;
      }
    }
  } catch (error) {
    console.error('Error al crear la reserva:', error);
    res.status(500).json({ 
      message: 'Error al crear la reserva', 
      error: error.message,
      code: error.code 
    });
  }
};

// Crear una nueva reserva múltiple (solo para maestros y admin)
exports.createMultipleReserva = async (req, res) => {
  try {
    console.log('=== BACKEND DEBUG === Iniciando createMultipleReserva');
    console.log('=== BACKEND DEBUG === Request body:', req.body);
    console.log('=== BACKEND DEBUG === Request user:', req.userId);

    const { claseId } = req.body;
    const userId = req.userId;

    console.log('=== BACKEND DEBUG === Buscando clase:', claseId);
    const clase = await Clase.findById(claseId);
    console.log('=== BACKEND DEBUG === Clase encontrada:', clase);

    if (!clase) {
      console.log('=== BACKEND DEBUG === Clase no encontrada');
      return res.status(404).json({ message: 'Clase no encontrada' });
    }

    console.log('=== BACKEND DEBUG === Contando reservas activas');
    const reservasActivas = await Reserva.countDocuments({
      clase: claseId,
      status: { $in: ['pendiente', 'confirmada'] }
    });
    console.log('=== BACKEND DEBUG === Reservas activas:', reservasActivas);

    if (reservasActivas >= clase.maxPlazas) {
      console.log('=== BACKEND DEBUG === Clase llena');
      return res.status(400).json({ message: 'La clase está llena' });
    }

    console.log('=== BACKEND DEBUG === Creando nueva reserva');
    const nuevaReserva = new Reserva({
      atleta: userId,
      clase: claseId,
      status: 'pendiente',
      fechaReserva: new Date()
    });

    console.log('=== BACKEND DEBUG === Guardando reserva');
    await nuevaReserva.save();
    console.log('=== BACKEND DEBUG === Reserva guardada:', nuevaReserva);

    console.log('=== BACKEND DEBUG === Actualizando clase');
    clase.reservas.push(nuevaReserva._id);
    await clase.save();
    console.log('=== BACKEND DEBUG === Clase actualizada');

    res.status(201).json(nuevaReserva);
  } catch (error) {
    console.error('=== BACKEND DEBUG === Error en createMultipleReserva:', error);
    console.error('=== BACKEND DEBUG === Stack trace:', error.stack);
    res.status(500).json({ 
      message: 'Error al crear la reserva',
      error: error.message,
      stack: error.stack
    });
  }
};

