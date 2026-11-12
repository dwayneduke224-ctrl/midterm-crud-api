import 'reflect-metadata';  // MUST be first import!
import express from 'express';
import cors from 'cors';
import { AppDataSource } from './config/data-source';
import { userRoutes } from './routes/userRoutes';
import { taskRoutes } from './routes/taskRoutes';
import { authRoutes } from './routes/authRoutes';
import { requestLogger } from './middleware/requestLogger';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use((req, res, next) => {
    console.log(`📥 Incoming request: ${req.method} ${req.url}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
   console.log('👉 /health route was hit!'); // Add this
   res.json({
       success: true,
       message: 'API is running',
       timestamp: new Date().toISOString()
   });
});

// Routes
// API v1 Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1', taskRoutes);
app.use('/api/v1/auth', authRoutes);

// Old API routes are permanently moved to /api/v1
app.use('/api', (req, res, next) => {
    // Allow /api/v1 routes to continue to the normal 404 handler
    if (req.path.startsWith('/v1')) {
        return next();
    }

    return res.status(410).json({
        success: false,
        error: {
            code: 'API_VERSION_MOVED',
            message: 'This API endpoint has moved to /api/v1'
        }
    });
});

// 404 handler
app.use((req, res) => {
   console.log(`👉 Custom 404 hit for: ${req.method} ${req.url}`); // Add this
   res.status(404).json({
       success: false,
       error: {
           code: 'ROUTE_NOT_FOUND',
           message: `Route ${req.method} ${req.url} not found`
       }
   });
});

// Start server immediately so health checks and routes work right away
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

const gracefulShutdown = async (signal: string) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);

    server.close(async () => {
        console.log('Express server closed.');

        try {
            if (AppDataSource.isInitialized) {
                await AppDataSource.destroy();
                console.log('Database connection closed.');
            }

            process.exit(0);
        } catch (error) {
            console.error('Error during shutdown:', error);
            process.exit(1);
        }
    });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
// Initialize database connection in the background
AppDataSource.initialize()
   .then(() => {
       console.log('📦 Database connected successfully!');
   })
   .catch((error) => {
       console.error('❌ Database connection failed:', error);
   });