require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function updateToAdmin() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');

    // Buscar el usuario maestro
    const maestro = await User.findOne({ role: 'maestro' });
    
    if (!maestro) {
      console.log('No se encontró ningún usuario con rol de maestro');
      process.exit(1);
    }

    // Actualizar el rol a admin
    maestro.role = 'admin';
    await maestro.save();

    console.log('Usuario actualizado exitosamente a administrador');
    console.log('Email:', maestro.email);
    console.log('Nombre:', maestro.nombre, maestro.apellido1);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado de MongoDB');
  }
}

updateToAdmin(); 