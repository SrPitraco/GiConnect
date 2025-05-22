// backend/src/middleware/verifyRole.js

/**
 * Middleware para permitir sólo a ciertos roles.
 * @param {string[]} rolesPermitidos e.g. ['maestro']
 */
module.exports = function verifyRole(rolesPermitidos = []) {
  return (req, res, next) => {
    // `req.role` viene de authJwt
    if (!rolesPermitidos.includes(req.role)) {
      return res
        .status(403)
        .json({ error: 'Acceso denegado: permiso insuficiente' });
    }
    next();
  };
};
