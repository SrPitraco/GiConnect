const router       = require('express').Router();
const authJwt      = require('../middleware/authJwt');
const verifyRole   = require('../middleware/verifyRole');
const { body }   = require('express-validator');
const validate   = require('../middleware/validate');
const ctrl         = require('../controllers/claseController');

//Cualquiera puede ver
router.get('/',           authJwt, ctrl.list);
router.get('/semana',     authJwt, ctrl.listSemana);

// Solo MAESTRO puede crear, modificar, eliminar
router.post(
  '/',
  authJwt,
  verifyRole(['maestro']),
  [
    body('titulo').notEmpty().withMessage('Título es obligatorio'),
    body('diasSemana')
      .optional()
      .isArray({ min: 1 })
      .withMessage('DiasSemana debe ser un array no vacío'),
    body('diasSemana.*')
      .isIn(['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo']),
    body('horaInicio')
      .matches(/^\d{2}:\d{2}$/)
      .withMessage('Hora inicio formato HH:mm'),
    body('horaFin')
      .matches(/^\d{2}:\d{2}$/)
      .withMessage('Hora fin formato HH:mm'),
    body('maxPlazas')
      .isInt({ min: 1 })
      .withMessage('maxPlazas debe ser un entero ≥ 1')
  ],
  validate,
  ctrl.create
);
router.put('/:id',    authJwt, verifyRole(['maestro']), ctrl.update);
router.delete('/:id', authJwt, verifyRole(['maestro']), ctrl.remove);


module.exports = router;
