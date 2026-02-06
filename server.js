// 🚀 SERVER.JS E-COMMERCE MACETAS - EXPRESS 5 COMPATIBLE
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;
const JWT_SECRET = process.env.JWT_SECRET || 'tu_maceta_super_secreto_2026';

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..'))); // Sirve frontend

// MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/macetaideal')
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ MongoDB error:', err));

// 📦 MODELOS
const productoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  precio: { type: Number, required: true },
  descripcion: String,
  imagen: String,
  stock: { type: Number, default: 10 },
  categoria: { type: String, default: 'maceta' }
});

const Producto = mongoose.model('Producto', productoSchema);

// 🔥 API RUTAS - TODO ANTES del SPA
app.get('/api/productos', async (req, res) => {
  try {
    // Datos demo si MongoDB vacío
    const productos = await Producto.find({ stock: { $gt: 0 } });
    if (productos.length === 0) {
      return res.json([
        { _id: '1', nombre: 'Maceta Clásica', precio: 2500, descripcion: 'Cerámica premium', imagen: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400' },
        { _id: '2', nombre: 'Maceta Moderna', precio: 3500, descripcion: 'Diseño minimalista', imagen: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400' },
        { _id: '3', nombre: 'Maceta Grande', precio: 4500, descripcion: 'Para plantas grandes', imagen: 'https://images.unsplash.com/photo-1599058916210-26a94eaec04d?w=400' }
      ]);
    }
    res.json(productos);
  } catch (error) {
    res.status(500).json([]);
  }
});

// 👑 ADMIN LOGIN
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  console.log('🔐 Login attempt:', email);
  
  if (email === 'macetasideal@gmail.com' && password === '46356397') {
    const token = jwt.sign({ email, rol: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, rol: 'admin', user: { email, rol: 'admin' } });
  } else {
    res.status(401).json({ success: false, message: '❌ Credenciales inválidas' });
  }
});

// ✅ SPA ROUTING - FIX EXPRESS 5 (USAR REGEX)
app.get(/^\/(?!api\/).*/, (req, res) => {
  const filePath = path.join(__dirname, 'index.html');
  
  console.log('📄 Sirviendo index.html para:', req.path);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('index.html no encontrado');
  }
});

// 🚀 START
app.listen(PORT, () => {
  console.log(`🚀 Server LIVE puerto ${PORT}`);
  console.log(`✅ http://localhost:${PORT}`);
  console.log(`✅ API: http://localhost:${PORT}/api/productos`);
});


