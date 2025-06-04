// src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const cinturonEnum = [
  'Blanco','Gris','Blanco-Amarillo','Amarillo','Amarillo-Naranja',
  'Naranja','Naranja-Verde','Verde','Verde-Azul','Azul','Morado',
  'Marrón','Negro','Negro-Rojo','Rojo-Blanco','Rojo'
];

const UserSchema = new mongoose.Schema({
  foto:          { 
    type: String, 
    required: false,
    default: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    validate: {
      validator: function(v) {
        // Si es null o undefined, es válido (usará el default)
        if (!v) return true;
        // Si tiene un valor, debe ser una imagen base64
        return v.startsWith('data:image/');
      },
      message: 'La foto debe ser una imagen en formato base64'
    }
  },
  nombre:        { type: String, required: true, trim: true },
  apellido1:     { type: String, required: true, trim: true },
  apellido2:     { type: String, required: false, trim: true },
  dni:           { 
    type: String, 
    required: true, 
    trim: true,
    unique: function() {
      // Permitir duplicados solo para el DNI especial
      return this.dni !== '00000000A';
    },
    validate: {
      validator: function(v) {
        // Si es el DNI especial para invitados extranjeros
        if (v === '00000000A' || v === '00000000a') return true;
        
        // Validar formato: 8 números + 1 letra, sin espacios
        const dniRegex = /^[0-9]{8}[A-Za-z]$/;
        if (!dniRegex.test(v)) return false;
        
        return true;
      },
      message: 'El DNI debe tener 8 números seguidos de una letra, sin espacios'
    },
    set: function(v) {
      // Convertir a mayúsculas y eliminar espacios
      return v ? v.toUpperCase().replace(/\s/g, '') : v;
    }
  },
  telefono:      { type: String, required: true, trim: true, unique: true },
  email:         { type: String, required: true, unique: true, trim: true, lowercase: true },
  password:      { type: String, required: true },
  role:          { 
    type: String, 
    enum: ['atleta', 'instructor', 'maestro', 'admin'], 
    default: 'atleta' 
  },
  numIBJJF:      { type: String, required: false},
  fechaInicio:   { type: Date },                         // cuando empezó la práctica
  cinturon:      { type: String, enum: cinturonEnum, default: 'Blanco' },
  grado:         { type: Number, min: 0, max: 5, default: 0 },
  fechaDesde:    { type: Date },                         // fecha de último cambio de grado/cinturón
  clasesAsistidas: { type: Number, default: 0 },         // contador propio
  clasesImpartidas: { type: Number, default: 0 },        // solo instructores/maestros
  activo:        { type: Boolean, default: true },
  resetPasswordCode: { type: String },
  resetPasswordExpires: { type: Date }
}, { timestamps: true });

// Hash password antes de guardar
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar contraseñas
UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

module.exports = mongoose.model('User', UserSchema);
