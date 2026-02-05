const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'tumacetaidealproyectofinal@gmail.com',
        pass: 'yfuxsdosodglpcti'
    }
});

const enviarMailPedido = async (email, pedido) => {
    try {
        console.log("📨 Enviando mail a:", email);

        const info = await transporter.sendMail({
            from: '"Tu Maceta Ideal 🌱" <tumacetaidealproyectofinal@gmail.com>',
            to: email,
            subject: 'Pedido confirmado',
            html: `
            <div style="font-family: Arial, sans-serif; background:#f4f6f4; padding:30px;">
                <div style="max-width:600px; margin:auto; background:white; border-radius:12px; padding:30px; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
            
                <h2 style="color:#2e7d32; margin-bottom:10px;">
                    🌿 ¡Gracias por tu compra!
                </h2>
            
                <p style="font-size:16px; color:#333;">
                    Hola <strong>${pedido.customer.name}</strong>,
                </p>
            
                <p style="font-size:15px; color:#555;">
                    Tu pedido fue registrado correctamente en <strong>Tu Maceta Ideal</strong>.
                </p>
            
                <hr style="margin:20px 0; border:none; border-top:1px solid #e0e0e0;" />
            
                <h3 style="margin-bottom:10px;">🧾 Detalles del pedido</h3>
            
                <p><strong>Número:</strong> ${pedido.idPedido || pedido._id}</p>
                <p><strong>Estado:</strong> ${pedido.estado}</p>
                <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-AR')}</p>
            
                <table width="100%" cellpadding="8" style="border-collapse:collapse; margin-top:15px;">
                    <thead>
                        <tr style="background:#e8f5e9;">
                            <th align="left">Producto</th>
                            <th align="center">Cant.</th>
                            <th align="right">Precio</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pedido.items.map(i => `
                            <tr style="border-bottom:1px solid #eee;">
                                <td>${i.name}</td>
                                <td align="center">${i.quantity}</td>
                                <td align="right">$${i.price}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <h3 style="text-align:right; margin-top:20px;">
                    Total: $${pedido.total}
                </h3>
                
                <p style="margin-top:25px; color:#666;">
                    Te avisaremos por correo cuando el estado del pedido cambie.
                </p>
                
                <div style="margin-top:30px; font-size:13px; color:#888; text-align:center;">
                    Tu Maceta Ideal 🌱
                </div>
                
            </div>
        </div>
        `
    });

        console.log("✅ Mail enviado:", info.response);

    } catch (error) {
        console.error("❌ Error mail:", error);
    }
};

module.exports = { enviarMailPedido };