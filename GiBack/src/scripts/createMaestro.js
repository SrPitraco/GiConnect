// src/scripts/createMaestro.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Validación de variables de entorno
if (!process.env.MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI no está definida en el archivo .env');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('❌ Error: JWT_SECRET no está definida en el archivo .env');
  process.exit(1);
}

(async () => {
  try {
    // 1) Conéctate a MongoDB
    console.log('🔄 Intentando conectar a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Conectado a MongoDB exitosamente');

    // 2) Verificar si ya existe un usuario admin
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️ Ya existe un usuario admin en la base de datos:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log('   Si deseas crear otro admin, primero elimina el existente.');
      process.exit(0);
    }

    // 3) Crear el usuario admin
    const admin = new User({
      email: 'admin@admin.com',
      password: 'admin', // Contraseña por defecto
      nombre: 'Dani',
      apellido1: 'Principal',
      apellido2: '',
      dni: '00000000A',
      telefono: '+34600000000',
      role: 'admin',
      activo: true
    });

    // 4) Guardar el usuario
    await admin.save();
    console.log('✅ Usuario admin creado exitosamente:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Contraseña: admin123`);
    console.log('⚠️ IMPORTANTE: Por favor, cambia la contraseña después del primer inicio de sesión');

  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err.code === 11000) {
      console.error('   El email ya está en uso. Por favor, usa otro email.');
    }
  } finally {
    // 5) Cerrar la conexión
    await mongoose.connection.close();
    console.log('👋 Conexión a MongoDB cerrada');
    process.exit();
  }
})();
