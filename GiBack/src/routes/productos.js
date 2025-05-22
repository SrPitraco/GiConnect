const router      = require('express').Router();
const authJwt     = require('../middleware/authJwt');
const verifyRole  = require('../middleware/verifyRole');
const { body, param } = require('express-validator');
const validate    = require('../middleware/validate');
const ctrl        = require('../controllers/productoController');

// Listar y ver (público)
router.get('/', ctrl.list);
router.get(
  '/:id',
  [
    param('id').isMongoId().withMessage('ID inválido')
  ],
  validate,
  ctrl.getById
);

// Crear (solo maestro)
router.post(
  '/',
  authJwt,
  verifyRole(['maestro']),
  [
    body('nombre').notEmpty().withMessage('Nombre es obligatorio'),
    body('descripcion').optional().isString(),
    body('precio').isFloat({ gt: 0 }).withMessage('Precio debe ser > 0'),
    body('foto').optional().isURL().withMessage('Foto debe ser URL'),
    body('disponible').optional().isBoolean()
  ],
  validate,
  ctrl.create
);

// Actualizar (solo maestro)
router.put(
  '/:id',
  authJwt,
  verifyRole(['maestro']),
  [
    param('id').isMongoId().withMessage('ID inválido'),
    body('nombre').optional().notEmpty(),
    body('descripcion').optional().isString(),
    body('precio').optional().isFloat({ gt: 0 }),
    body('foto').optional().isURL(),
    body('disponible').optional().isBoolean()
  ],
  validate,
  ctrl.update
);

// Eliminar (solo maestro)
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

module.exports = router;
