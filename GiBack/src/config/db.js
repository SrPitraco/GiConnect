// src/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser:    true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB conectada');
  } catch (err) {
    console.error('❌ Error conectando a MongoDB:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
