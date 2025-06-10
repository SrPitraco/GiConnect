// src/models/Reserva.js
const mongoose = require('mongoose');

const reservaSchema = new mongoose.Schema({
  atleta: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clase: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clase',
    required: true
  },
  status: {
    type: String,
    enum: ['pendiente', 'confirmada'],
    default: 'pendiente'
  },
  fechaReserva: {
    type: Date,
    default: Date.now
  },
  asistenciaConfirmada: {
    type: Boolean,
    default: false
  },
  fechaAsistencia: {
    type: Date
  }
}, {
  timestamps: true
});

// Índices para mejorar el rendimiento de las búsquedas
reservaSchema.index({ atleta: 1 });
reservaSchema.index({ clase: 1 });
reservaSchema.index({ status: 1 });
reservaSchema.index({ fechaReserva: 1 });

const Reserva = mongoose.model('Reserva', reservaSchema);

module.exports = Reserva;