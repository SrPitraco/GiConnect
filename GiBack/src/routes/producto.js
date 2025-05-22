const router      = require('express').Router();
const authJwt     = require('../middleware/authJwt');
const ctrl        = require('../controllers/productoController');

// Listar y ver (público)
router.get('/',        ctrl.list);
router.get('/:id',     ctrl.getById);

// CRUD (autenticado)
router.post('/',       authJwt, ctrl.create);
router.put('/:id',     authJwt, ctrl.update);
router.delete('/:id',  authJwt, ctrl.remove);

module.exports = router;
