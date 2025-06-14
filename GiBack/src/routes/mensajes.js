const router      = require('express').Router();
const authJwt     = require('../middleware/authJwt');
const { body, param } = require('express-validator');
const validate    = require('../middleware/validate');
const ctrl        = require('../controllers/mensajeController');

/**
 * @swagger
 * /api/mensajes:
 *   post:
 *     summary: Envía un nuevo mensaje
 *     tags: [Mensajes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - para
 *             properties:
 *               para:
 *                 type: string
 *                 description: ID del destinatario del mensaje
 *               texto:
 *                 type: string
 *                 description: Contenido textual del mensaje
 *               mediaUrl:
 *                 type: string
 *                 format: uri
 *                 description: URL del contenido multimedia (imagen, video, etc.)
 *             oneOf:
 *               - required: [texto]
 *               - required: [mediaUrl]
 *     responses:
 *       201:
 *         description: Mensaje enviado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 de:
 *                   type: string
 *                 para:
 *                   type: string
 *                 texto:
 *                   type: string
 *                 mediaUrl:
 *                   type: string
 *                 fecha:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autorizado
 */
router.post(
  '/',
  authJwt,
  [
    body('para')
      .isMongoId()
      .withMessage('ID de destinatario inválido'),
    body('texto')
      .optional()
      .isString(),
    body('mediaUrl')
      .optional()
      .isURL().withMessage('mediaUrl debe ser URL'),
    body()
      .custom(body => body.texto || body.mediaUrl)
      .withMessage('Debe tener texto o mediaUrl')
  ],
  validate,
  ctrl.create
);

/**
 * @swagger
 * /api/mensajes/conversacion/{userId}:
 *   get:
 *     summary: Obtiene la conversación con un usuario específico
 *     tags: [Mensajes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario con el que se quiere ver la conversación
 *     responses:
 *       200:
 *         description: Lista de mensajes de la conversación
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   de:
 *                     type: string
 *                   para:
 *                     type: string
 *                   texto:
 *                     type: string
 *                   mediaUrl:
 *                     type: string
 *                   fecha:
 *                     type: string
 *                     format: date-time
 *       400:
 *         description: ID de usuario inválido
 *       401:
 *         description: No autorizado
 */
router.get(
  '/conversacion/:userId',
  authJwt,
  [
    param('userId').isMongoId().withMessage('ID de usuario inválido')
  ],
  validate,
  ctrl.listConversation
);

module.exports = router;
