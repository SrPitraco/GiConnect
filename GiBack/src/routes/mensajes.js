const router      = require('express').Router();
const authJwt     = require('../middleware/authJwt');
const { body, param } = require('express-validator');
const validate    = require('../middleware/validate');
const ctrl        = require('../controllers/mensajeController');

// Enviar mensaje
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

// Listar conversación
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
