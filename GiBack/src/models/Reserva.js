// src/models/Reserva.js
const mongoose = require('mongoose');

const ReservaSchema = new mongoose.Schema({
  atleta:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clase:        { type: mongoose.Schema.Types.ObjectId, ref: 'Clase', required: true },
  status:       { 
    type: String, 
    enum: ['pendiente','confirmada','cancelada','en_espera'], 
    default: 'pendiente' 
  },
  fechaReserva: { type: Date, default: Date.now }
}, { timestamps: true });
