"""
predictor.py — Core YOLO inference logic.

Accepts a PIL image, runs the YOLO model, returns structured detections
and saves an annotated result image.
"""

import os
import logging
from pathlib import Path
from typing import List, Tuple

import numpy as np
from PIL import Image

from app.model import get_model
from app.schemas import BoundingBox, Detection, Summary, ImageDimensions
from app.utils import generate_result_filename, get_results_dir

logger = logging.getLogger(__name__)

# Default inference parameters (overridable per request)
DEFAULT_CONFIDENCE = float(os.getenv("CONFIDENCE_THRESHOLD", "0.25"))
DEFAULT_IOU = float(os.getenv("IOU_THRESHOLD", "0.45"))
DEFAULT_IMAGE_SIZE = int(os.getenv("IMAGE_SIZE", "640"))


def _get_class_name(model, class_id: int) -> str:
    """
    Retrieve the human-readable class name from the model.
    Falls back to a hard-coded mapping if model names are unavailable.
    Returns lowercase.
    """
    # Prefer reading from the model itself
    if hasattr(model, "names") and isinstance(model.names, dict):
        name = model.names.get(class_id, f"class_{class_id}")
    else:
        # Fallback for the two known classes
        fallback = {0: "crack", 1: "pothole"}
        name = fallback.get(class_id, f"class_{class_id}")

    return name.lower()


def run_prediction(
    pil_image: Image.Image,
    confidence: float = DEFAULT_CONFIDENCE,
    iou: float = DEFAULT_IOU,
    image_size: int = DEFAULT_IMAGE_SIZE,
) -> Tuple[List[Detection], Summary, ImageDimensions, str]:
    """
    Run YOLO inference on a PIL image.

    Args:
        pil_image:   Input road image (RGB).
        confidence:  Minimum confidence threshold.
        iou:         IoU threshold for NMS.
        image_size:  Inference image size.

    Returns:
        (detections, summary, image_dimensions, result_filename)
    """
    model = get_model()
    if model is None:
        raise RuntimeError("YOLO model is not loaded.")

    img_width, img_height = pil_image.size
    image_dimensions = ImageDimensions(width=img_width, height=img_height)

    logger.info(
        f"[ML] Prediction started — size={img_width}x{img_height}, "
        f"conf={confidence}, iou={iou}, imgsz={image_size}"
    )

    # Run inference — model returns a list of Results objects
    results = model.predict(
        source=pil_image,
        conf=confidence,
        iou=iou,
        imgsz=image_size,
        verbose=False,
    )

    detections: List[Detection] = []
    result = results[0]  # Single-image prediction

    if result.boxes is not None and len(result.boxes) > 0:
        boxes = result.boxes

        for box in boxes:
            cls_id = int(box.cls.item())
            conf = round(float(box.conf.item()), 4)
            x1, y1, x2, y2 = [int(v) for v in box.xyxy[0].tolist()]

            class_name = _get_class_name(model, cls_id)

            detections.append(
                Detection(
                    class_id=cls_id,
                    class_name=class_name,
                    confidence=conf,
                    bbox=BoundingBox(x1=x1, y1=y1, x2=x2, y2=y2),
                )
            )

    # Build summary statistics
    crack_count = sum(1 for d in detections if d.class_name == "crack")
    pothole_count = sum(1 for d in detections if d.class_name == "pothole")
    total = len(detections)
    avg_conf = round(
        sum(d.confidence for d in detections) / total if total > 0 else 0.0, 4
    )

    summary = Summary(
        total_detections=total,
        cracks=crack_count,
        potholes=pothole_count,
        average_confidence=avg_conf,
    )

    # Generate and save annotated image
    result_filename = _save_annotated_image(result)

    logger.info(
        f"[ML] Prediction completed — {total} detections "
        f"({crack_count} cracks, {pothole_count} potholes). "
        f"Result: {result_filename}"
    )

    return detections, summary, image_dimensions, result_filename


def _save_annotated_image(result) -> str:
    """
    Save the YOLO-annotated image to the results directory.
    Returns the unique filename.
    """
    results_dir = get_results_dir()
    filename = generate_result_filename()
    output_path = results_dir / filename

    # result.plot() returns a BGR numpy array with bounding boxes drawn
    annotated_bgr = result.plot()

    # Convert BGR → RGB for Pillow
    annotated_rgb = annotated_bgr[:, :, ::-1]
    annotated_pil = Image.fromarray(annotated_rgb)
    annotated_pil.save(str(output_path), format="JPEG", quality=90)

    return filename
