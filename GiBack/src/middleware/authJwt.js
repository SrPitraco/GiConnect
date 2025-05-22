// backend/src/middleware/authJwt.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = function authJwt(req, res, next) {
  // 1) Comprueba que venga el header Authorization
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // 2) Debe venir en formato "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Token malformado' });
  }

  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: 'Formato de token inválido' });
  }

  // 3) Verifica el token
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido' });
    }
    // 4) Guarda en la request el id y rol para usar después
    req.userId = decoded.id;
    req.role   = decoded.role;
    next();
  });
};
