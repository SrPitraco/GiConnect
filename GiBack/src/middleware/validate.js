// backend/src/middleware/validate.js
const { validationResult } = require('express-validator');

/**
 * Middleware que comprueba el resultado de los validadores
 */
module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Devolver array de errores
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
