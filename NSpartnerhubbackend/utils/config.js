require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

if (process.env.NODE_ENV === 'production' && JWT_SECRET === 'your-secret-key-change-in-production') {
    console.warn('WARNING: Using default JWT_SECRET in production!');
}

module.exports = {
    JWT_SECRET
};
