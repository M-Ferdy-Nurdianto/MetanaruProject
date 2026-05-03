const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const orderRoutes = require('./routes/orderRoutes');
const apiRoutes = require('./routes/apiRoutes');
const postEventRoutes = require('./routes/postEventRoutes');
const { getKeepAlive } = require('./controllers/orderController');
const { standardLimiter } = require('./middleware/security');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null,
    'http://localhost:5173',
    'http://127.0.0.1:5173'
].filter(Boolean);

const isAllowedPreviewOrigin = (origin) => {
    return /^https:\/\/metanaru(?:-[a-z0-9-]+)?\.vercel\.app$/i.test(origin);
};

app.use(helmet({
    permissionsPolicy: false
}));

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (process.env.NODE_ENV !== 'production') return callback(null, true);
        if (allowedOrigins.includes(origin) || isAllowedPreviewOrigin(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true
}));

app.use(standardLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/orders', orderRoutes);
app.use('/api/public', apiRoutes);
app.use('/api/post-events', postEventRoutes);
app.get('/api/keep-alive', getKeepAlive);

app.use((err, req, res, next) => {
    console.error('🔥 GLOBAL SERVER ERROR:', err);
    const isCorsError = typeof err.message === 'string' && err.message.startsWith('CORS blocked for origin:');
    const statusCode = isCorsError ? 403 : 500;
    const publicMessage = isCorsError ? 'CORS origin not allowed' : 'Internal Server Error';

    res.status(statusCode).json({
        error: err.message || publicMessage,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
});

if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;
