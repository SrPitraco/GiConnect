const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reservaController');
const authJwt = require('../middleware/authJwt');
const verifyRole = require('../middleware/verifyRole');

// Crear una nueva reserva (cualquier usuario autenticado)
router.post('/', authJwt, reservaController.create);

// Crear una nueva reserva (solo maestros y admin)
router.post('/admin', 
  authJwt,
  verifyRole(['maestro', 'admin']), 
  reservaController.createAdminReserva
);

// Crear una nueva reserva múltiple (solo maestros y admin)
router.post('/multiple', 
  authJwt,
  verifyRole(['maestro', 'admin']), 
  reservaController.createMultipleReserva
);

// Cancelar una reserva (el propietario o admin/maestro)
router.delete('/:id', authJwt, reservaController.cancel);

// Confirmar asistencia (solo maestros y admin)
router.post('/:id/asistencia', 
  authJwt,
  verifyRole(['maestro', 'admin']), 
  reservaController.confirmarAsistencia
);

// Obtener reservas de una clase (solo maestros y admin)
router.get('/clase/:claseId', 
  authJwt, 
  verifyRole(['maestro', 'admin']), 
  reservaController.getByClase
);

// Limpiar reservas antiguas (solo maestros y admin)
router.post('/limpiar', 
  authJwt,
  verifyRole(['maestro', 'admin']), 
  reservaController.limpiarReservasAntiguas
);

module.exports = router;
