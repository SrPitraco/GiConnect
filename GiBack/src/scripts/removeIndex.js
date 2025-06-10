const mongoose = require('mongoose');
require('dotenv').config();

async function removeIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('reservas');

    // Mostrar índices actuales
    console.log('Índices antes de eliminar:', await collection.indexes());

    // Eliminar el índice compuesto
    await collection.dropIndex('atleta_1_clase_1_status_1');
    console.log('Índice compuesto eliminado exitosamente');

    // Verificar índices restantes
    console.log('Índices después de eliminar:', await collection.indexes());

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Conexión cerrada');
  }
}

removeIndex(); 