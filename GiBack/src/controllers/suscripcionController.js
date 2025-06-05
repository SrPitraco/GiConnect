const Suscripcion = require('../models/Suscripcion');
const moment       = require('moment');

// Crear suscripción
exports.create = async (req, res) => {
  try {
    const { tipo, fechaInicio, fechaFin, precio, atleta, pagado } = req.body;
    
    console.log('Datos recibidos:', req.body);
    
    // Validar campos requeridos
    if (!tipo || !fechaInicio || !fechaFin || !precio || !atleta) {
      throw new Error('Faltan campos requeridos');
    }

    // Validar tipo de suscripción
    if (!['mensual', 'trimestral', 'semestral', 'anual'].includes(tipo)) {
      throw new Error('Tipo de suscripción inválido');
    }

    // Crear la suscripción
    const nueva = await Suscripcion.create({
      atleta,
      tipo,
      fechaInicio: new Date(fechaInicio),
      fechaFin: new Date(fechaFin),
      precio,
      pagado: pagado || false
    });

    console.log('Suscripción creada:', nueva);
    res.status(201).json(nueva);
  } catch (err) {
    console.error('Error al crear suscripción:', err);
    res.status(400).json({ message: err.message });
  }
};

// Listar suscripciones del usuario
exports.listUser = async (req, res) => {
  try {
    const subs = await Suscripcion.find({ atleta: req.userId });
    res.json(subs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Listar todas (maestro/admin)
exports.listAll = async (req, res) => {
  try {
    const subs = await Suscripcion.find()
      .populate('atleta','nombre apellido1');
    res.json(subs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Marcar aviso enviado (para no repetir notificación)
exports.markAvisado = async (req, res) => {
  try {
    const sub = await Suscripcion.findByIdAndUpdate(
      req.params.id,
      { avisado: true },
      { new: true }
    );
    res.json(sub);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Eliminar suscripción
exports.remove = async (req, res) => {
  try {
    await Suscripcion.findByIdAndDelete(req.params.id);
    res.json({ message: 'Suscripción eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Listar suscripciones activas del usuario
exports.listActivas = async (req, res) => {
  try {
    const ahora = moment();
    const subs = await Suscripcion.find({
      atleta: req.userId,
      fechaFin: { $gt: ahora.toDate() },
      pagado: true
    }).sort({ fechaFin: 1 }); // Ordenadas por fecha de fin, las más próximas primero
    
    res.json(subs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
