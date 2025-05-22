const router       = require('express').Router();
const authJwt      = require('../middleware/authJwt');
const ctrl         = require('../controllers/claseController');

router.get('/',           authJwt, ctrl.list);
router.get('/semana',     authJwt, ctrl.listSemana);
router.post('/',          authJwt, ctrl.create);
router.put('/:id',        authJwt, ctrl.update);
router.delete('/:id',     authJwt, ctrl.remove);

module.exports = router;
