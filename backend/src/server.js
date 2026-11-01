/**
 * server.js — HTTP server entry point.
 * Starts the Express app and listens on the configured port.
 */

require('dotenv').config();

const app = require('./app');
const logger = require('./utils/logger');

const PORT = parseInt(process.env.PORT || '5000', 10);

const server = app.listen(PORT, () => {
  logger.success(`Road Defect API server running on http://localhost:${PORT}`);
  logger.info(`ML service URL: ${process.env.ML_SERVICE_URL || 'http://localhost:8000'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down...');
  server.close(() => {
    process.exit(0);
  });
});
