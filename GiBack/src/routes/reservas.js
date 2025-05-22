const router       = require('express').Router();
const authJwt      = require('../middleware/authJwt');
const verifyRole   = require('../middleware/verifyRole');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const ctrl         = require('../controllers/reservaController');

// Listar reservas del propio usuario
router.get('/',              authJwt, ctrl.listUser);

// Crear reserva
router.post(
  '/',
  authJwt,
  [
    body('clase')
      .isMongoId()
      .withMessage('clase debe ser un ID de Mongo válido')
  ],
  validate,
  ctrl.create
);

// Cancelar reserva (sólo atleta, si falta >2h)
router.put('/:id/cancel',    authJwt, ctrl.cancel);

// **Confirmar asistencia (pasar lista)**  
// Sólo maestro e instructor
router.put(
  '/:id/confirm',
  authJwt,
  verifyRole(['maestro','instructor']),
  ctrl.confirmAttendance
);

module.exports = router;
