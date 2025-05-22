// src/models/Mensaje.js
const mongoose = require('mongoose');

const MensajeSchema = new mongoose.Schema({
  de:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  para:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  texto:     { type: String },
  mediaUrl:  { type: String },   // si es foto/video
  tipo:      { type: String, enum: ['texto','imagen','video'], default: 'texto' },
  fecha:     { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Mensaje', MensajeSchema);
