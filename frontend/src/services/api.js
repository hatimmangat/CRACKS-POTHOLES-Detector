/**
 * api.js — Axios API client for the Road Defect Detection frontend.
 *
 * All requests go to the Node.js backend (VITE_API_URL).
 * The frontend never contacts FastAPI directly.
 */

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // 60 seconds — allow time for YOLO inference
});

/**
 * Run road defect detection on an uploaded image.
 *
 * @param {File} imageFile - The image File object from the user's upload.
 * @param {object} [options] - Optional prediction parameters.
 * @param {number} [options.confidence] - Confidence threshold (0–1).
 * @param {number} [options.iou] - IoU threshold (0–1).
 * @param {number} [options.imageSize] - Inference image size.
 * @returns {Promise<object>}
 */
export async function predictDefects(imageFile, options = {}) {
  const formData = new FormData();
  formData.append('file', imageFile);

  const params = {};
  if (options.confidence !== undefined) params.confidence = options.confidence;
  if (options.iou !== undefined) params.iou = options.iou;
  if (options.imageSize !== undefined) params.image_size = options.imageSize;

  const response = await apiClient.post('/api/predict', formData, {
    params,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

/**
 * Run road defect detection on an uploaded video.
 *
 * @param {File} videoFile - The video File object from the user's upload.
 * @param {object} [options] - Optional prediction parameters.
 * @param {number} [options.confidence] - Confidence threshold (0–1).
 * @param {number} [options.iou] - IoU threshold (0–1).
 * @param {number} [options.imageSize] - Inference image size.
 * @returns {Promise<object>}
 */
export async function predictVideoDefects(videoFile, options = {}) {
  const formData = new FormData();
  formData.append('file', videoFile);

  const params = {};
  if (options.confidence !== undefined) params.confidence = options.confidence;
  if (options.iou !== undefined) params.iou = options.iou;
  if (options.imageSize !== undefined) params.image_size = options.imageSize;

  // Use a dedicated client with 10-minute timeout for video processing
  const response = await axios.post(`${BASE_URL}/api/predict-video`, formData, {
    params,
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 10 * 60 * 1000,
  });

  return response.data;
}

/**
 * Check the health of the Node.js backend (which also checks the ML service).
 *
 * @returns {Promise<object>}
 */
export async function checkHealth() {
  const response = await apiClient.get('/api/health');
  return response.data;
}

/**
 * Build the full URL for a result image proxied through the Node.js backend.
 *
 * @param {string} resultPath - The result_image_url from the prediction response.
 * @returns {string}
 */
export function getResultImageUrl(resultPath) {
  if (!resultPath) return null;
  // resultPath is already /api/results/<filename>, prepend the base URL
  return `${BASE_URL}${resultPath}`;
}

/**
 * Build the full URL for a result video proxied through the Node.js backend.
 *
 * @param {string} resultPath - The result_video_url from the video prediction response.
 * @returns {string}
 */
export function getResultVideoUrl(resultPath) {
  if (!resultPath) return null;
  return `${BASE_URL}${resultPath}`;
}

export default apiClient;

