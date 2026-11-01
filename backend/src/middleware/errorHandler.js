/**
 * errorHandler.js — Centralised Express error handler.
 *
 * Catches errors from all middleware/controllers and returns
 * a clean JSON response. Internal error details are NOT exposed
 * to the client in production.
 */

const multer = require('multer');
const logger = require('../utils/logger');

/**
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function errorHandler(err, req, res, next) {
  // Multer-specific errors
  if (err instanceof multer.MulterError) {
    let message = 'File upload error.';

    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File is too large. Maximum allowed size is 20 MB.';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = err.message || 'Unsupported file type.';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Only one file can be uploaded at a time.';
    }

    logger.warn(`Upload error: ${message}`);
    return res.status(400).json({ success: false, message });
  }

  // Known application errors (passed with a status code)
  if (err.statusCode) {
    logger.warn(`App error [${err.statusCode}]: ${err.message}`);
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Unknown/unexpected errors
  logger.error('Unhandled error:', err);
  return res.status(500).json({
    success: false,
    message: 'An internal server error occurred. Please try again.',
  });
}

module.exports = errorHandler;
