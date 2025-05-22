const router      = require('express').Router();
const authJwt     = require('../middleware/authJwt');
const verifyRole  = require('../middleware/verifyRole');
const { body, param } = require('express-validator');
const validate    = require('../middleware/validate');
const ctrl        = require('../controllers/suscripcionController');

// Crear suscripción (atleta)
router.post(
  '/',
  authJwt,
  [
    body('tipo')
      .isIn(['mensual','trimestral','anual'])
      .withMessage('Tipo debe ser mensual, trimestral o anual')
  ],
  validate,
  ctrl.create
);

// Listar propias (atleta)
router.get('/', authJwt, ctrl.listUser);

// Listar todas (maestro)
router.get(
  '/all',
  authJwt,
  verifyRole(['maestro']),
  ctrl.listAll
);

// Marcar avisado (maestro)
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

// Eliminar suscripción (maestro)
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
