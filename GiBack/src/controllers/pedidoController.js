const Pedido = require('../models/Pedido');

// Crear nuevo pedido
exports.create = async (req, res) => {
  try {
    const data = {
      atleta: req.userId,
      productos: req.body.productos, // [{ producto, cantidad }]
      total: req.body.total
    };
    const pedido = await Pedido.create(data);
    res.status(201).json(pedido);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Listar pedidos del usuario
exports.listUser = async (req, res) => {
  try {
    const pedidos = await Pedido.find({ atleta: req.userId })
      .populate('productos.producto','nombre precio foto');
    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Listar todos los pedidos (solo admin/maestro)
exports.listAll = async (req, res) => {
  try {
    const pedidos = await Pedido.find()
      .populate('atleta','nombre apellido1')
      .populate('productos.producto','nombre precio foto');
    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener pedido por ID
exports.getById = async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id)
      .populate('atleta','nombre apellido1')
      .populate('productos.producto','nombre precio foto');
    if (!pedido) return res.status(404).json({ error: 'No encontrado' });
    // Sólo el propietario o maestro pueden verlo
    if (pedido.atleta._id.toString() !== req.userId && req.role !== 'maestro') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    res.json(pedido);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Actualizar estado de pedido (p.ej. pagado, enviado)
exports.updateStatus = async (req, res) => {
  try {
    const pedido = await Pedido.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(pedido);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
