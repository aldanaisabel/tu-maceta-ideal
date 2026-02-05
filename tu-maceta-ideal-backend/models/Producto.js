const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  name:          { type: String, required: true },   // antes nombre
  basePrice:     { type: Number, required: true },   // antes precio
  description:   { type: String, required: true },   // antes descripcion  
  imageUrl:      { type: String },                   // antes imagen
  availableColors:{ type: [String], default: [] },   // antes colores
  stock:         { type: Number, default: 0 }
}, { timestamps: true });

const Producto = mongoose.model('Producto', productoSchema);

module.exports = Producto;