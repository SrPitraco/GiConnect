const router       = require('express').Router();
const authJwt      = require('../middleware/authJwt');
const verifyRole   = require('../middleware/verifyRole');
const { body }     = require('express-validator');
const validate     = require('../middleware/validate');
const ctrl         = require('../controllers/claseController');

/**
 * @swagger
 * /api/clases:
 *   get:
 *     summary: Obtiene la lista de todas las clases
 *     tags: [Clases]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: No autorizado
 */
router.get('/',           authJwt, ctrl.list);

/**
 * @swagger
 * /api/clases/semana:
 *   get:
 *     summary: Obtiene las clases de la semana actual
 *     tags: [Clases]
 *     security:
 *       - bearerAuth: []
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
router.get('/semana',     authJwt, ctrl.listSemana);

/**
 * @swagger
 * /api/clases/especiales:
 *   get:
 *     summary: Obtiene las clases especiales hasta una fecha específica
 *     tags: [Clases]
 *     security:
 *       - bearerAuth: []
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
router.get('/especiales', authJwt, ctrl.getClasesEspeciales);

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
router.get('/para-pasar-lista', authJwt, verifyRole(['maestro', 'admin']), ctrl.getClasesParaPasarLista);

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
router.post(
  '/',
  authJwt,
  verifyRole(['maestro', 'admin']),
  [
    body('titulo')
      .notEmpty()
      .withMessage('Título es obligatorio'),
    body('diaSemana')
      .optional()
      .isIn(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'])
      .withMessage('Día de la semana inválido'),
    body('horaInicio')
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Hora inicio debe tener formato HH:mm'),
    body('horaFin')
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Hora fin debe tener formato HH:mm'),
    body('fecha')
      .optional()
      .isISO8601()
      .withMessage('Fecha debe tener formato ISO'),
    body('maxPlazas')
      .optional()
      .isInt({ min: 1 })
      .withMessage('maxPlazas debe ser un entero ≥ 1')
  ],
  validate,
  ctrl.create
);

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
router.put(
  '/:id',
  authJwt,
  verifyRole(['maestro', 'admin']),
  [
    body('titulo')
      .optional()
      .notEmpty()
      .withMessage('Título no puede estar vacío'),
    body('diaSemana')
      .optional()
      .isIn(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'])
      .withMessage('Día de la semana inválido'),
    body('horaInicio')
      .optional()
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Hora inicio debe tener formato HH:mm'),
    body('horaFin')
      .optional()
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Hora fin debe tener formato HH:mm'),
    body('fecha')
      .optional()
      .isISO8601()
      .withMessage('Fecha debe tener formato ISO'),
    body('maxPlazas')
      .optional()
      .isInt({ min: 1 })
      .withMessage('maxPlazas debe ser un entero ≥ 1')
  ],
  validate,
  ctrl.update
);

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
router.delete('/:id', authJwt, verifyRole(['maestro', 'admin']), ctrl.remove);

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
router.post('/generar-semana', authJwt, verifyRole(['maestro', 'admin']), ctrl.generarClasesSemana);

/**
 * @swagger
 * /api/clases/{claseId}/confirmar-asistencia:
 *   post:
 *     summary: Confirma la asistencia de los alumnos a una clase (solo para maestros y admin)
 *     tags: [Clases]
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
 *         description: Asistencia confirmada exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos suficientes
 *       404:
 *         description: Clase no encontrada
 */
router.post('/:claseId/confirmar-asistencia', authJwt, verifyRole(['maestro', 'admin']), ctrl.confirmarAsistencia);

module.exports = router;
