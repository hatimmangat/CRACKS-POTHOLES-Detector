/**
 * mlService.js — Axios client for communicating with the Python FastAPI ML service.
 *
 * Node.js forwards uploaded images/videos to FastAPI and returns prediction results.
 * Node.js does NOT perform any ML inference.
 */

const axios = require('axios');
const FormData = require('form-data');
const logger = require('../utils/logger');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const ML_SERVICE_TIMEOUT = parseInt(process.env.ML_SERVICE_TIMEOUT || '30000', 10);

/**
 * Check the health of the FastAPI ML service.
 * @returns {Promise<object>} Health response from FastAPI.
 */
async function checkMlHealth() {
  const response = await axios.get(`${ML_SERVICE_URL}/health`, {
    timeout: 5000,
  });
  return response.data;
}

/**
 * Forward an uploaded image buffer to the FastAPI prediction endpoint.
 *
 * @param {Buffer} fileBuffer - Raw image file buffer.
 * @param {string} filename - Original filename (used for multipart Content-Disposition).
 * @param {string} mimeType - MIME type of the file.
 * @param {object} params - Optional prediction parameters.
 * @param {number} [params.confidence] - Confidence threshold (0-1).
 * @param {number} [params.iou] - IoU threshold (0-1).
 * @param {number} [params.image_size] - Inference image size.
 * @returns {Promise<object>} Prediction response from FastAPI.
 */
async function forwardPrediction(fileBuffer, filename, mimeType, params = {}) {
  const form = new FormData();
  form.append('file', fileBuffer, {
    filename,
    contentType: mimeType,
    knownLength: fileBuffer.length,
  });

  // Build query parameters
  const queryParams = new URLSearchParams();
  if (params.confidence !== undefined) queryParams.set('confidence', params.confidence);
  if (params.iou !== undefined) queryParams.set('iou', params.iou);
  if (params.image_size !== undefined) queryParams.set('image_size', params.image_size);

  const url = `${ML_SERVICE_URL}/predict${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

  logger.info(`Sending image to ML service: ${url}`);

  try {
    const response = await axios.post(url, form, {
      headers: {
        ...form.getHeaders(),
      },
      timeout: ML_SERVICE_TIMEOUT,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    return response.data;
  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
      const error = new Error('ML service is unavailable. Please ensure the Python service is running.');
      error.statusCode = 503;
      throw error;
    }

    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      const error = new Error('ML service request timed out. The image may be too large or the service is overloaded.');
      error.statusCode = 504;
      throw error;
    }

    if (err.response) {
      // FastAPI returned an error response
      const status = err.response.status;
      const detail = err.response.data?.detail || err.response.data?.message || 'ML service error.';

      if (status === 503) {
        const error = new Error('ML model is not loaded. Please check the ML service.');
        error.statusCode = 503;
        throw error;
      }

      if (status === 400) {
        const error = new Error(detail);
        error.statusCode = 400;
        throw error;
      }

      const error = new Error(`ML service returned an error: ${detail}`);
      error.statusCode = status >= 500 ? 502 : status;
      throw error;
    }

    // Unknown error
    const error = new Error('Unable to reach the ML service.');
    error.statusCode = 502;
    throw error;
  }
}

/**
 * Build the proxied result image URL via the Node.js backend.
 * The frontend fetches the annotated image through Node, never directly from FastAPI.
 *
 * @param {string} mlResultUrl - The `/results/{filename}` URL from FastAPI response.
 * @returns {string} Node-proxied URL.
 */
function buildProxiedResultUrl(mlResultUrl) {
  // Extract filename from FastAPI result URL path
  const filename = mlResultUrl.split('/').pop();
  return `/api/results/${filename}`;
}

/**
 * Forward an uploaded video buffer to the FastAPI video prediction endpoint.
 *
 * @param {Buffer} fileBuffer - Raw video file buffer.
 * @param {string} filename - Original filename.
 * @param {string} mimeType - MIME type of the file.
 * @param {object} params - Optional prediction parameters.
 * @returns {Promise<object>} Video prediction response from FastAPI.
 */
async function forwardVideoToML(fileBuffer, filename, mimeType, params = {}) {
  const form = new FormData();
  form.append('file', fileBuffer, {
    filename,
    contentType: mimeType || 'video/mp4',
    knownLength: fileBuffer.length,
  });

  const queryParams = new URLSearchParams();
  if (params.confidence !== undefined) queryParams.set('confidence', params.confidence);
  if (params.iou !== undefined) queryParams.set('iou', params.iou);
  if (params.image_size !== undefined) queryParams.set('image_size', params.image_size);

  const url = `${ML_SERVICE_URL}/predict-video${
    queryParams.toString() ? '?' + queryParams.toString() : ''
  }`;

  logger.info(`Sending video to ML service: ${url}`);

  try {
    const response = await axios.post(url, form, {
      headers: { ...form.getHeaders() },
      // 10-minute timeout for video processing
      timeout: 10 * 60 * 1000,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    return response.data;
  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
      const error = new Error('ML service is unavailable. Please ensure the Python service is running.');
      error.statusCode = 503;
      throw error;
    }
    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      const error = new Error('Video processing timed out. Try a shorter video or lower resolution.');
      error.statusCode = 504;
      throw error;
    }
    if (err.response) {
      const status = err.response.status;
      const detail = err.response.data?.detail || err.response.data?.message || 'ML service error.';
      const error = new Error(detail);
      error.statusCode = status >= 500 ? 502 : status;
      throw error;
    }
    const error = new Error('Unable to reach the ML service.');
    error.statusCode = 502;
    throw error;
  }
}

/**
 * Build the proxied result video URL via the Node.js backend.
 *
 * @param {string} mlResultUrl - The `/results/video/{filename}` URL from FastAPI response.
 * @returns {string} Node-proxied URL.
 */
function buildProxiedVideoResultUrl(mlResultUrl) {
  const filename = mlResultUrl.split('/').pop();
  return `/api/results/video/${filename}`;
}

module.exports = {
  checkMlHealth,
  forwardPrediction,
  buildProxiedResultUrl,
  forwardVideoToML,
  buildProxiedVideoResultUrl,
};
