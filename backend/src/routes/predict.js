/**
 * predict.js — Route definitions for the prediction API.
 */

const express = require('express');
const router = express.Router();
const { upload, videoUpload } = require('../middleware/upload');
const { predict, predictVideo, health, getResultImage, getResultVideo } = require('../controllers/predictController');

// GET /api/health — Node + ML service health check
router.get('/health', health);

// POST /api/predict — Upload image and run detection
router.post('/predict', upload.single('file'), predict);

// POST /api/predict-video — Upload video and run detection
router.post('/predict-video', videoUpload.single('file'), predictVideo);

// GET /api/results/:filename — Proxy annotated result image from FastAPI
router.get('/results/:filename', getResultImage);

// GET /api/results/video/:filename — Proxy annotated result video from FastAPI
router.get('/results/video/:filename', getResultVideo);

module.exports = router;

