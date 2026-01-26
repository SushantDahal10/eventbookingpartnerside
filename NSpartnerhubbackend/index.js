const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(require('cookie-parser')());

app.get('/', (req, res) => {
    res.send('NS Partner Hub Backend is running!');
});

// Routes
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/partners', require('./routes/partnerRoutes'));

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);

    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }

    if (err.name === 'MulterError') {
        return res.status(400).json({ error: `Upload error: ${err.message}` });
    }

    res.status(500).json({ error: 'Internal server error' });
});

const startEventScheduler = require('./cron/eventScheduler');
startEventScheduler();

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

server.on('error', (e) => console.error('Server Error:', e));

process.on('exit', (code) => {
    console.log(`Process exiting with code: ${code}`);
});

process.on('SIGINT', () => {
    console.log('Received SIGINT. Shutting down.');
    process.exit();
});
