const mongoose = require('mongoose');
require('dotenv').config();

// Validación de variables de entorno
if (!process.env.MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI no está definida en el archivo .env');
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

    // 2) Obtener la colección de usuarios
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // 3) Eliminar el índice único del DNI
    console.log('🔄 Eliminando índice único del DNI...');
    await usersCollection.dropIndex('dni_1');
    console.log('✅ Índice único del DNI eliminado exitosamente');

    // 4) Crear un nuevo índice no único
    console.log('🔄 Creando nuevo índice no único para el DNI...');
    await usersCollection.createIndex({ dni: 1 }, { unique: false });
    console.log('✅ Nuevo índice no único creado exitosamente');

    console.log('✅ Proceso completado exitosamente');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})(); 