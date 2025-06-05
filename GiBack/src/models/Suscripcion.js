// src/models/Suscripcion.js
const mongoose = require('mongoose');

const suscripcionSchema = new mongoose.Schema({
  atleta: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tipo: {
    type: String,
    required: true,
    enum: ['mensual', 'trimestral', 'semestral', 'anual']
  },
  fechaInicio: {
    type: Date,
    required: true
  },
  fechaFin: {
    type: Date,
    required: true
  },
  precio: {
    type: Number,
    required: true
  },
  pagado: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Suscripcion', suscripcionSchema);
