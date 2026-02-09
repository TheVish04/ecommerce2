const express = require('express');
const dotenv = require('dotenv').config();
const colors = require('colors');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { errorHandler } = require('./middleware/error.middleware');
const connectDB = require('./config/db');
const PORT = process.env.PORT || 5000;

connectDB();

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));

const allowedOrigins = [
    'https://artvpp91.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
];
app.use(cors({
    origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        cb(null, false);
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, // Increased from 20
    message: { message: 'Too many attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false
});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000, // Increased from 200
    message: { message: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false
});

app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// Debug Logging Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Health check (for Render, load balancers, etc.)
app.get('/', (req, res) => res.status(200).json({ ok: true, service: 'KalaVPP API' }));
app.head('/', (req, res) => res.status(200).end());

// Routes
app.use('/api/auth', require('./routes/auth.route'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/vendor', require('./routes/vendorRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/commissions', require('./routes/commissionRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// 404 Handler
app.use((req, res, next) => {
    console.log(`[404] Resource not found: ${req.method} ${req.url}`);
    res.status(404).json({ message: `Resource not found: ${req.method} ${req.originalUrl}` });
});

// Error Handler
app.use(errorHandler);

app.listen(PORT, () =>
    console.log(`Server started on port ${PORT}`)
);
