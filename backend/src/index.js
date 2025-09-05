<<<<<<< HEAD
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import Firebase configuration
import './config/firebase.js';

// Import routes
import authRoutes from './routes/auth.js';
// import apiRoutes from './routes/api.js';

=======
﻿import express from "express";
import cors from "cors";
import dotenv from "dotenv";

>>>>>>> parent of 6e5674c (backend auth)
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Routes
import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";
import requestRoutes from "./routes/requests.js";

<<<<<<< HEAD
// Auth routes
app.use('/api/auth', authRoutes);

// Your existing API routes
// app.use('/api', apiRoutes);

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
=======
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/requests", requestRoutes);
>>>>>>> parent of 6e5674c (backend auth)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
<<<<<<< HEAD
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log(`🔥 Firebase Auth: ${process.env.AUTH_REQUIRED !== 'false' ? 'Enabled' : 'Disabled (Dev Mode)'}`);
=======
  console.log(Server running on http://localhost:);
>>>>>>> parent of 6e5674c (backend auth)
});
