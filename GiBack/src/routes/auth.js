// backend/src/routes/auth.js
const router         = require('express').Router();
const { register, login } = require('../controllers/authController');

// Rutas públicas de autenticación
router.post('/register', register);
router.post('/login',    login);

module.exports = router;
