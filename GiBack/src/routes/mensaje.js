const router      = require('express').Router();
const authJwt     = require('../middleware/authJwt');
const ctrl        = require('../controllers/mensajeController');

// Enviar mensaje y listar por conversación
router.post('/',             authJwt, ctrl.create);
router.get('/conversacion/:userId', authJwt, ctrl.listConversation);

module.exports = router;
