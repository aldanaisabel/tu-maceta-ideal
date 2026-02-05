const Producto = require('../models/Producto');
module.exports = function(app)  {

// ✅ Admin middleware
  const verificarAdmin = (req, res, next) => {
    const esAdmin = req.headers['x-admin'] === 'true';
      if (!esAdmin) {
        return res.status(403).json({ error: 'Acceso denegado. Admin requerido' });
    }
    next();
  };

// ✅ APIs PÚBLICAS
  app.get('/api/productos', async (req, res) => {
    try {
      const productos = await Producto.find().sort({ createdAt: -1 });
      res.json(productos);
    } catch (error) {
      res.status(500).json({ error: 'Error productos' });
    }
  });

  // ✅ Obtener UN producto por ID (PÚBLICO)
app.get('/api/productos/:id', async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(producto);
  } catch (error) {
    res.status(400).json({ error: 'ID inválido' });
  }
});

// ✅ APIs ADMIN
  app.post('/api/productos', verificarAdmin, async (req, res) => {
    try {
      const producto = new Producto(req.body);
      await producto.save();
      res.status(201).json({ success: true, producto });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put('/api/productos/:id', verificarAdmin, async (req, res) => {
    try {
      const producto = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json({ success: true, producto });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete('/api/productos/:id', verificarAdmin, async (req, res) => {
    try {
      await Producto.findByIdAndDelete(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// ✅ SETUP
  app.post('/api/setup-productos', async (req, res) => {
    await Producto.deleteMany({});
    await Producto.insertMany([
      { 
        name: 'Maceta Chica', 
        basePrice: 1500, 
        description: 'Pequeña para escritorio', 
        imageUrl: 'https://picsum.photos/400/400?1',
        availableColors: ['verde', 'blanco'], 
        stock: 10 
      },
      { 
        name: 'Maceta Grande', 
        basePrice: 4000, 
        description: 'Para exterior', 
        imageUrl: 'https://picsum.photos/400/400?2', 
        availableColors: ['azul', 'terracota'], 
        stock: 5 
      }
    ]);
    res.json({ message: '✅ Productos demo creados' });
  });
};