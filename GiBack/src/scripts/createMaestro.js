// src/scripts/createMaestro.js
require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('../models/User');

(async () => {
  try {
    // 1) Conéctate a MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser:    true,
      useUnifiedTopology: true
    });
    console.log('🔌 Conectado a MongoDB');

    // 2) Crea el usuario maestro
    const maestro = new User({
      email:       'a',
      password:    'a',
      nombre:      'Dani',
      apellido1:   'Dan',
      apellido2:   'Dan',
      dni:         '12123123A',
      telefono:    '+34666111222',
      foto:        'https://miapp.com/uploads/Dani.jpg',
      role:        'maestro',
      fechaInicio: new Date('2001-06-01'),
      cinturon:    'Negro',
      grado:       4,
      fechaDesde:  new Date('2020-01-10')
    });

    await maestro.save();
    console.log('🛡️ Maestro creado:', {
      id: maestro._id,
      email: maestro.email
    });
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
})();
