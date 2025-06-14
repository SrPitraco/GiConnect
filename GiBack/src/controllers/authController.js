// backend/src/controllers/authController.js
const jwt  = require('jsonwebtoken');
const User = require('../models/User');
const { sendVerificationEmail } = require('../config/email');

// Registro de usuario
exports.register = async (req, res) => {
  try {
    // Sólo tomamos estos campos del body
    const {
      email, password, nombre, apellido1, apellido2,
      dni, telefono, foto
    } = req.body;

    // Validación de campos requeridos
    const requiredFields = ['email', 'password', 'nombre', 'apellido1', 'dni', 'telefono'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `Faltan campos requeridos: ${missingFields.join(', ')}` 
      });
    }

    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'El formato del email no es válido' });
    }

    // Validación de longitud mínima de contraseña
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Validación de formato de imagen base64 si se proporciona
    if (foto && !foto.startsWith('data:image/')) {
      return res.status(400).json({ error: 'El formato de la imagen no es válido. Debe ser una imagen en base64' });
    }

    // Verificar si ya existe un usuario con el mismo email o teléfono
    const existingUser = await User.findOne({
      $or: [
        { email },
        { telefono }
      ]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ error: 'Ya existe un usuario con este email' });
      }
      if (existingUser.telefono === telefono) {
        return res.status(400).json({ error: 'Ya existe un usuario con este teléfono' });
      }
    }

    // Verificar DNI solo si no es el DNI especial
    const dniNormalizado = dni.toUpperCase();
    if (dniNormalizado !== '00000000A') {
      const existingDNI = await User.findOne({ 
        $and: [
          { dni: dniNormalizado },
          { dni: { $ne: '00000000A' } }
        ]
      });
      if (existingDNI) {
        return res.status(400).json({ error: 'Ya existe un usuario con este DNI' });
      }
    }

    // Definir la foto por defecto
    const defaultPhoto = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

    // Creamos el usuario con defaults seguros
    const user = new User({
      email,
      password,
      nombre,
      apellido1,
      apellido2,
      dni: dni.toUpperCase(),
      telefono,
      foto: foto || defaultPhoto,
      role: 'atleta',
      cinturon: undefined,
      grado: undefined,
      fechaInicio: undefined,
      fechaDesde: undefined
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
    if (err.code === 11000) {
      // Error de duplicado de MongoDB
      const field = Object.keys(err.keyPattern)[0];
      const message = `Ya existe un usuario con este ${field}`;
      return res.status(400).json({ error: message });
    }
    if (err.name === 'ValidationError') {
      // Error de validación de Mongoose
      const errors = Object.values(err.errors).map(error => error.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    res.status(400).json({ error: err.message || 'Error en el registro' });
  }
};

// Login de usuario
exports.login = async (req, res) => {
  try {
    console.log('📝 Datos recibidos:', req.body);
    console.log('🔍 Headers recibidos:', req.headers);
    console.log('🌐 Origen de la petición:', req.headers.origin);
    
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

// Generar código de verificación
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Solicitar recuperación de contraseña
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Buscar usuario por email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'No existe ningún usuario con este email' });
    }

    // Generar código de verificación
    const verificationCode = generateVerificationCode();
    
    // Guardar el código en el usuario (temporalmente)
    user.resetPasswordCode = verificationCode;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora de validez
    await user.save();

    // Enviar email con el código
    await sendVerificationEmail(email, verificationCode);

    res.json({ message: 'Se ha enviado un código de verificación a tu email' });
  } catch (err) {
    console.error('Error en solicitud de recuperación:', err);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
};

// Verificar código y actualizar contraseña
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    // Buscar usuario
    const user = await User.findOne({ 
      email,
      resetPasswordCode: code,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Código inválido o expirado' });
    }

    // Actualizar contraseña
    user.password = newPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    console.error('Error en actualización de contraseña:', err);
    res.status(500).json({ error: 'Error al actualizar la contraseña' });
  }
};
