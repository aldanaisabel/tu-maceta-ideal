const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

module.exports = function(app) {
    app.post('/api/register', async (req, res) => {
        try {
            const { name, email, password, rol } = req.body;
            
            if (!name || !email || !password) {
                return res.status(400).json({ error: 'Faltan datos obligatorios' });
            }
            
            const existeUsuario = await Usuario.findOne({ email });
            if (existeUsuario) {
                return res.status(400).json({ error: 'El usuario ya existe' });
            }
            
            const passwordHasheada = await bcrypt.hash(password, 10);
            
            const nuevoUsuario = new Usuario({
                name,
                email,
                password: passwordHasheada,
                rol: rol || 'cliente'
            });
            
            await nuevoUsuario.save();
            
            res.status(201).json({
                mensaje: 'Usuario creado correctamente',
                usuario: {
                    id: nuevoUsuario._id,
                    name: nuevoUsuario.name,
                    email: nuevoUsuario.email,
                    rol: nuevoUsuario.rol
                }
            });
        
        } catch (error) {
            console.error('❌ Error en register:', error);
            res.status(500).json({ error: 'Error al registrar usuario' });
        }
    });

    app.post('/api/login', async (req, res) => {
        try {
            const { email, password } = req.body;
            
            if (!email || !password) {
                return res.status(400).json({ error: 'Email y contraseña requeridos' });
            }
            
            const usuario = await Usuario.findOne({ email });
            if (!usuario) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }
            
            const passwordOk = await bcrypt.compare(password, usuario.password);
            if (!passwordOk) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }
            
            const token = jwt.sign(
                {
                    id: usuario._id,
                    rol: usuario.rol,
                    email: usuario.email
                },
                process.env.JWT_SECRET || 'secreto_tp',
                { expiresIn: '1d' }
            );
            
            res.json({
                token,
                usuario: {
                    id: usuario._id,
                    name: usuario.name,
                    email: usuario.email,
                    rol: usuario.rol
                }
            });
        
        } catch (error) {
            console.error('❌ Error en login:', error);
            res.status(500).json({ error: 'Error al iniciar sesión' });
        }
    });
};