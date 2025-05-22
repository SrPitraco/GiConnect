// backend/src/controllers/authController.js
const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// Registro de usuario
exports.register = async (req, res) => {
  try {
    // Sólo tomamos estos campos del body
    const {
      email, password, nombre, apellido1, apellido2,
      dni, telefono, foto
    } = req.body;

    // Creamos el usuario con defaults seguros
    const user = new User({
      email,
      password,
      nombre,
      apellido1,
      apellido2,
      dni,
      telefono,
      foto,
      // Campos que NO puede definir el atleta al registrarse
      role:          'atleta',
      cinturon:      undefined,
      grado:         undefined,
      fechaInicio:   undefined,
      fechaDesde:    undefined
    });

    await user.save();

    // Genera el token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Excluye la contraseña
    const userData = user.toObject();
    delete userData.password;

    res.status(201).json({ token, user: userData });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Login de usuario
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    res.json({ token, user: { ...user.toObject(), password: undefined } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
