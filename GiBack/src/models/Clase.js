// src/models/Clase.js
const mongoose = require('mongoose');

const claseSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true
  },
  descripcion: { 
    type: String 
  },
  diaSemana: {
    type: String,
    enum: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
    validate: {
      validator: function(v) {
        // Si hay fecha, no debe haber diaSemana
        if (this.fecha && v) return false;
        // Si no hay fecha, debe haber diaSemana
        if (!this.fecha && !v) return false;
        return true;
      },
      message: 'Una clase debe tener o diaSemana o fecha, pero no ambos'
    }
  },
  fecha: {
    type: Date,
    validate: {
      validator: function(v) {
        // Si hay diaSemana, no debe haber fecha
        if (this.diaSemana && v) return false;
        // Si no hay diaSemana, debe haber fecha
        if (!this.diaSemana && !v) return false;
        return true;
      },
      message: 'Una clase debe tener o diaSemana o fecha, pero no ambos'
    }
  },
  horaInicio: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  horaFin: {
    type: String, 
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  maxPlazas: {
    type: Number,
    default: 10,
    min: 1
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reservas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reserva'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para mejorar el rendimiento de las búsquedas
claseSchema.index({ diaSemana: 1 });
claseSchema.index({ fecha: 1 });
claseSchema.index({ instructor: 1 });

// Método para verificar si hay plazas disponibles
claseSchema.methods.hayPlazas = async function() {
  await this.populate('reservas');
  return this.reservas.length < this.maxPlazas;
};

// Método para obtener el número de plazas disponibles
claseSchema.methods.plazasDisponibles = async function() {
  await this.populate('reservas');
  return this.maxPlazas - this.reservas.length;
};

module.exports = mongoose.model('Clase', claseSchema);
