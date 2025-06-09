const Clase = require('../models/Clase');
console.log('Modelo Clase cargado:', Clase);
const moment = require('moment'); // para manipular fechas

// Listar todas las clases
exports.list = async (req, res) => {
  try {
    const clases = await Clase.find()
      .populate('instructor', 'nombre')
      .populate({
        path: 'reservas',
        populate: {
          path: 'atleta',
          select: 'nombre foto'
        }
      });
    res.json(clases);
  } catch (err) {
    console.error('Error en list:', err);
    res.status(500).json({ error: err.message });
  }
};

// Listar clases de la semana actual (lunes–domingo)
exports.listSemana = async (req, res) => {
  try {
    const { fecha } = req.query;
    console.log('=== BACKEND DEBUG === Fecha recibida:', fecha);
    
    // Convertir la fecha recibida a objeto Date y ajustar a inicio del día en la zona horaria local
    const fechaInicio = new Date(fecha);
    fechaInicio.setHours(0, 0, 0, 0);
    
    // Calcular el fin de la semana (7 días después)
    const fechaFin = new Date(fechaInicio);
    fechaFin.setDate(fechaFin.getDate() + 7);
    
    console.log('=== BACKEND DEBUG === Rango de fechas:', {
      inicio: fechaInicio.toISOString(),
      fin: fechaFin.toISOString()
    });

    // 1. Buscar TODAS las clases en el rango de fechas
    const todasLasClases = await Clase.find({
      fecha: { 
        $gte: fechaInicio,
        $lt: fechaFin
      }
    })
    .populate('instructor', 'nombre foto')
    .populate({
      path: 'reservas',
      match: { status: { $in: ['pendiente', 'confirmada'] } },
      populate: {
        path: 'atleta',
        select: 'nombre foto'
      }
    });

    console.log('=== BACKEND DEBUG === Clases encontradas:', todasLasClases.length);

    // 2. Buscar clases fijas (sin fecha)
    const clasesFijas = await Clase.find({
      diaSemana: { $exists: true }
    }).populate('instructor', 'nombre foto');

    console.log('=== BACKEND DEBUG === Clases fijas encontradas:', clasesFijas.length);

    // 3. Buscar clases especiales futuras
    const clasesEspeciales = await Clase.find({
      diaSemana: { $exists: false },
      fecha: { $gte: fechaFin }
    })
    .populate('instructor', 'nombre foto')
    .populate({
      path: 'reservas',
      match: { status: { $in: ['pendiente', 'confirmada'] } },
      populate: {
        path: 'atleta',
        select: 'nombre foto'
      }
    });

    console.log('=== BACKEND DEBUG === Clases especiales futuras encontradas:', clasesEspeciales.length);
    clasesEspeciales.forEach(clase => {
      console.log('=== BACKEND DEBUG === Clase especial:', {
        id: clase._id,
        titulo: clase.titulo,
        fecha: clase.fecha,
        instructor: clase.instructor?.nombre
      });
    });

    // 4. Generar nuevas clases a partir de las fijas si no existen
    const clasesGeneradas = [];
    const diasSemana = {
      'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4, 
      'Viernes': 5, 'Sábado': 6, 'Domingo': 0
    };

    // Para cada día de la semana
    for (let i = 0; i < 7; i++) {
      const fechaClase = new Date(fechaInicio);
      fechaClase.setDate(fechaInicio.getDate() + i);
      
      // Encontrar las clases fijas para este día
      const clasesDelDia = clasesFijas.filter(clase => 
        diasSemana[clase.diaSemana] === fechaClase.getDay()
      );

      // Para cada clase fija, verificar si ya existe una clase con la misma fecha y hora
      for (const claseFija of clasesDelDia) {
        const claseExistente = todasLasClases.find(clase => {
          const fechaClaseExistente = new Date(clase.fecha);
          return fechaClaseExistente.getDate() === fechaClase.getDate() &&
                 fechaClaseExistente.getMonth() === fechaClase.getMonth() &&
                 fechaClaseExistente.getFullYear() === fechaClase.getFullYear() &&
                 clase.horaInicio === claseFija.horaInicio &&
                 clase.titulo === claseFija.titulo;
        });

        if (!claseExistente) {
          // Crear nueva clase con la fecha correcta
          const nuevaClase = new Clase({
            titulo: claseFija.titulo,
            descripcion: claseFija.descripcion,
            fecha: new Date(fechaClase),
            horaInicio: claseFija.horaInicio,
            horaFin: claseFija.horaFin,
            maxPlazas: claseFija.maxPlazas,
            instructor: claseFija.instructor._id
          });

          await nuevaClase.save();
          clasesGeneradas.push(nuevaClase);
          
          console.log(`=== BACKEND DEBUG === Clase generada:`, {
            titulo: nuevaClase.titulo,
            fecha: nuevaClase.fecha,
            diaSemana: diasSemana[claseFija.diaSemana],
            instructor: nuevaClase.instructor
          });
        }
      }
    }

    // 4. Obtener todas las clases actualizadas
    const clasesFinales = await Clase.find({
      $or: [
        {
          fecha: { 
            $gte: fechaInicio,
            $lt: fechaFin
          }
        },
        {
          _id: { $in: clasesEspeciales.map(c => c._id) }
        }
      ]
    })
    .populate('instructor', 'nombre foto')
    .populate({
      path: 'reservas',
      match: { status: { $in: ['pendiente', 'confirmada'] } },
      populate: {
        path: 'atleta',
        select: 'nombre foto'
      }
    });

    console.log('=== BACKEND DEBUG === IDs de clases especiales:', clasesEspeciales.map(c => c._id));
    console.log('=== BACKEND DEBUG === Total de clases finales:', clasesFinales.length);
    clasesFinales.forEach(clase => {
      console.log(`=== BACKEND DEBUG === Clase final "${clase.titulo}":`, {
        id: clase._id,
        fecha: clase.fecha,
        esEspecial: !clase.diaSemana,
        reservas: clase.reservas?.length || 0
      });
    });

    res.json({ 
      clases: clasesFinales,
      clasesGeneradas: clasesGeneradas.length
    });
  } catch (error) {
    console.error('Error al listar clases:', error);
    res.status(500).json({ message: 'Error al listar clases' });
  }
};

