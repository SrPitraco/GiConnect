const User = require('../models/User');

// Listar todos los usuarios (maestro/admin)
exports.listAll = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener datos del propio usuario
exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener usuario por ID
exports.getById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'No encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Actualizar datos de usuario (maestro o el propio atleta)
exports.update = async (req, res) => {
  try {
    // Solo puede modificar su propio perfil o el maestro
    if (req.userId !== req.params.id && req.role !== 'maestro') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select('-password');
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Actualizar foto de usuario
exports.updatePhoto = async (req, res) => {
  try {
    const { foto } = req.body;
    
    // Validar que la foto sea base64
    if (!foto || !foto.startsWith('data:image/')) {
      return res.status(400).json({ error: 'La foto debe ser una imagen en formato base64' });
    }

    const updated = await User.findByIdAndUpdate(
      req.userId,
      { foto },
      { new: true }
    ).select('-password');

    if (!updated) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Desactivar usuario (cortar acceso)
exports.deactivate = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    ).select('-password');
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
