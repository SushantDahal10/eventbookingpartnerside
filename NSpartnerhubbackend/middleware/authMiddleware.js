const jwt = require('jsonwebtoken');

const { JWT_SECRET } = require('../utils/config');

const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.log('[Auth] No Authorization header');
            return res.status(401).json({ error: 'Authorization token required' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            console.log('[Auth] No token provided in header');
            return res.status(401).json({ error: 'Authorization token required' });
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded; // Contains { id, email, role }
            next();
        } catch (jwtError) {
            console.error('[Auth] JWT Verify Error:', jwtError.message);
            // console.error('[Auth] Received Token:', token.substring(0, 20) + '...'); 
            return res.status(401).json({ error: 'Invalid or expired token', details: jwtError.message });
        }
    } catch (err) {
        console.error('Auth Middleware Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = requireAuth;
