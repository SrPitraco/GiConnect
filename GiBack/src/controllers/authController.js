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
    console.error('❌ Error en registro:', err);
    res.status(400).json({ error: err.message });
  }
};

// Login de usuario
exports.login = async (req, res) => {
  try {
    console.log('📝 Datos recibidos:', req.body);
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('❌ Faltan credenciales');
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    console.log('📧 Email recibido:', email);
    
    // Buscar usuario
    const user = await User.findOne({ email });
    console.log('👤 Usuario encontrado:', user ? 'Sí' : 'No');
    
    if (!user) {
      console.log('❌ Usuario no encontrado');
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const isMatch = await user.comparePassword(password);
    console.log('🔑 Contraseña correcta:', isMatch ? 'Sí' : 'No');
    
    if (!isMatch) {
      console.log('❌ Contraseña incorrecta');
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Preparar respuesta
    const userData = { ...user.toObject() };
    delete userData.password;
    console.log('✅ Login exitoso para:', userData.email);
    console.log('👤 Rol del usuario:', userData.role);

    res.json({ token, user: userData });
  } catch (err) {
    console.error('❌ Error en login:', err);
    res.status(500).json({ error: err.message });
  }
};
