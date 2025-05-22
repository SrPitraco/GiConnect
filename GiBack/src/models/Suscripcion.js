// src/models/Suscripcion.js
const mongoose = require('mongoose');

const SuscripcionSchema = new mongoose.Schema({
  atleta:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tipo:        { type: String, enum: ['mensual','trimestral','anual'], required: true },
  inicio:      { type: Date, default: Date.now },
  fin:         { type: Date, required: true },
  avisado:     { type: Boolean, default: false } // para notificar 5 días antes
}, { timestamps: true });

module.exports = mongoose.model('Suscripcion', SuscripcionSchema);
