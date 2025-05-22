const router      = require('express').Router();
const authJwt     = require('../middleware/authJwt');
const verifyRole  = require('../middleware/verifyRole');
const { body, param } = require('express-validator');
const validate    = require('../middleware/validate');
const ctrl        = require('../controllers/pedidoController');

// Crear pedido (atleta)
router.post(
  '/',
  authJwt,
  [
    body('productos')
      .isArray({ min: 1 })
      .withMessage('Productos debe ser un array no vacío'),
    body('productos.*.producto')
      .isMongoId()
      .withMessage('ID de producto inválido'),
    body('productos.*.cantidad')
      .isInt({ gt: 0 })
      .withMessage('Cantidad debe ser entero > 0'),
    body('total')
      .isFloat({ min: 0 })
      .withMessage('Total debe ser ≥ 0')
  ],
  validate,
  ctrl.create
);

// Listar mis pedidos (atleta)
router.get('/', authJwt, ctrl.listUser);

// Listar todos (maestro)
router.get(
  '/all',
  authJwt,
  verifyRole(['maestro']),
  ctrl.listAll
);

// Obtener por ID (maestro o propio atleta)
router.get(
  '/:id',
  authJwt,
  [
    param('id').isMongoId().withMessage('ID inválido')
  ],
  validate,
  ctrl.getById
);

// Actualizar estado (maestro)
router.put(
  '/:id/status',
  authJwt,
  verifyRole(['maestro']),
  [
    param('id').isMongoId().withMessage('ID inválido'),
    body('status')
      .isIn(['pendiente','pagado','enviado'])
      .withMessage('Status inválido')
  ],
  validate,
  ctrl.updateStatus
);

module.exports = router;
