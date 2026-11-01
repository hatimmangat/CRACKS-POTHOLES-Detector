/**
 * upload.js — Multer middleware for handling image and video uploads.
 *
 * Uses memory storage so the file buffer is forwarded to FastAPI
 * without writing unnecessarily to disk.
 */

const multer = require('multer');
const path = require('path');

// ── Image config ──────────────────────────────────────────────────
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

const ALLOWED_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

// 20 MB limit for images
const MAX_IMAGE_SIZE = 20 * 1024 * 1024;

// ── Video config ──────────────────────────────────────────────────
const ALLOWED_VIDEO_EXTENSIONS = new Set(['.mp4', '.avi', '.mov', '.webm', '.mkv']);

// 200 MB limit for videos
const MAX_VIDEO_SIZE = 200 * 1024 * 1024;

const storage = multer.memoryStorage();

// Image file filter
const imageFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  if (!ALLOWED_IMAGE_MIME_TYPES.has(mime) || !ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
    return cb(
      new multer.MulterError(
        'LIMIT_UNEXPECTED_FILE',
        `Unsupported file type. Allowed types: jpg, jpeg, png, webp.`
      ),
      false
    );
  }

  cb(null, true);
};

// Video file filter — check extension only (MIME types vary by browser)
const videoFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED_VIDEO_EXTENSIONS.has(ext)) {
    return cb(
      new multer.MulterError(
        'LIMIT_UNEXPECTED_FILE',
        `Unsupported video type. Allowed types: mp4, avi, mov, webm.`
      ),
      false
    );
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_IMAGE_SIZE,
    files: 1,
  },
});

const videoUpload = multer({
  storage,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: MAX_VIDEO_SIZE,
    files: 1,
  },
});

module.exports = { upload, videoUpload };

