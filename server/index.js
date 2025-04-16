import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createProxyMiddleware, rateLimitMiddleware } from './api-proxy.js';

// Load environment variables
dotenv.config();

const app = express();
const port = 3002; // Use a fixed port for consistency

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// API proxy middleware with rate limiting
app.use('/api', rateLimitMiddleware(), createProxyMiddleware());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`API proxy available at http://localhost:${port}/api`);
});
