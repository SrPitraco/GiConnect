// src/models/Pedido.js
const mongoose = require('mongoose');

const PedidoSchema = new mongoose.Schema({
  atleta:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productos:   [{ producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' }, cantidad: Number }],
  total:       { type: Number, required: true },
  status:      { type: String, enum: ['pendiente','pagado','enviado'], default: 'pendiente' },
  fecha:       { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Pedido', PedidoSchema);
