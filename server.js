// BLKOUT Liberation Platform - Railway API Backend
// Express server replacing Vercel serverless functions

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
const corsOptions = {
  origin: [
    'https://blkout-community-platform.vercel.app',
    'https://blkout.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Liberation-Layer']
};
app.use(cors(corsOptions));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'blkout-api-railway',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    liberation: {
      democraticGovernance: true,
      creatorSovereignty: true,
      traumaInformed: true,
      communityOwned: true
    }
  });
});

// API Routes
app.use('/api/admin', require('./routes/admin'));
app.use('/api/content', require('./routes/content'));
app.use('/api/stories-real', require('./routes/stories-real'));
app.use('/api/webhooks', require('./routes/webhooks'));

// Root route
app.get('/', (req, res) => {
  res.json({
    message: '🚀 BLKOUT Liberation Platform API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      admin: '/api/admin/*',
      content: '/api/content',
      stories: '/api/stories-real',
      webhooks: '/api/webhooks/*'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    liberation_message: 'Technical difficulties - community tech collective will address'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
    🚀 BLKOUT Liberation Platform API
    📍 Running on port ${PORT}
    🌍 Environment: ${process.env.NODE_ENV || 'development'}
    💪 Liberation through technology!

    Endpoints:
    - Health: http://localhost:${PORT}/health
    - Admin: http://localhost:${PORT}/api/admin/*
    - Content: http://localhost:${PORT}/api/content
  `);
});