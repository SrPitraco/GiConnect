// src/models/Reserva.js
const mongoose = require('mongoose');

const ReservaSchema = new mongoose.Schema({
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
    enum: ['pendiente', 'confirmada', 'cancelada', 'en_espera', 'asistio', 'no_asistio'], 
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
ReservaSchema.index({ atleta: 1, clase: 1 }, { unique: true });
ReservaSchema.index({ status: 1 });
ReservaSchema.index({ fechaReserva: 1 });

module.exports = mongoose.model('Reserva', ReservaSchema);