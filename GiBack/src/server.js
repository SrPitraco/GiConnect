// backend/src/server.js
require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const connectDB = require('./config/db');

//Para los recordatorios de suscripciones
const cron         = require('node-cron');
const Suscripcion  = require('./models/Suscripcion');
const Mensaje      = require('./models/Mensaje');

const SYSTEM_USER_ID = process.env.SYSTEM_USER_ID;
if (!SYSTEM_USER_ID) {
  console.warn('⚠️  No se ha definido SYSTEM_USER_ID en .env, las notificaciones no funcionarán');
}
//Metodo que comprueba todas las suscripciones a las 9 de la mañana
// y manda un mensaje a los usuarios que tengan una suscripción que expire en menos de 5 días
cron.schedule(
  '0 9 * * *',            // a las 09:00 cada día
  async () => {
    try {
      console.log('🔔 Iniciando tarea programada: revisar suscripciones próximas a expirar');

      const ahora = new Date();
      const limite = new Date(ahora.getTime() + 5 * 24 * 60 * 60 * 1000);

      // 1) Buscar suscripciones con fin ≤ 5 días y avisado = false
      const subs = await Suscripcion.find({
        avisado: false,
        fin:     { $lte: limite }
      });

      for (const sub of subs) {
        // 2) Marcar avisado = true
        sub.avisado = true;
        await sub.save();

        // 3) Crear mensaje en el chat
        await Mensaje.create({
          de:       SYSTEM_USER_ID,
          para:     sub.atleta,
          texto:    `⚠️ Tu suscripción de tipo "${sub.tipo}" expira el ${sub.fin.toLocaleDateString()}. Por favor renueva.`,
          tipo:     'texto'
        });

        console.log(`📨 Notificado a atleta ${sub.atleta} sobre suscripción ${sub._id}`);
      }

      console.log('✅ Tarea de notificaciones completada');
    } catch (err) {
      console.error('❌ Error en cron de suscripciones:', err);
    }
  },
  {
    timezone: 'Europe/Madrid'
  }
);

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

// Configuración de CORS
app.use(cors({
  origin: [
    'http://localhost',
    'http://localhost:8100',
    'http://localhost:4200',
    'capacitor://localhost',
    'http://192.168.1.252:8100',
    'http://192.168.1.252:4200'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middlewares
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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
  console.log(`🌐 Accesible en:`);
  console.log(`   - http://localhost:${PORT}`);
  console.log(`   - http://192.168.1.252:${PORT}`);
});
