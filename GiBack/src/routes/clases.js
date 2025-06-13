const router       = require('express').Router();
const authJwt      = require('../middleware/authJwt');
const verifyRole   = require('../middleware/verifyRole');
const { body }     = require('express-validator');
const validate     = require('../middleware/validate');
const ctrl         = require('../controllers/claseController');

// Cualquiera puede ver las clases (solo necesita estar autenticado)
router.get('/',           authJwt, ctrl.list);
router.get('/semana',     authJwt, ctrl.listSemana);
router.get('/para-pasar-lista', authJwt, verifyRole(['maestro', 'admin']), ctrl.getClasesParaPasarLista);

// Solo MAESTRO y ADMIN pueden crear, modificar, eliminar
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

router.delete('/:id', authJwt, verifyRole(['maestro', 'admin']), ctrl.remove);

router.post('/:claseId/confirmar-asistencia', authJwt, verifyRole(['maestro', 'admin']), ctrl.confirmarAsistencia);

module.exports = router;
