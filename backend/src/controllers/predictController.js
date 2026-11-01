/**
 * predictController.js — Handles image and video prediction requests.
 *
 * Flow (image):
 *   1. Multer validates and buffers the uploaded file.
 *   2. Controller forwards the buffer to the FastAPI ML service.
 *   3. FastAPI runs YOLO inference and returns structured JSON.
 *   4. Controller rewrites the result image URL to the proxied Node endpoint.
 *   5. Clean response is returned to the React frontend.
 *
 * Flow (video):
 *   Same, but uses /predict-video on FastAPI, longer timeout, returns video URL.
 */

const logger = require('../utils/logger');
const {
  checkMlHealth,
  forwardPrediction,
  buildProxiedResultUrl,
  forwardVideoToML,
  buildProxiedVideoResultUrl,
} = require('../services/mlService');
const axios = require('axios');

/**
 * POST /api/predict
 * Run road defect detection on an uploaded image.
 */
async function predict(req, res, next) {
  logger.info('Image prediction request received.');

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No image file was uploaded. Please attach an image.',
    });
  }

  const { buffer, originalname, mimetype } = req.file;

  logger.info(`Sending image "${originalname}" (${mimetype}, ${buffer.length} bytes) to ML service.`);

  try {
    // Forward to FastAPI
    const mlResponse = await forwardPrediction(buffer, originalname, mimetype, {
      confidence: req.query.confidence,
      iou: req.query.iou,
      image_size: req.query.image_size,
    });

    // Rewrite the FastAPI result image URL to the Node-proxied URL
    if (mlResponse.result_image_url) {
      mlResponse.result_image_url = buildProxiedResultUrl(mlResponse.result_image_url);
    }

    logger.success(
      `Image prediction successful — ${mlResponse.summary?.total_detections ?? 0} detection(s).`
    );

    return res.status(200).json(mlResponse);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/predict-video
 * Run road defect detection on an uploaded video.
 */
async function predictVideo(req, res, next) {
  logger.info('Video prediction request received.');

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No video file was uploaded. Please attach a video.',
    });
  }

  const { buffer, originalname, mimetype } = req.file;

  logger.info(`Sending video "${originalname}" (${(buffer.length / (1024 * 1024)).toFixed(1)} MB) to ML service.`);

  try {
    const mlResponse = await forwardVideoToML(buffer, originalname, mimetype, {
      confidence: req.query.confidence,
      iou: req.query.iou,
      image_size: req.query.image_size,
    });

    // Rewrite the FastAPI result video URL to the Node-proxied URL
    if (mlResponse.result_video_url) {
      mlResponse.result_video_url = buildProxiedVideoResultUrl(mlResponse.result_video_url);
    }

    logger.success(
      `Video prediction successful — ${mlResponse.summary?.total_detections ?? 0} total detection(s).`
    );

    return res.status(200).json(mlResponse);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/health
 * Return Node.js backend status and ML service health.
 */
async function health(req, res) {
  const nodeHealth = {
    status: 'ok',
    service: 'node-backend',
  };

  try {
    const mlHealth = await checkMlHealth();
    return res.status(200).json({
      ...nodeHealth,
      ml_service: mlHealth,
    });
  } catch {
    return res.status(200).json({
      ...nodeHealth,
      ml_service: {
        status: 'unavailable',
        model_loaded: false,
      },
    });
  }
}

/**
 * GET /api/results/:filename
 * Proxy the annotated result image from FastAPI to the frontend.
 * The browser never contacts FastAPI directly.
 */
async function getResultImage(req, res, next) {
  const { filename } = req.params;

  // Basic safety: only allow UUID-pattern filenames
  const safePattern = /^prediction_[a-f0-9]{32}\.jpg$/;
  if (!safePattern.test(filename)) {
    return res.status(400).json({ success: false, message: 'Invalid result filename.' });
  }

  const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
  const upstreamUrl = `${ML_SERVICE_URL}/results/${filename}`;

  try {
    const mlResponse = await axios.get(upstreamUrl, {
      responseType: 'stream',
      timeout: 10000,
    });

    if (req.query.download === 'true') {
      res.setHeader('Content-Disposition', `attachment; filename="${req.query.name || 'detected_image.jpg'}"`);
    }
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=600');
    mlResponse.data.pipe(res);
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ success: false, message: 'Result image not found.' });
    }
    next(err);
  }
}

/**
 * GET /api/results/video/:filename
 * Proxy the annotated result video from FastAPI to the frontend.
 * Supports HTTP Range requests for seeking and direct download.
 */
async function getResultVideo(req, res, next) {
  const { filename } = req.params;

  // Basic safety: only allow UUID-pattern filenames with supported video extensions
  const safePattern = /^video_[a-f0-9]{32}\.(mp4|webm|mov|avi)$/;
  if (!safePattern.test(filename)) {
    return res.status(400).json({ success: false, message: 'Invalid video result filename.' });
  }

  const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
  const upstreamUrl = `${ML_SERVICE_URL}/results/video/${filename}`;

  try {
    const headers = {};
    if (req.headers.range) {
      headers.Range = req.headers.range;
    }

    const mlResponse = await axios.get(upstreamUrl, {
      responseType: 'stream',
      headers,
      timeout: 30000,
    });

    if (mlResponse.headers['content-range']) {
      res.status(206);
      res.setHeader('Content-Range', mlResponse.headers['content-range']);
    }
    if (mlResponse.headers['content-length']) {
      res.setHeader('Content-Length', mlResponse.headers['content-length']);
    }

    let contentType = mlResponse.headers['content-type'] || 'video/mp4';
    if (filename.endsWith('.webm')) contentType = 'video/webm';
    else if (filename.endsWith('.mov')) contentType = 'video/quicktime';
    else if (filename.endsWith('.avi')) contentType = 'video/x-msvideo';

    if (req.query.download === 'true') {
      res.setHeader('Content-Disposition', `attachment; filename="${req.query.name || 'detected_video.mp4'}"`);
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=600');
    mlResponse.data.pipe(res);
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ success: false, message: 'Result video not found.' });
    }
    next(err);
  }
}

module.exports = { predict, predictVideo, health, getResultImage, getResultVideo };
