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
            detalle: { type: String, default: '' }
        }
    ],
    estado: {
        type: String,
        enum: [
            'Pendiente',
            'Fabricacion',
            'Secado',
            'Moldeado',
            'Pintado',
            'Listo',
            'Entregado'
        ],
        default: 'Pendiente'
    }
}, { timestamps: true });

// Calcular total automáticamente
pedidoSchema.pre('validate', function (next) {
    this.total = this.items.reduce(
        (acc, item) => acc + item.quantity * item.price,
        0
    );
    next();
});

module.exports = mongoose.model('Pedido', pedidoSchema);