import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

// Routes Imports
import liquorRoutes from '../routes/liquorRoute.js';
import authRoutes from '../routes/authRoute.js';
import loginRoutes from '../routes/loginRoute.js';

const app = express();
app.use(express.json());

// Middleware for parsing request bodies
app.use(cookieParser());
const allowedOrigins = ['http://localhost:8081',
    // 'https://example.com',
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));

// Middleware for setting security headers
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    next();
});

// Router Connection
app.use('/api/liquors', liquorRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/auth', loginRoutes);


// Fallback for unknown routes
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: "Resource not found",
    });
});



// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});

export default app;