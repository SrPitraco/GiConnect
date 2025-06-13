const express = require('express');
const router = express.Router();
const claseController = require('../controllers/claseController');
const { authJwt } = require('../middleware');
const { verificarToken, esMaestro } = require('../middleware/auth');

// Rutas públicas
router.get('/', claseController.list);
router.get('/semana', claseController.listSemana);

// Rutas protegidas
router.post('/', [authJwt.verifyToken, authJwt.isMaestroOrAdmin], claseController.create);
router.put('/:id', [authJwt.verifyToken, authJwt.isMaestroOrAdmin], claseController.update);
router.delete('/:id', [authJwt.verifyToken, authJwt.isMaestroOrAdmin], claseController.remove);

// Nueva ruta para generar clases semanales
router.post('/generar-semana', [authJwt.verifyToken, authJwt.isMaestroOrAdmin], claseController.generarClasesSemana);

// Rutas protegidas que requieren autenticación y rol de maestro
router.get('/para-pasar-lista', verificarToken, esMaestro, claseController.getClasesParaPasarLista);

module.exports = router; 