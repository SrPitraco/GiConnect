const router    = require('express').Router();
const { body }  = require('express-validator');
const validate  = require('../middleware/validate');
const { register, login } = require('../controllers/authController');

// POST /api/auth/register
router.post(
  '/register',
  [
    // Validaciones
    body('email').isEmail().withMessage('Email inválido'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('La contraseña debe tener al menos 8 caracteres'),
    body('nombre').notEmpty().withMessage('Nombre es obligatorio'),
    body('apellido1').notEmpty().withMessage('Apellido1 es obligatorio'),
    body('dni')
      .optional()
      .isLength({ min: 8, max: 9 })
      .withMessage('DNI debe tener 8-9 caracteres'),
    body('telefono')
      .matches(/^\+?\d{7,15}$/)
      .withMessage('Teléfono inválido'),
    body('foto')
      .optional()
      .isURL()
      .withMessage('Foto debe ser una URL válida')
  ],
  validate,     // si hay errores devuelve 400 con detalles
  register
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('Password es obligatorio')
  ],
  validate,
  login
);

module.exports = router;
