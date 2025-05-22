const router      = require('express').Router();
const authJwt     = require('../middleware/authJwt');
const ctrl        = require('../controllers/userController');

// Obtención y gestión de usuarios
router.get('/',            authJwt, ctrl.listAll);
router.get('/me',          authJwt, ctrl.me);
router.get('/:id',         authJwt, ctrl.getById);
router.put('/:id',         authJwt, ctrl.update);
router.put('/:id/deactivate', authJwt, ctrl.deactivate);

module.exports = router;
