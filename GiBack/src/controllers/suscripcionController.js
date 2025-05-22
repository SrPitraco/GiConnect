const Suscripcion = require('../models/Suscripcion');
const moment       = require('moment');

// Crear suscripción y calcular fecha de fin
exports.create = async (req, res) => {
  try {
    const { tipo } = req.body; // 'mensual','trimestral','anual'
    const inicio = moment();
    let fin;
    switch (tipo) {
      case 'mensual':     fin = inicio.clone().add(1, 'month'); break;
      case 'trimestral':  fin = inicio.clone().add(3, 'months'); break;
      case 'anual':       fin = inicio.clone().add(1, 'year'); break;
      default: throw new Error('Tipo inválido');
    }
    const nueva = await Suscripcion.create({
      atleta: req.userId,
      tipo,
      inicio: inicio.toDate(),
      fin:    fin.toDate()
    });
    res.status(201).json(nueva);
  } catch (err) {
    res.status(400).json({ error: err.message });
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
