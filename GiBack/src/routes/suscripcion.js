const router      = require('express').Router();
const authJwt     = require('../middleware/authJwt');
const ctrl        = require('../controllers/suscripcionController');

// Suscripción de atleta
router.post('/',         authJwt, ctrl.create);
router.get('/',          authJwt, ctrl.listUser);

// Admin/Maestro
router.get('/all',       authJwt, ctrl.listAll);
router.put('/:id/avisado', authJwt, ctrl.markAvisado);
router.delete('/:id',    authJwt, ctrl.remove);

module.exports = router;
