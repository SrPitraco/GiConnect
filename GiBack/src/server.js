// backend/src/server.js
require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const connectDB = require('./config/db');

const authRoutes         = require('./routes/auth');
const claseRoutes        = require('./routes/clases');
const reservaRoutes      = require('./routes/reservas');
const productoRoutes     = require('./routes/productos');
const pedidoRoutes       = require('./routes/pedidos');
const suscripcionRoutes  = require('./routes/suscripciones');
const mensajeRoutes      = require('./routes/mensajes');
const userRoutes         = require('./routes/users');

const app = express();

// Conexión a MongoDB Atlas
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Montaje de rutas
app.use('/api/auth',            authRoutes);
app.use('/api/clases',          claseRoutes);
app.use('/api/reservas',        reservaRoutes);
app.use('/api/productos',       productoRoutes);
app.use('/api/pedidos',         pedidoRoutes);
app.use('/api/suscripciones',   suscripcionRoutes);
app.use('/api/mensajes',        mensajeRoutes);
app.use('/api/users',           userRoutes);

// Arranque del servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
});
