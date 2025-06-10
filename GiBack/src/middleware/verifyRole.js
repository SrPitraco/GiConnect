// backend/src/middleware/verifyRole.js

/**
 * Middleware para permitir sólo a ciertos roles.
 * @param {string[]} rolesPermitidos e.g. ['maestro']
 */
module.exports = function verifyRole(rolesPermitidos = []) {
  return (req, res, next) => {
    console.log('=== BACKEND DEBUG === Verificando rol:', {
      role: req.role,
      rolesPermitidos
    });
    
    if (!rolesPermitidos.includes(req.role)) {
      console.log('=== BACKEND DEBUG === Acceso denegado');
      return res
        .status(403)
        .json({ error: 'Acceso denegado: permiso insuficiente' });
    }
    console.log('=== BACKEND DEBUG === Acceso permitido');
    next();
  };
};
