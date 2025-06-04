const router      = require('express').Router();
const authJwt     = require('../middleware/authJwt');
const ctrl        = require('../controllers/userController');
const { body }    = require('express-validator');
const validate    = require('../middleware/validate');

// Obtención y gestión de usuarios
router.get('/',            authJwt, ctrl.listAll);
router.get('/me',          authJwt, ctrl.me);
router.get('/:id',         authJwt, ctrl.getById);
router.put('/:id',         authJwt, ctrl.update);
router.put('/:id/deactivate', authJwt, ctrl.deactivate);

// Actualizar foto de usuario
router.put(
  '/me/photo',
  authJwt,
  [
    body('foto')
      .notEmpty()
      .withMessage('La foto es requerida')
      .custom((value) => {
        if (!value.startsWith('data:image/')) {
          throw new Error('La foto debe ser una imagen en formato base64');
        }
        return true;
      })
  ],
  validate,
  ctrl.updatePhoto
);

module.exports = router;
