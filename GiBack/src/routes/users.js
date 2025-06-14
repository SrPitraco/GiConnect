const router      = require('express').Router();
const authJwt     = require('../middleware/authJwt');
const ctrl        = require('../controllers/userController');
const { body }    = require('express-validator');
const validate    = require('../middleware/validate');

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtiene la lista de todos los usuarios
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   nombre:
 *                     type: string
 *                   apellido1:
 *                     type: string
 *                   email:
 *                     type: string
 *                   rol:
 *                     type: string
 *                     enum: [atleta, maestro, admin]
 *                   foto:
 *                     type: string
 *                   activo:
 *                     type: boolean
 *       401:
 *         description: No autorizado
 */
router.get('/',            authJwt, ctrl.listAll);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Obtiene la información del usuario autenticado
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información del usuario obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 nombre:
 *                   type: string
 *                 apellido1:
 *                   type: string
 *                 email:
 *                   type: string
 *                 rol:
 *                   type: string
 *                   enum: [atleta, maestro, admin]
 *                 foto:
 *                   type: string
 *                 activo:
 *                   type: boolean
 *       401:
 *         description: No autorizado
 */
router.get('/me',          authJwt, ctrl.me);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtiene la información de un usuario específico
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Información del usuario obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 nombre:
 *                   type: string
 *                 apellido1:
 *                   type: string
 *                 email:
 *                   type: string
 *                 rol:
 *                   type: string
 *                   enum: [atleta, maestro, admin]
 *                 foto:
 *                   type: string
 *                 activo:
 *                   type: boolean
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/:id',         authJwt, ctrl.getById);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Actualiza la información de un usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               apellido1:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               telefono:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/:id',         authJwt, ctrl.update);

/**
 * @swagger
 * /api/users/{id}/deactivate:
 *   put:
 *     summary: Desactiva un usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario desactivado exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/:id/deactivate', authJwt, ctrl.deactivate);

/**
 * @swagger
 * /api/users/me/photo:
 *   put:
 *     summary: Actualiza la foto de perfil del usuario autenticado
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - foto
 *             properties:
 *               foto:
 *                 type: string
 *                 description: Imagen en formato base64
 *     responses:
 *       200:
 *         description: Foto actualizada exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autorizado
 */
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
