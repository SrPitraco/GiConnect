const router    = require('express').Router();
const { body }  = require('express-validator');
const validate  = require('../middleware/validate');
const { register, login, requestPasswordReset, resetPassword } = require('../controllers/authController');

// GET /api/auth/test
router.get('/test', (req, res) => {
  res.json({ message: 'API de autenticación funcionando correctamente' });
});

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
      .notEmpty()
      .withMessage('DNI es obligatorio')
      .custom((value) => {
        // Si es el DNI especial para invitados extranjeros
        if (value === '00000000A') return true;
        
        // Validar formato: 8 números + 1 letra, sin espacios
        const dniRegex = /^[0-9]{8}[A-Za-z]$/;
        return dniRegex.test(value);
      })
      .withMessage('El DNI debe tener 8 números seguidos de una letra, sin espacios'),
    body('telefono')
      .matches(/^\+?\d{7,15}$/)
      .withMessage('Teléfono inválido'),
    body('foto')
      .optional()
      .custom((value) => {
        if (!value) return true; // Permite valores nulos
        return value.startsWith('data:image/'); // Debe ser una imagen base64
      })
      .withMessage('La foto debe ser una imagen en formato base64')
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

// POST /api/auth/request-password-reset
router.post(
  '/request-password-reset',
  [
    body('email').isEmail().withMessage('Email inválido')
  ],
  validate,
  requestPasswordReset
);

// POST /api/auth/reset-password
router.post(
  '/reset-password',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('code').notEmpty().withMessage('Código de verificación es requerido'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('La contraseña debe tener al menos 8 caracteres')
  ],
  validate,
  resetPassword
);

module.exports = router;
