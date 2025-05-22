// src/models/Producto.js
const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema({
    foto:       { type: String},
    nombre:     { type: String, required: true },
    descripcion:{ type: String },
    precio:     { type: Number, required: true },
    disponible: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Producto', ProductoSchema);
