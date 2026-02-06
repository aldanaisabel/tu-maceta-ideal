const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const mongoURI = process.env.MONGODB_URI;
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;  // ← SOLO ESTA VEZ


// ✅ MIDDLEWARES (SIN public/)
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../tu-maceta-ideal-frontend'))); // ← FRONTEND

// ✅ Mongo
mongoose.connect(mongoURI)
  .then(() => console.log("✅ MongoDB conectado exitosamente a la nube"))
  .catch(err => {
    console.error("❌ Error al conectar MongoDB:", err.message);
    console.log("Dirección intentada:", mongoURI); // Esto nos dirá si está leyendo la variable
  });

//Cargar rutas
require('./routes/productos')(app);
require('./routes/pedidos')(app);
require('./routes/auth')(app);

// ✅ LOGIN (para nuevo login.html)
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (email === 'macetasideal@gmail.com' && password === '46356397') {
    const token = jwt.sign(
      { email, rol: 'admin' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      rol: 'admin',
      user: {
        email,
        rol: 'admin'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Credenciales inválidas'
    });
  }
});

// ✅ RUTA ÚNICA PARA TODAS las páginas HTML
app.get('*', (req, res) => {
  const frontendPath = path.join(__dirname, '../tu-maceta-ideal-frontend');
  const fileName = req.path === '/' ? 'index.html' : req.path.replace('/', '');
  
  const filePath = path.join(frontendPath, fileName);
  
  console.log('📄 Buscando:', fileName);
  
  if (fs.existsSync(filePath)) {
    console.log('✅ Encontrado:', fileName);
    res.sendFile(filePath);
  } else {
    console.log('❌ No encontrado, sirviendo index.html');
    res.sendFile(path.join(frontendPath, 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`🚀 http://localhost:${PORT}`);
  console.log(`📱 http://localhost:${PORT}/index.html`);
  console.log(`🔐 http://localhost:${PORT}/login.html`);
  console.log(`👑 http://localhost:${PORT}/admin-panel.html`);
  console.log(`🧪 http://localhost:${PORT}/api/setup-productos`);
});