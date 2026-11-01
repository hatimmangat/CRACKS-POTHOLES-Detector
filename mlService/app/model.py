"""
model.py — YOLO model loader for the ML service.

The model is loaded ONCE at application startup via load_model().
All prediction requests reuse the same loaded model instance.
"""

import os
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# Global model instance — loaded once, reused for every request
_model = None
_model_loaded: bool = False


def load_model():
    """
    Load the YOLO model from MODEL_PATH environment variable.
    Called once during FastAPI application startup.
    """
    global _model, _model_loaded

    model_path_str = os.getenv("MODEL_PATH", "models/best.pt")
    model_path = Path(model_path_str)

    logger.info(f"[ML] Loading YOLO model from: {model_path.resolve()}")

    if not model_path.exists():
        logger.error(
            f"[ML] Model file not found at '{model_path.resolve()}'. "
            "Place your trained best.pt file at that location."
        )
        _model_loaded = False
        return

    try:
        # Import here so that import errors are caught gracefully
        from ultralytics import YOLO

        _model = YOLO(str(model_path))
        _model_loaded = True
        logger.info("[ML] Model loaded successfully.")

        # Log class names detected in the model
        if hasattr(_model, "names"):
            logger.info(f"[ML] Model classes: {_model.names}")

    except Exception as exc:
        logger.error(f"[ML] Failed to load model: {exc}", exc_info=True)
        _model = None
        _model_loaded = False


def get_model():
    """Return the loaded YOLO model instance."""
    return _model


def is_model_loaded() -> bool:
    """Return True if the model was loaded successfully."""
    return _model_loaded
