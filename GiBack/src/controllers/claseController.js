const Clase = require('../models/Clase');
const moment = require('moment'); // para manipular fechas

// Listar todas las clases
exports.list = async (req, res) => {
  try {
    const clases = await Clase.find().populate('instructor','nombre');
    res.json(clases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Listar clases de la semana actual (lunes–domingo)
exports.listSemana = async (req, res) => {
  try {
    const hoy = moment().startOf('day');
    const domingo = moment().endOf('week');
    // Clases especiales dentro de la semana
    const especiales = await Clase.find({
      fechaEspecial: { $gte: hoy.toDate(), $lte: domingo.toDate() }
    }).populate('instructor','nombre');

    // Clases fijas cuyos diasSemana coincidan
    const fijas = await Clase.find({
      diasSemana: { $in: [ moment().format('dddd') ] }
    }).populate('instructor','nombre');

    res.json({ especiales, fijas });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear nueva clase (fija o especial)
exports.create = async (req, res) => {
  try {
    const data = { ...req.body, instructor: req.userId };
    const nueva = await Clase.create(data);
    res.status(201).json(nueva);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Modificar clase
exports.update = async (req, res) => {
  try {
    const updated = await Clase.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Eliminar clase
exports.remove = async (req, res) => {
  try {
    await Clase.findByIdAndDelete(req.params.id);
    res.json({ message: 'Clase eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
