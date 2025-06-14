const router    = require('express').Router();
const { body }  = require('express-validator');
const validate  = require('../middleware/validate');
const { register, login, requestPasswordReset, resetPassword } = require('../controllers/authController');

/**
 * @swagger
 * /api/auth/test:
 *   get:
 *     summary: Prueba de la API de autenticación
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: API funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: API de autenticación funcionando correctamente
 */
router.get('/test', (req, res) => {
  res.json({ message: 'API de autenticación funcionando correctamente' });
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registra un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - nombre
 *               - apellido1
 *               - dni
 *               - telefono
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               nombre:
 *                 type: string
 *               apellido1:
 *                 type: string
 *               dni:
 *                 type: string
 *                 pattern: '^[0-9]{8}[A-Za-z]$'
 *               telefono:
 *                 type: string
 *                 pattern: '^\+?\d{7,15}$'
 *               foto:
 *                 type: string
 *                 description: Imagen en formato base64
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 */
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

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Inicia sesión de usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       400:
 *         description: Credenciales inválidas
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('Password es obligatorio')
  ],
  validate,
  login
);

/**
 * @swagger
 * /api/auth/request-password-reset:
 *   post:
 *     summary: Solicita un código de restablecimiento de contraseña
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Código enviado exitosamente
 *       400:
 *         description: Email inválido
 */
router.post(
  '/request-password-reset',
  [
    body('email').isEmail().withMessage('Email inválido')
  ],
  validate,
  requestPasswordReset
);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Restablece la contraseña usando el código de verificación
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               code:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Contraseña restablecida exitosamente
 *       400:
 *         description: Datos inválidos o código expirado
 */
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
