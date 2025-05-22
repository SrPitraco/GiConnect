// src/models/User.js
const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');

const cinturonEnum = [
  'Blanco','Gris','Blanco-Amarillo','Amarillo','Amarillo-Naranja',
  'Naranja','Naranja-Verde','Verde','Verde-Azul','Azul','Morado',
  'Marrón','Negro','Negro-Rojo','Rojo-Blanco','Rojo'
];

const UserSchema = new mongoose.Schema({
  foto:          { type: String, required: true},                       // URL o path
  nombre:        { type: String, required: true },
  apellido1:     { type: String, required: true },
  apellido2:     { type: String },
  dni:           { type: String, unique: true },
  telefono:      { type: String, unique: true, required: true },
  email:         { type: String, required: true, unique: true },
  password:      { type: String, required: true },
  role:          { type: String, enum: ['atleta','instructor','maestro'], default: 'atleta' },
  fechaInicio:   { type: Date },                         // cuando empezó la práctica
  cinturon:      { type: String, enum: cinturonEnum },
  grado:         { type: Number, min: 1, max: 4 },
  fechaDesde:    { type: Date },                         // fecha de último cambio de grado/cinturón
  clasesAsistidas: { type: Number, default: 0 },         // contador propio
  clasesImpartidas: { type: Number, default: 0 },        // solo instructores/maestros
  activo:        { type: Boolean, default: true }
}, { timestamps: true });

// Hashear password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Comparar password
UserSchema.methods.comparePassword = function(pwd) {
  return bcrypt.compare(pwd, this.password);
};

module.exports = mongoose.model('User', UserSchema);
