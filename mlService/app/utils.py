"""
utils.py — File validation and safe filename utilities for the ML service.
"""

import os
import re
import uuid
import logging
from pathlib import Path
from typing import Tuple

from PIL import Image
import io

logger = logging.getLogger(__name__)

# Allowed MIME types and their extensions
ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
}

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

ALLOWED_VIDEO_CONTENT_TYPES = {
    "video/mp4",
    "video/avi",
    "video/x-msvideo",
    "video/quicktime",
    "video/webm",
    "video/x-matroska",
    "application/octet-stream",  # some browsers send this for .avi
}

ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".avi", ".mov", ".webm", ".mkv"}

# Maximum upload size: 20 MB for images
MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024

# Maximum upload size: 200 MB for videos
MAX_VIDEO_SIZE_BYTES = 200 * 1024 * 1024


def validate_image_file(filename: str, content_type: str, file_size: int) -> Tuple[bool, str]:
    """
    Validate an uploaded image file.

    Returns:
        (is_valid: bool, error_message: str)
    """
    if not filename:
        return False, "No filename provided."

    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        return False, f"File extension '{ext}' is not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"

    if content_type not in ALLOWED_CONTENT_TYPES:
        return False, f"Content type '{content_type}' is not allowed."

    if file_size > MAX_FILE_SIZE_BYTES:
        return False, f"File size exceeds maximum allowed ({MAX_FILE_SIZE_BYTES // (1024*1024)} MB)."

    return True, ""


def validate_video_file(filename: str, content_type: str, file_size: int) -> Tuple[bool, str]:
    """
    Validate an uploaded video file.

    Returns:
        (is_valid: bool, error_message: str)
    """
    if not filename:
        return False, "No filename provided."

    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_VIDEO_EXTENSIONS:
        return False, (
            f"File extension '{ext}' is not allowed. "
            f"Allowed: {', '.join(ALLOWED_VIDEO_EXTENSIONS)}"
        )

    if file_size > MAX_VIDEO_SIZE_BYTES:
        return False, f"File size exceeds maximum allowed ({MAX_VIDEO_SIZE_BYTES // (1024*1024)} MB)."

    return True, ""


def read_image_from_bytes(image_bytes: bytes) -> Image.Image:
    """
    Open and validate a PIL image from raw bytes.
    Raises ValueError if the bytes do not represent a valid image.
    """
    try:
        img = Image.open(io.BytesIO(image_bytes))
        img.verify()  # Verify it's a real image (moves file pointer)
        # Re-open after verify (verify closes the stream)
        img = Image.open(io.BytesIO(image_bytes))
        img = img.convert("RGB")  # Ensure consistent 3-channel format
        return img
    except Exception as exc:
        raise ValueError(f"Cannot read image data: {exc}") from exc


def generate_result_filename() -> str:
    """Generate a UUID-based filename for a prediction result image."""
    return f"prediction_{uuid.uuid4().hex}.jpg"


def generate_video_result_filename() -> str:
    """Generate a UUID-based filename for a video prediction result."""
    return f"video_{uuid.uuid4().hex}.mp4"


def get_results_dir() -> Path:
    """Return the results directory path, creating it if necessary."""
    results_dir = Path("results")
    results_dir.mkdir(parents=True, exist_ok=True)
    return results_dir


def get_video_results_dir() -> Path:
    """Return the video results directory path, creating it if necessary."""
    results_dir = Path("results") / "video"
    results_dir.mkdir(parents=True, exist_ok=True)
    return results_dir


def safe_result_path(filename: str) -> Path:
    """
    Validate that a result filename is safe (UUID pattern only).
    Prevents path traversal attacks.

    Returns the full path if safe, raises ValueError otherwise.
    """
    # Only allow filenames matching: prediction_<32hex>.jpg
    pattern = re.compile(r"^prediction_[a-f0-9]{32}\.jpg$")
    if not pattern.match(filename):
        raise ValueError(f"Invalid result filename: '{filename}'")

    results_dir = get_results_dir()
    safe_path = (results_dir / filename).resolve()

    # Ensure the resolved path is inside the results directory
    if not str(safe_path).startswith(str(results_dir.resolve())):
        raise ValueError("Path traversal detected.")

    return safe_path


def safe_video_result_path(filename: str) -> Path:
    """
    Validate that a video result filename is safe (UUID pattern only).
    Prevents path traversal attacks.

    Returns the full path if safe, raises ValueError otherwise.
    """
    # Allow filenames matching: video_<32hex>.(mp4|webm|mov|avi)
    pattern = re.compile(r"^video_[a-f0-9]{32}\.(mp4|webm|mov|avi)$")
    if not pattern.match(filename):
        raise ValueError(f"Invalid video result filename: '{filename}'")

    results_dir = get_video_results_dir()
    safe_path = (results_dir / filename).resolve()

    # Ensure the resolved path is inside the results directory
    if not str(safe_path).startswith(str(results_dir.resolve())):
        raise ValueError("Path traversal detected.")

    return safe_path


def cleanup_file(path: Path) -> None:
    """Delete a file silently if it exists."""
    try:
        if path.exists():
            path.unlink()
            logger.debug(f"[ML] Cleaned up temporary file: {path}")
    except Exception as exc:
        logger.warning(f"[ML] Could not delete file {path}: {exc}")

