const router       = require('express').Router();
const authJwt      = require('../middleware/authJwt');
const verifyRole   = require('../middleware/verifyRole');
const ctrl         = require('../controllers/claseController');

//Cualquiera puede ver
router.get('/',           authJwt, ctrl.list);
router.get('/semana',     authJwt, ctrl.listSemana);

// Solo MAESTRO puede crear, modificar, eliminar
router.post('/',      authJwt, verifyRole(['maestro']), ctrl.create);
router.put('/:id',    authJwt, verifyRole(['maestro']), ctrl.update);
router.delete('/:id', authJwt, verifyRole(['maestro']), ctrl.remove);


module.exports = router;
