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
 *       401:
 *         description: No autorizado
 */
router.get('/',           authJwt, ctrl.list);
router.get('/semana',     authJwt, ctrl.listSemana);
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
