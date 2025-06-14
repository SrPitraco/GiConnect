const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reservaController');
const authJwt = require('../middleware/authJwt');
const verifyRole = require('../middleware/verifyRole');

/**
 * @swagger
 * /api/reservas:
 *   post:
 *     summary: Crea una nueva reserva (cualquier usuario autenticado)
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clase
 *             properties:
 *               clase:
 *                 type: string
 *                 description: ID de la clase a reservar
 *     responses:
 *       201:
 *         description: Reserva creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 clase:
 *                   type: string
 *                 atleta:
 *                   type: string
 *                 fecha:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autorizado
 *       409:
 *         description: Clase llena o ya reservada
 */
router.post('/', authJwt, reservaController.create);

/**
 * @swagger
 * /api/reservas/admin:
 *   post:
 *     summary: Crea una nueva reserva como administrador (solo maestros y admin)
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clase
 *               - atleta
 *             properties:
 *               clase:
 *                 type: string
 *                 description: ID de la clase
 *               atleta:
 *                 type: string
 *                 description: ID del atleta
 *     responses:
 *       201:
 *         description: Reserva creada exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos suficientes
 */
router.post('/admin', 
  authJwt,
  verifyRole(['maestro', 'admin']), 
  reservaController.createAdminReserva
);

/**
 * @swagger
 * /api/reservas/multiple:
 *   post:
 *     summary: Crea múltiples reservas (solo maestros y admin)
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clase
 *               - atletas
 *             properties:
 *               clase:
 *                 type: string
 *                 description: ID de la clase
 *               atletas:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array de IDs de atletas
 *     responses:
 *       201:
 *         description: Reservas creadas exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos suficientes
 */
router.post('/multiple', 
  authJwt,
  verifyRole(['maestro', 'admin']), 
  reservaController.createMultipleReserva
);

/**
 * @swagger
 * /api/reservas/{id}:
 *   delete:
 *     summary: Cancela una reserva (el propietario o admin/maestro)
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la reserva
 *     responses:
 *       200:
 *         description: Reserva cancelada exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos para cancelar esta reserva
 *       404:
 *         description: Reserva no encontrada
 */
router.delete('/:id', authJwt, reservaController.cancel);

/**
 * @swagger
 * /api/reservas/{id}/asistencia:
 *   post:
 *     summary: Confirma la asistencia a una clase (solo maestros y admin)
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la reserva
 *     responses:
 *       200:
 *         description: Asistencia confirmada exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos suficientes
 *       404:
 *         description: Reserva no encontrada
 */
router.post('/:id/asistencia', 
  authJwt,
  verifyRole(['maestro', 'admin']), 
  reservaController.confirmarAsistencia
);

/**
 * @swagger
 * /api/reservas/clase/{claseId}:
 *   get:
 *     summary: Obtiene todas las reservas de una clase (solo maestros y admin)
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: claseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la clase
 *     responses:
 *       200:
 *         description: Lista de reservas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   clase:
 *                     type: string
 *                   atleta:
 *                     type: string
 *                   asistenciaConfirmada:
 *                     type: boolean
 *                   fecha:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos suficientes
 *       404:
 *         description: Clase no encontrada
 */
router.get('/clase/:claseId', 
  authJwt, 
  verifyRole(['maestro', 'admin']), 
  reservaController.getByClase
);

/**
 * @swagger
 * /api/reservas/limpiar:
 *   post:
 *     summary: Limpia las reservas antiguas (solo maestros y admin)
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reservas antiguas eliminadas exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos suficientes
 */
router.post('/limpiar', 
  authJwt,
  verifyRole(['maestro', 'admin']), 
  reservaController.limpiarReservasAntiguas
);

module.exports = router;
