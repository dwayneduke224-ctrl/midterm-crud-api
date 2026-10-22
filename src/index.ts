import 'reflect-metadata';  // MUST be first import!
import express from 'express';
import cors from 'cors';
import { AppDataSource } from './config/data-source';
import { userRoutes } from './routes/userRoutes';
import { taskRoutes } from './routes/taskRoutes';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
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
app.use('/api/users', userRoutes);
app.use('/api', taskRoutes);

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
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Initialize database connection in the background
AppDataSource.initialize()
   .then(() => {
       console.log('📦 Database connected successfully!');
   })
   .catch((error) => {
       console.error('❌ Database connection failed:', error);
   });