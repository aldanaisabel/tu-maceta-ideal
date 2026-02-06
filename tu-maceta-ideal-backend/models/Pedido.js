const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema({
    customer: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        dni: { type: String, required: true }
    },
    items: [
        {
            productoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
            name: { type: String, required: true },
            quantity: { type: Number, required: true, min: 1 },
            price: { type: Number, required: true, min: 0 },
            detalle: { type: String, default: '' },
            // NUEVOS CAMPOS PERSONALIZACIÓN
            configuracion: {
                color: { type: String, default: '' },
                tamaño: { type: String, default: '' }
            },
            extras: [{ type: String }] // "tarjeta", "planta", "tierra"
        }
    ],
    // NUEVA INFORMACIÓN DE PLazos
    tipoPedido: { 
        type: String, 
        enum: ['individual', 'mayorista'],
        default: 'individual'
    },
    plazoEntrega: { 
        type: String, 
        enum: ['4-6 días', '7-10 días', '12-15 días', '1_mes', '2_meses']
    },
    fechaEntregaEstimada: Date,
    estado: {
        type: String,
        enum: [
            'Pendiente', 'Fabricacion', 'Secado', 'Moldeado', 'Pintado', 'Listo', 'Entregado'
        ],
        default: 'Pendiente'
    }
}, { timestamps: true });

// Detectar tipo de pedido y calcular plazo automáticamente
pedidoSchema.pre('validate', function (next) {
    const totalCantidad = this.items.reduce((acc, item) => acc + item.quantity, 0);
    
    // Detectar mayorista
    this.tipoPedido = totalCantidad >= 15 ? 'mayorista' : 'individual';
    
    // Calcular plazo por defecto
    if (!this.plazoEntrega) {
        if (totalCantidad >= 15) {
            this.plazoEntrega = '1_mes';
            this.fechaEntregaEstimada = new Date();
            this.fechaEntregaEstimada.setMonth(this.fechaEntregaEstimada.getMonth() + 1);
        } else if (totalCantidad === 1) {
            this.plazoEntrega = '4-6 días';
            this.fechaEntregaEstimada = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
        } else {
            this.plazoEntrega = '7-10 días';
            this.fechaEntregaEstimada = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000);
        }
    }
    
    // Calcular total
    this.total = this.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
    next();
});

module.exports = mongoose.model('Pedido', pedidoSchema);