// Crear nueva clase (fija o especial)
exports.create = async (req, res) => {
  try {
    const data = { ...req.body, instructor: req.userId };
    console.log('Creando nueva clase:', data);
    const nueva = await Clase.create(data);
    console.log('Clase creada:', nueva);
    res.status(201).json(nueva);
  } catch (err) {
    console.error('Error en create:', err);
    res.status(400).json({ error: err.message });
  }
};

// Modificar clase
exports.update = async (req, res) => {
  try {
    console.log('Actualizando clase:', req.params.id, req.body);
    const updated = await Clase.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ error: 'Clase no encontrada' });
    }
    console.log('Clase actualizada:', updated);
    res.json(updated);
  } catch (err) {
    console.error('Error en update:', err);
    res.status(400).json({ error: err.message });
  }
};

// Eliminar clase
exports.remove = async (req, res) => {
  try {
    console.log('Eliminando clase:', req.params.id);
    const deleted = await Clase.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Clase no encontrada' });
    }
    console.log('Clase eliminada:', deleted);
    res.json({ message: 'Clase eliminada' });
  } catch (err) {
    console.error('Error en remove:', err);
    res.status(500).json({ error: err.message });
  }
};

// Generar clases de la semana
exports.generarClasesSemana = async (req, res) => {
  try {
    const { fecha } = req.query;
    console.log('=== BACKEND DEBUG === Generando clases para la semana de:', fecha);

    // Verificar que el usuario es maestro o admin
    if (req.role !== 'maestro' && req.role !== 'admin') {
      return res.status(403).json({ 
        message: 'No tienes permiso para generar clases' 
      });
    }

    // Obtener la fecha de inicio (lunes)
    const fechaInicio = new Date(fecha);
    fechaInicio.setHours(0, 0, 0, 0);
    
    // Obtener todas las clases fijas
    const clasesFijas = await Clase.find({
      diaSemana: { $exists: true }
    }).populate('instructor', 'nombre foto');

    console.log('=== BACKEND DEBUG === Clases fijas encontradas:', clasesFijas.length);

    // Mapeo de días de la semana a números
    const diasSemana = {
      'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4, 
      'Viernes': 5, 'Sábado': 6, 'Domingo': 0
    };

    // Generar las clases para cada día de la semana
    const clasesGeneradas = [];
    for (let i = 0; i < 7; i++) {
      const fechaClase = new Date(fechaInicio);
      fechaClase.setDate(fechaInicio.getDate() + i);
      
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
          instructor: claseFija.instructor._id
        });

        await nuevaClase.save();
        clasesGeneradas.push(nuevaClase);
        
        console.log(`=== BACKEND DEBUG === Clase generada:`, {
          titulo: nuevaClase.titulo,
          fecha: nuevaClase.fecha,
          instructor: nuevaClase.instructor
        });
      }
    }

    // Limpiar clases antiguas (anteriores a la fecha de inicio)
    const clasesEliminadas = await Clase.deleteMany({
      fecha: { $lt: fechaInicio }
    });

    console.log('=== BACKEND DEBUG === Clases antiguas eliminadas:', clasesEliminadas.deletedCount);

    res.json({
      message: 'Clases generadas correctamente',
      clasesGeneradas: clasesGeneradas.length,
      clasesEliminadas: clasesEliminadas.deletedCount
    });
  } catch (error) {
    console.error('Error al generar clases:', error);
    res.status(500).json({ message: 'Error al generar clases' });
  }
};
