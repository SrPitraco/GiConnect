// src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const cinturonEnum = [
  'Blanco','Gris','Blanco-Amarillo','Amarillo','Amarillo-Naranja',
  'Naranja','Naranja-Verde','Verde','Verde-Azul','Azul','Morado',
  'Marrón','Negro','Negro-Rojo','Rojo-Blanco','Rojo'
];

const UserSchema = new mongoose.Schema({
  foto:          { type: String, required: false},                       // URL o path
  nombre:        { type: String, required: false, trim: true },
  apellido1:     { type: String, required: false, trim: true },
  apellido2:     { type: String, required: false, trim: true },
  dni:           { type: String, required: false, trim: true },
  telefono:      { type: String, required: false, trim: true },
  email:         { type: String, required: true, unique: true, trim: true, lowercase: true },
  password:      { type: String, required: true },
  role:          { type: String, enum: ['atleta', 'admin'], default: 'atleta' },
  fechaInicio:   { type: Date },                         // cuando empezó la práctica
  cinturon:      { type: String, enum: cinturonEnum, default: 'Blanco' },
  grado:         { type: Number, min: 0, max: 5, default: 0 },
  fechaDesde:    { type: Date },                         // fecha de último cambio de grado/cinturón
  clasesAsistidas: { type: Number, default: 0 },         // contador propio
  clasesImpartidas: { type: Number, default: 0 },        // solo instructores/maestros
  activo:        { type: Boolean, default: true }
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
