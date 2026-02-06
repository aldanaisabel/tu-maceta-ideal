const { message } = require('statuses');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const Pedido = require('../models/Pedido');
const Producto = require('../models/Producto');
const { enviarMailPedido } = require('../utils/mailer');

app.post('/api/pedidos', async (req, res) => {
  const { configuracion, extras, plazoEntrega } = req.body;
  
  // Detectar tipo de pedido
  const tipoPedido = configuracion.cantidad >= 15 ? 'mayorista' : 'individual';
  
  const pedido = new Pedido({
    configuracion,
    extras,
    tipoPedido,
    plazoEntrega,
    fechaEntregaEstimada: calcularFechaEntrega(plazoEntrega, configuracion.cantidad)
  });
  
  await pedido.save();
  res.json(pedido);
});

function calcularFechaEntrega(plazo, cantidad) {
  const hoy = new Date();
  if (cantidad >= 15 && plazo === '1_mes') return new Date(hoy.setMonth(hoy.getMonth() + 1));
  if (cantidad >= 15 && plazo === '2_meses') return new Date(hoy.setMonth(hoy.getMonth() + 2));
  // Lógica para individuales (4-6 días, etc)
  return new Date(hoy.setDate(hoy.getDate() + 5));
}


module.exports = function(app) {

  function obtenerIdBase(productoId) {
    if(!productoId) return null;

    if (productoId.startsWith('custom-')) {
      // custom-<ID>-color-tipo
      return productoId.split('-')[1];
    }

    return productoId;
  }

// Crear un pedido
  app.post('/api/pedidos', async (req, res) => {
  try {
    console.log('🧾 BODY COMPLETO:', JSON.stringify(req.body, null, 2));

    const { cliente, items } = req.body;

    if (!cliente || !cliente.name || !cliente.email || !items || !items.length) {
      return res.status(400).json({ error: 'Faltan datos del cliente o productos' });
    }

    // Verificar stock
    for (const item of items) {
      const idBase = obtenerIdBase(item.productoId);
      
      if (!idBase) {
        return res.status(400).json({ error: 'ID de producto inválido' });
      }
      
      console.log('🧩 ID BASE USADO:', idBase);
      
      const producto = await Producto.findById(idBase);
      
      if (!producto) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      
      if (producto.stock < item.quantity) {
        return res.status(400).json({
          error: `Stock insuficiente para ${producto.name}`
        });
      }
    }

    const total = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const pedido = new Pedido({
      customer: {
        name: cliente.name,
        email: cliente.email,
        dni: cliente.dni
      },
      items: items.map(item => {
        const productoIdReal = item.productoId.startsWith('custom-')
        ? item.productoId.split('-')[1]
        : item.productoId;
        return {
        productoId: productoIdReal,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        detalle: item.detalle || ''
        };
      }),
      total: total,
      estado: 'Pendiente',
      createdAt: new Date()
    });

    await pedido.save();

    await enviarMailPedido(
      pedido.customer.email,
      pedido
    );

    // Descontar stock al crear el pedido
    for (const item of items) {
      const idBase = obtenerIdBase(item.productoId);
      
      const producto = await Producto.findById(idBase);
      
      if (!producto) {
        return res.status(404).json({
          error: 'Producto no encontrado al descontar stock'
        });
      }
      
      console.log('📦 Stock antes:', producto.stock);
      producto.stock -= item.quantity;
      console.log('📦 Stock después:', producto.stock);
      
      await producto.save();
    }

    res.status(201).json({ message: 'Pedido creado', pedido: {...pedido.toObject(), idPedido: pedido._id} });

  } catch (error) {
    console.error('❌ ERROR AL CREAR PEDIDO:', error);
    res.status(500).json({ error: 'Error al crear el pedido' });
  }
});

// ADMIN - Ver todos los pedidos (ordenados por fecha)
  app.get('/api/pedidos', auth, isAdmin, async (req, res) => {
    try {
      console.log('Entró a GET /api/pedidos');
      console.log('Usuario autenticado:', req.user);
      
      const pedidos = await Pedido.find().sort({ createdAt: -1 });

      console.log('Pedidos encontrados:', pedidos.length);
      
      const pedidosAdaptados = pedidos.map(pedido => ({
        _id: pedido._id,
        idPedido: pedido._id,
        nombre: pedido.customer.name,
        dni: pedido.customer.dni || 'No definido',
        productos: pedido.items,
        total: pedido.items.reduce(
          (acc, item) => acc + item.price * item.quantity,
          0
        ),
        fecha: pedido.createdAt,
        estado: pedido.estado
      }));
      
      res.json(pedidosAdaptados);
    } catch (error) {
      console.error('ERROR EN /api/pedidos');
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

// ADMIN - Consultar un pedido por ID (detalles)
  app.get('/api/pedidos/:id', auth, isAdmin, async (req, res) => {
    try {
      const pedido = await Pedido.findById(req.params.id);
      if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado'});
      res.json(pedido);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // CLIENTE - Ver mis pedidos
  app.get('/api/mis-pedidos', auth, async (req, res) => {
    try {
      console.log('🧪 USER:', req.user);
      console.log('🧪 QUERY:', req.query);
      
      const userEmail = req.query.email;
      
      if (!userEmail) {
        return res.status(400).json({ error: 'Email requerido' });
      }
      
      // Seguridad: el cliente solo puede ver lo suyo
      if (req.user.rol !== 'admin' && req.user.email !== userEmail) {
        return res.status(403).json({ error: 'No autorizado' });
      }
      
      const pedidos = await Pedido.find({
        'customer.email': userEmail
      }).sort({ createdAt: -1 });
      
      const pedidosAdaptados = pedidos.map(pedido => ({
        idPedido: pedido._id,
        fecha: pedido.createdAt,
        productos: pedido.items,
        total: pedido.items.reduce(
          (acc, item) => acc + item.price * item.quantity,
          0
        ),
        estado: pedido.estado
      }));
      
      res.json(pedidosAdaptados);
    
    } catch (error) {
      console.error('❌ Error en mis pedidos:', error);
      res.status(500).json({ error: 'Error al obtener pedidos' });
    }
  });
  
  // ADMIN - Actualizar estado de un pedido (ruta nueva)
  app.patch('/api/pedidos/:id/estado', auth, isAdmin, async (req, res) => {
    try {
      const { estado } = req.body;
      if (!estado) {
        return res.status(400).json({ error: 'Debes enviar un estado' });
      }
      
      const pedido = await Pedido.findByIdAndUpdate(
        req.params.id,
        { estado },
        { new: true }
      );
      
      if (!pedido) {
        return res.status(404).json({ error: 'Pedido no encontrado' });
      }
      
      res.json({ message: 'Estado actualizado', pedido });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

};