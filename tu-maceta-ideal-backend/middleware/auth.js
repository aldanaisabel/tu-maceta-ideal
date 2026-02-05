const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    console.log('🔐 Authorization header:', authHeader);
    
    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2) {
        return res.status(401).json({ error: 'Token format invalid' });
    }
    
    const [scheme, token] = parts;
    
    if (scheme !== 'Bearer') {
        return res.status(401).json({ error: 'Token malformado' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
};