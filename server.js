const path = require('path');
require('dotenv').config(); // ← Render Environment Variables

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'tu_maceta_super_secreto_2026';

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'tu-maceta-ideal-frontend'))); // ← FIJO

// MongoDB
mongoose.connect(process.env.MONGODB_URI || '')
  .then(() => console.log("✅ MongoDB conectado exitosamente"))
  .catch(err => console.error("❌ MongoDB error:", err));

// LOGIN API
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'macetasideal@gmail.com' && password === '46356397') {
    const token = jwt.sign({ email, rol: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, rol: 'admin', user: { email, rol: 'admin' } });
  } else {
    res.status(401).json({ success: false, message: 'Credenciales inválidas' });
  }
});

// ✅ SIRVE index.html DESDE RAÍZ
app.all(/(.*)/, (req, res) => {
  const filePath = path.join(__dirname, 'index.html'); // ← RAÍZ ✅
  
  console.log('📄 Sirviendo index.html desde RAÍZ');
  
  if (fs.existsSync(filePath)) {
    console.log('✅ index.html encontrado');
    res.sendFile(filePath);
  } else {
    console.log('❌ index.html no encontrado');
    res.status(404).send('Frontend no disponible');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
