const router      = require('express').Router();
const authJwt     = require('../middleware/authJwt');
const ctrl        = require('../controllers/pedidoController');

// Crear y listar (autenticado)
router.post('/',        authJwt, ctrl.create);
router.get('/',         authJwt, ctrl.listUser);

// Rutas de administrador/maestro
router.get('/all',      authJwt, ctrl.listAll);
router.get('/:id',      authJwt, ctrl.getById);
router.put('/:id/status', authJwt, ctrl.updateStatus);

module.exports = router;
