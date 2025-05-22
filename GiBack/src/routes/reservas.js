const router  = require('express').Router();
const authJwt = require('../middleware/authJwt');
const ctrl    = require('../controllers/reservaController');

router.get('/',              authJwt, ctrl.listUser);
router.post('/',             authJwt, ctrl.create);
router.put('/:id/cancel',    authJwt, ctrl.cancel);

module.exports = router;
