const express = require('express');
const router = express.Router();
const claseController = require('../controllers/claseController');
const { authJwt } = require('../middleware');
const { verificarToken, esMaestro } = require('../middleware/auth');

/**
 * @swagger
 * /api/clases:
 *   get:
 *     summary: Obtiene la lista de todas las clases
 *     tags: [Clases]
 *     responses:
 *       200:
 *         description: Lista de clases obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   titulo:
 *                     type: string
 *                   fecha:
 *                     type: string
 *                     format: date-time
 *                   horaInicio:
 *                     type: string
 *                   horaFin:
 *                     type: string
 *                   maxPlazas:
 *                     type: integer
 *                   instructor:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       nombre:
 *                         type: string
 *                       foto:
 *                         type: string
 */
router.get('/', claseController.list);

/**
 * @swagger
 * /api/clases/semana:
 *   get:
 *     summary: Obtiene las clases de la semana actual
 *     tags: [Clases]
 *     responses:
 *       200:
 *         description: Clases de la semana obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clases:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       titulo:
 *                         type: string
 *                       fecha:
 *                         type: string
 *                         format: date-time
 *                       horaInicio:
 *                         type: string
 *                       horaFin:
 *                         type: string
 *                       maxPlazas:
 *                         type: integer
 *                       instructor:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           nombre:
 *                             type: string
 *                           foto:
 *                             type: string
 *                       reservas:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                             atleta:
 *                               type: object
 *                               properties:
 *                                 _id:
 *                                   type: string
 *                                 nombre:
 *                                   type: string
 *                                 foto:
 *                                   type: string
 *                             status:
 *                               type: string
 *                               enum: [pendiente, confirmada, cancelada]
 */
router.get('/semana', claseController.listSemana);

/**
 * @swagger
 * /api/clases:
 *   post:
 *     summary: Crea una nueva clase (solo para maestros y admin)
 *     tags: [Clases]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *               - horaInicio
 *               - horaFin
 *             properties:
 *               titulo:
 *                 type: string
 *               diaSemana:
 *                 type: string
 *                 enum: [Lunes, Martes, Miércoles, Jueves, Viernes, Sábado, Domingo]
 *               horaInicio:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *               horaFin:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *               fecha:
 *                 type: string
 *                 format: date-time
 *               maxPlazas:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       201:
 *         description: Clase creada exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos suficientes
 */
router.post('/', [authJwt.verifyToken, authJwt.isMaestroOrAdmin], claseController.create);

/**
 * @swagger
 * /api/clases/{id}:
 *   put:
 *     summary: Actualiza una clase existente (solo para maestros y admin)
 *     tags: [Clases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la clase
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               diaSemana:
 *                 type: string
 *                 enum: [Lunes, Martes, Miércoles, Jueves, Viernes, Sábado, Domingo]
 *               horaInicio:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *               horaFin:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *               fecha:
 *                 type: string
 *                 format: date-time
 *               maxPlazas:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Clase actualizada exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos suficientes
 *       404:
 *         description: Clase no encontrada
 */
router.put('/:id', [authJwt.verifyToken, authJwt.isMaestroOrAdmin], claseController.update);

/**
 * @swagger
 * /api/clases/{id}:
 *   delete:
 *     summary: Elimina una clase (solo para maestros y admin)
 *     tags: [Clases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la clase
 *     responses:
 *       200:
 *         description: Clase eliminada exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos suficientes
 *       404:
 *         description: Clase no encontrada
 */
router.delete('/:id', [authJwt.verifyToken, authJwt.isMaestroOrAdmin], claseController.remove);

/**
 * @swagger
 * /api/clases/generar-semana:
 *   post:
 *     summary: Genera las clases para la semana actual (solo para maestros y admin)
 *     tags: [Clases]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fecha:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de inicio de la semana (lunes)
 *     responses:
 *       200:
 *         description: Clases generadas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clasesGeneradas:
 *                   type: integer
 *                   description: Número de clases generadas
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos suficientes
 */
router.post('/generar-semana', [authJwt.verifyToken, authJwt.isMaestroOrAdmin], claseController.generarClasesSemana);

/**
 * @swagger
 * /api/clases/para-pasar-lista:
 *   get:
 *     summary: Obtiene las clases disponibles para pasar lista (solo para maestros)
 *     tags: [Clases]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Clases obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   titulo:
 *                     type: string
 *                   fecha:
 *                     type: string
 *                     format: date-time
 *                   horaInicio:
 *                     type: string
 *                   horaFin:
 *                     type: string
 *                   instructor:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       nombre:
 *                         type: string
 *                       foto:
 *                         type: string
 *                   reservas:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         atleta:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                             nombre:
 *                               type: string
 *                             apellidos:
 *                               type: string
 *                             foto:
 *                               type: string
 *                         status:
 *                           type: string
 *                           enum: [pendiente, confirmada, cancelada]
 *                         asistenciaConfirmada:
 *                           type: boolean
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos suficientes
 */
router.get('/para-pasar-lista', verificarToken, esMaestro, claseController.getClasesParaPasarLista);

/**
 * @swagger
 * /api/clases/especiales:
 *   get:
 *     summary: Obtiene las clases especiales hasta una fecha específica
 *     tags: [Clases]
 *     parameters:
 *       - in: query
 *         name: fecha
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha límite para buscar clases especiales
 *     responses:
 *       200:
 *         description: Lista de clases especiales obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   titulo:
 *                     type: string
 *                   fecha:
 *                     type: string
 *                     format: date-time
 *                   horaInicio:
 *                     type: string
 *                   horaFin:
 *                     type: string
 *                   maxPlazas:
 *                     type: integer
 *                   instructor:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       nombre:
 *                         type: string
 *                       foto:
 *                         type: string
 *                   reservas:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         atleta:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                             nombre:
 *                               type: string
 *                             foto:
 *                               type: string
 *                         status:
 *                           type: string
 *                           enum: [pendiente, confirmada, cancelada]
 */
router.get('/especiales', claseController.getClasesEspeciales);

module.exports = router; 