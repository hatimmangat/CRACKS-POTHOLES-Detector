/**
 * app.js — Express application setup.
 *
 * Configures middleware stack:
 *   - Helmet (security headers)
 *   - CORS (React frontend origin only)
 *   - JSON + URL-encoded body parsing
 *   - Rate limiting
 *   - API routes
 *   - Centralised error handler
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');
const predictRoutes = require('./routes/predict');
const logger = require('./utils/logger');

const app = express();

// ─────────────────────────────────────────────
// Security headers
// ─────────────────────────────────────────────
app.use(helmet());

// ─────────────────────────────────────────────
// CORS — allow only the React frontend
// ─────────────────────────────────────────────
const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: corsOrigins,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// ─────────────────────────────────────────────
// Body parsers
// ─────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ─────────────────────────────────────────────
// Rate limiting
// ─────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,             // max 60 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please wait a moment and try again.',
  },
});

app.use('/api/', limiter);

// ─────────────────────────────────────────────
// Request logging (simple)
// ─────────────────────────────────────────────
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// ─────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────
app.use('/api', predictRoutes);

// Root health ping
app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'road-defect-api' });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ─────────────────────────────────────────────
// Centralised error handler (must be last)
// ─────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
