const jwt = require('jsonwebtoken');

const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Authorization token required' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Authorization token required' });
        }

        // Use the same secret as authController (with fallback)
        const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

        try {
            const decoded = jwt.verify(token, secret);
            req.user = decoded; // Contains { id, email, role }
            next();
        } catch (jwtError) {
            console.error('JWT Verify Error:', jwtError.message);
            console.error('Received Token:', token.substring(0, 20) + '...'); // Log partial token for debugging
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
    } catch (err) {
        console.error('Auth Middleware Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = requireAuth;
