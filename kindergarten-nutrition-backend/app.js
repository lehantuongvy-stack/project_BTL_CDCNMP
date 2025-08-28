const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import routes
// const authRoutes = require('./routes/auth');
// const childrenRoutes = require('./routes/children');
// const mealsRoutes = require('./routes/meals');
// const nutritionRoutes = require('./routes/nutrition');

// Import middleware
// const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet());

// CORS middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/children', require('./routes/children'));
app.use('/api/meals', require('./routes/meals'));
app.use('/api/nutrition', require('./routes/nutrition'));

// Error handling middleware (should be last)
app.use(require('./middleware/errorHandler'));

module.exports = app;