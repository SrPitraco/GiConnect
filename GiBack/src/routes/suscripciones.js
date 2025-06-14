const router      = require('express').Router();
const authJwt     = require('../middleware/authJwt');
const verifyRole  = require('../middleware/verifyRole');
const { body, param } = require('express-validator');
const validate    = require('../middleware/validate');
const ctrl        = require('../controllers/suscripcionController');

/**
 * @swagger
 * /api/suscripciones:
 *   post:
 *     summary: Crea una nueva suscripción (atleta)
 *     tags: [Suscripciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tipo
 *             properties:
 *               tipo:
 *                 type: string
 *                 enum: [mensual, trimestral, semestral, anual]
 *                 description: Tipo de suscripción
 *     responses:
 *       201:
 *         description: Suscripción creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 atleta:
 *                   type: string
 *                 tipo:
 *                   type: string
 *                 inicio:
 *                   type: string
 *                   format: date-time
 *                 fin:
 *                   type: string
 *                   format: date-time
 *                 avisado:
 *                   type: boolean
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autorizado
 */
router.post(
  '/',
  authJwt,
  [
    body('tipo')
      .isIn(['mensual','trimestral', 'semestral', 'anual'])
      .withMessage('Tipo debe ser mensual, trimestral, semestral o anual')
  ],
  validate,
  ctrl.create
);

/**
 * @swagger
 * /api/suscripciones:
 *   get:
 *     summary: Lista las suscripciones del usuario autenticado
 *     tags: [Suscripciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de suscripciones obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   tipo:
 *                     type: string
 *                   inicio:
 *                     type: string
 *                     format: date-time
 *                   fin:
 *                     type: string
 *                     format: date-time
 *                   avisado:
 *                     type: boolean
 *       401:
 *         description: No autorizado
 */
router.get('/', authJwt, ctrl.listUser);

/**
 * @swagger
 * /api/suscripciones/all:
 *   get:
 *     summary: Lista todas las suscripciones (solo maestros)
 *     tags: [Suscripciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todas las suscripciones obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   atleta:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       nombre:
 *                         type: string
 *                   tipo:
 *                     type: string
 *                   inicio:
 *                     type: string
 *                     format: date-time
 *                   fin:
 *                     type: string
 *                     format: date-time
 *                   avisado:
 *                     type: boolean
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos suficientes
 */
router.get(
  '/all',
  authJwt,
  verifyRole(['maestro']),
  ctrl.listAll
);

/**
 * @swagger
 * /api/suscripciones/{id}/avisado:
 *   put:
 *     summary: Marca una suscripción como avisada (solo maestros)
 *     tags: [Suscripciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la suscripción
 *     responses:
 *       200:
 *         description: Suscripción marcada como avisada exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos suficientes
 *       404:
 *         description: Suscripción no encontrada
 */
router.put(
  '/:id/avisado',
  authJwt,
  verifyRole(['maestro']),
  [
    param('id').isMongoId().withMessage('ID inválido')
  ],
  validate,
  ctrl.markAvisado
);

/**
 * @swagger
 * /api/suscripciones/{id}:
 *   delete:
 *     summary: Elimina una suscripción (solo maestros)
 *     tags: [Suscripciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la suscripción
 *     responses:
 *       200:
 *         description: Suscripción eliminada exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos suficientes
 *       404:
 *         description: Suscripción no encontrada
 */
router.delete(
  '/:id',
  authJwt,
  verifyRole(['maestro']),
  [
    param('id').isMongoId().withMessage('ID inválido')
  ],
  validate,
  ctrl.remove
);

/**
 * @swagger
 * /api/suscripciones/activas:
 *   get:
 *     summary: Lista las suscripciones activas del usuario autenticado
 *     tags: [Suscripciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de suscripciones activas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   tipo:
 *                     type: string
 *                   inicio:
 *                     type: string
 *                     format: date-time
 *                   fin:
 *                     type: string
 *                     format: date-time
 *                   avisado:
 *                     type: boolean
 *       401:
 *         description: No autorizado
 */
router.get('/activas', authJwt, ctrl.listActivas);

module.exports = router;
