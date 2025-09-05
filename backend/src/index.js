import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import Firebase configuration
import './config/firebase.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Prisma Client
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Auth routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'KampungKaki Backend API',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Health check route
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  const { pool } = await import('./config/database.js');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  const { pool } = await import('./config/database.js');
  await pool.end();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log(`🔥 Firebase Auth: ${process.env.AUTH_REQUIRED !== 'false' ? 'Enabled' : 'Disabled (Dev Mode)'}`);
});
  console.log(`🔥 Firebase Auth: ${process.env.AUTH_REQUIRED !== 'false' ? 'Enabled' : 'Disabled (Dev Mode)'}`);
