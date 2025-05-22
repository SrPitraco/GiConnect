// src/models/Clase.js
const mongoose = require('mongoose');

const ClaseSchema = new mongoose.Schema({
  titulo:       { type: String, required: true },
  descripcion:  { type: String },
  // Para clases fijas semanales:
  diasSemana:   [{ 
    type: String, 
    enum: ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'] 
  }],
  horaInicio:   { type: String },   // p.ej. "18:30"
  horaFin:      { type: String },   // p.ej. "19:30"
  // Para clases especiales (seminarios, graduaciones):
  fechaEspecial:{ type: Date },
  maxPlazas:    { type: Number, default: 20 },
  instructor:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
