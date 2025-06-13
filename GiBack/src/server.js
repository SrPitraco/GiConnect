// backend/src/server.js
require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const connectDB = require('./config/db');
const mongoose  = require('mongoose');

//Para los recordatorios de suscripciones
const cron         = require('node-cron');
const Suscripcion  = require('./models/Suscripcion');
const Mensaje      = require('./models/Mensaje');
const Clase        = require('./models/Clase');
const User         = require('./models/User');
const Reserva      = require('./models/Reserva');

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

// Tarea programada para generar clases semanales (domingo a las 15:00)
cron.schedule(
  '0 15 * * 0',  // domingo a las 15:00
  async () => {
    try {
      console.log('📅 Iniciando generación automática de clases semanales');

      // Obtener la fecha del próximo lunes
      const hoy = new Date();
      const diasHastaLunes = hoy.getDay() === 0 ? 1 : 8 - hoy.getDay();
      const fechaLunes = new Date(hoy);
      fechaLunes.setDate(hoy.getDate() + diasHastaLunes);
      fechaLunes.setHours(0, 0, 0, 0);

      // Obtener la fecha del lunes de la semana actual
      const fechaLunesActual = new Date(hoy);
      fechaLunesActual.setDate(hoy.getDate() - hoy.getDay() + 1);
      fechaLunesActual.setHours(0, 0, 0, 0);

      console.log('📅 Fechas de referencia:', {
        fechaLunesActual: fechaLunesActual.toISOString(),
        fechaLunes: fechaLunes.toISOString()
      });

      // 1. Obtener las clases que se van a borrar (las de la semana actual)
      const clasesABorrar = await Clase.find({
        fecha: { 
          $gte: fechaLunesActual,
          $lt: fechaLunes
        }
      }).populate('instructor')
        .populate({
          path: 'reservas',
          populate: {
            path: 'atleta'
          }
        });

      console.log(`📚 Encontradas ${clasesABorrar.length} clases a procesar`);

      // 2. Procesar cada clase
      for (const clase of clasesABorrar) {
        console.log(`📝 Procesando clase: ${clase.titulo}`);

        // Incrementar clasesImpartidas del instructor
        await User.findByIdAndUpdate(clase.instructor._id, {
          $inc: { clasesImpartidas: 1 }
        });
        console.log(`✅ Instructor ${clase.instructor.nombre} actualizado`);

        // Procesar reservas
        for (const reserva of clase.reservas) {
          if (reserva.asistenciaConfirmada) {
            await User.findByIdAndUpdate(reserva.atleta._id, {
              $inc: { clasesAsistidas: 1 }
            });
            console.log(`✅ Atleta ${reserva.atleta.nombre} actualizado`);
          }
        }

        // Borrar las reservas de la clase
        await Reserva.deleteMany({ clase: clase._id });
        console.log(`🗑️  Reservas de la clase ${clase.titulo} eliminadas`);
      }

      // 3. Borrar las clases procesadas
      await Clase.deleteMany({
        fecha: { 
          $gte: fechaLunesActual,
          $lt: fechaLunes
        }
      });
      console.log(`🗑️  Clases de la semana actual eliminadas`);

      // 4. Generar las clases de la semana siguiente
      const clasesFijas = await Clase.find({
        diaSemana: { $exists: true }
      }).populate('instructor', 'nombre foto');

      console.log(`📚 Encontradas ${clasesFijas.length} clases fijas`);

      // Mapeo de días de la semana a números
      const diasSemana = {
        'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4, 
        'Viernes': 5, 'Sábado': 6, 'Domingo': 0
      };

      // Generar las clases para cada día de la semana
      const clasesGeneradas = [];
      for (let i = 0; i < 7; i++) {
        const fechaClase = new Date(fechaLunes);
        fechaClase.setDate(fechaLunes.getDate() + i);
        
        // Encontrar las clases fijas para este día
        const clasesDelDia = clasesFijas.filter(clase => 
          diasSemana[clase.diaSemana] === fechaClase.getDay()
        );

        // Crear nuevas clases para este día
        for (const claseFija of clasesDelDia) {
          const nuevaClase = new Clase({
            titulo: claseFija.titulo,
            descripcion: claseFija.descripcion,
            fecha: fechaClase,
            horaInicio: claseFija.horaInicio,
            horaFin: claseFija.horaFin,
            maxPlazas: claseFija.maxPlazas,
            instructor: claseFija.instructor._id,
            supervisada: false
          });

          await nuevaClase.save();
          clasesGeneradas.push(nuevaClase);
          
          console.log(`✅ Clase generada: ${nuevaClase.titulo} para ${fechaClase.toLocaleDateString()}`);
        }
      }

      console.log(`✨ Proceso completado: ${clasesGeneradas.length} clases creadas`);

    } catch (error) {
      console.error('❌ Error en la generación automática de clases:', error);
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
  origin: function(origin, callback) {
    // En desarrollo, permitir todas las conexiones
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // En producción, solo permitir orígenes específicos
    const allowedOrigins = [
      'http://localhost',
      'http://localhost:8100',
      'http://localhost:4200',
      'capacitor://localhost',
      'http://192.168.1.252:8100',
      'http://192.168.1.252:4200',
      'http://192.168.1.252:4000',
      'http://10.0.2.2:4000',
      'http://10.0.2.2:8100',
      'http://10.0.2.2:4200'
    ];
    
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
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
