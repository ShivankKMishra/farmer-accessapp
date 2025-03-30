// Serverless entry point for Vercel deployment
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./auth');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes for Vercel deployment
app.use('/api/auth', authRoutes);

// Import other routes as needed
// app.use('/api/products', require('./products'));
// app.use('/api/weather', require('./weather'));

// Fallback to server/routes.ts in development environment
if (process.env.NODE_ENV !== 'production') {
  const { registerRoutes } = require('../server/routes');
  registerRoutes(app);
}

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'An error occurred',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Export for Vercel
module.exports = app;