"""
main.py — FastAPI application entry point for the Road Defect Detection ML service.

Model is loaded ONCE at startup via the lifespan context manager.
"""

import logging
import os
import tempfile
import shutil
import subprocess
from contextlib import asynccontextmanager
from pathlib import Path

import cv2
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

from app.model import is_model_loaded, load_model
from app.predictor import run_prediction
from app.schemas import (
    ErrorResponse,
    HealthResponse,
    PredictionResponse,
    VideoDetectionResponse,
    VideoSummary,
)
from app.utils import (
    cleanup_file,
    generate_video_result_filename,
    get_video_results_dir,
    read_image_from_bytes,
    safe_result_path,
    safe_video_result_path,
    validate_image_file,
    validate_video_file,
)

# Load environment variables from .env
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — load model on startup."""
    logger.info("[ML] Starting Road Defect ML Service...")
    load_model()
    if is_model_loaded():
        logger.info("[ML] Service ready to accept predictions.")
    else:
        logger.warning("[ML] Service started but model is NOT loaded. Predictions will fail.")
    yield
    logger.info("[ML] Shutting down ML Service.")


app = FastAPI(
    title="Road Defect Detection ML Service",
    description="FastAPI service for detecting road cracks and potholes using YOLO.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — only the Node.js backend should call this service
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────
# Health Check
# ─────────────────────────────────────────────

@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health():
    """Return service health and model load status."""
    return HealthResponse(
        status="ok",
        service="ml-service",
        model_loaded=is_model_loaded(),
    )


# ─────────────────────────────────────────────
# Image Prediction Endpoint
# ─────────────────────────────────────────────

@app.post("/predict", response_model=PredictionResponse, tags=["Prediction"])
async def predict(
    file: UploadFile = File(..., description="Road image file (jpg/jpeg/png/webp)"),
    confidence: float = Query(default=0.25, ge=0.01, le=1.0, description="Confidence threshold"),
    iou: float = Query(default=0.45, ge=0.01, le=1.0, description="IoU threshold for NMS"),
    image_size: int = Query(default=640, ge=320, le=1280, description="Inference image size"),
):
    """
    Accept an uploaded road image and run YOLO detection.

    Returns:
        Structured JSON with detections, bounding boxes, confidence scores,
        summary statistics, and a URL to the annotated result image.
    """
    if not is_model_loaded():
        raise HTTPException(
            status_code=503,
            detail="ML model is not loaded. Check server logs and model file path.",
        )

    # Read upload bytes
    image_bytes = await file.read()

    # Validate file metadata
    is_valid, error_msg = validate_image_file(
        filename=file.filename or "",
        content_type=file.content_type or "",
        file_size=len(image_bytes),
    )
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)

    # Parse image
    try:
        pil_image = read_image_from_bytes(image_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    # Run YOLO inference
    try:
        detections, summary, image_dimensions, result_filename = run_prediction(
            pil_image=pil_image,
            confidence=confidence,
            iou=iou,
            image_size=image_size,
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        logger.error(f"[ML] Unexpected prediction error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail="Prediction failed due to an internal error.")

    result_image_url = f"/results/{result_filename}"

    return PredictionResponse(
        success=True,
        detections=detections,
        summary=summary,
        image_dimensions=image_dimensions,
        result_image_url=result_image_url,
    )


# ─────────────────────────────────────────────
# Video Prediction Endpoint
# ─────────────────────────────────────────────

@app.post("/predict-video", response_model=VideoDetectionResponse, tags=["Prediction"])
async def predict_video(
    file: UploadFile = File(..., description="Road video file (mp4/avi/mov/webm)"),
    confidence: float = Query(default=0.25, ge=0.01, le=1.0, description="Confidence threshold"),
    iou: float = Query(default=0.45, ge=0.01, le=1.0, description="IoU threshold for NMS"),
    image_size: int = Query(default=640, ge=320, le=1280, description="Inference image size"),
):
    """
    Accept an uploaded road video and run YOLO detection frame-by-frame.

    Returns:
        JSON with detection summary statistics and URL to the annotated output video.
    """
    from app.model import get_model

    if not is_model_loaded():
        raise HTTPException(
            status_code=503,
            detail="ML model is not loaded. Check server logs and model file path.",
        )

    # Read upload bytes
    video_bytes = await file.read()
    file_size = len(video_bytes)

    # Validate file metadata (allow any content type since browsers vary for video)
    is_valid, error_msg = validate_video_file(
        filename=file.filename or "",
        content_type=file.content_type or "",
        file_size=file_size,
    )
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)

    logger.info(
        f"[ML] Video prediction started — file={file.filename}, "
        f"size={file_size / (1024*1024):.1f} MB, conf={confidence}, iou={iou}"
    )

    # Write bytes to a temp file so OpenCV can read it
    suffix = Path(file.filename or "video.mp4").suffix.lower()
    tmp_input = None
    try:
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            tmp.write(video_bytes)
            tmp_input = Path(tmp.name)

        # Open video with OpenCV to get metadata
        cap = cv2.VideoCapture(str(tmp_input))
        if not cap.isOpened():
            raise HTTPException(status_code=400, detail="Could not open video file.")

        fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        cap.release()

        # Prepare output video file
        video_results_dir = get_video_results_dir()
        result_filename = generate_video_result_filename()
        output_path = video_results_dir / result_filename
        raw_output_path = video_results_dir / f"raw_{result_filename}"

        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        writer = cv2.VideoWriter(str(raw_output_path), fourcc, fps, (width, height))

        model = get_model()

        # Run inference with stream=True for memory efficiency
        total_detections = 0
        crack_count = 0
        pothole_count = 0
        confidence_sum = 0.0
        processed_frames = 0

        results_gen = model.predict(
            source=str(tmp_input),
            conf=confidence,
            iou=iou,
            imgsz=image_size,
            stream=True,
            verbose=False,
        )

        for frame_result in results_gen:
            # Draw annotations on frame
            annotated_bgr = frame_result.plot()
            writer.write(annotated_bgr)
            processed_frames += 1

            # Accumulate detection stats
            if frame_result.boxes is not None:
                for box in frame_result.boxes:
                    cls_id = int(box.cls.item())
                    conf_val = float(box.conf.item())
                    total_detections += 1
                    confidence_sum += conf_val
                    if cls_id == 0:
                        crack_count += 1
                    elif cls_id == 1:
                        pothole_count += 1

        writer.release()

        # Re-encode to web-compatible H.264 MP4 (+faststart) using ffmpeg if available
        ffmpeg_bin = shutil.which("ffmpeg")
        if ffmpeg_bin:
            try:
                subprocess.run(
                    [
                        ffmpeg_bin,
                        "-y",
                        "-i",
                        str(raw_output_path),
                        "-c:v",
                        "libx264",
                        "-pix_fmt",
                        "yuv420p",
                        "-preset",
                        "fast",
                        "-movflags",
                        "+faststart",
                        str(output_path),
                    ],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    check=True,
                )
                cleanup_file(raw_output_path)
            except Exception as ffmpeg_err:
                logger.warning(f"[ML] ffmpeg conversion failed ({ffmpeg_err}), keeping raw output.")
                if raw_output_path.exists():
                    raw_output_path.rename(output_path)
        else:
            if raw_output_path.exists():
                raw_output_path.rename(output_path)

        avg_conf = round(confidence_sum / total_detections if total_detections > 0 else 0.0, 4)

        logger.info(
            f"[ML] Video prediction completed — {processed_frames} frames, "
            f"{total_detections} detections ({crack_count} cracks, {pothole_count} potholes). "
            f"Result: {result_filename}"
        )

        return VideoDetectionResponse(
            success=True,
            summary=VideoSummary(
                total_frames=total_frames,
                processed_frames=processed_frames,
                total_detections=total_detections,
                cracks=crack_count,
                potholes=pothole_count,
                average_confidence=avg_conf,
            ),
            result_video_url=f"/results/video/{result_filename}",
        )

    except HTTPException:
        raise
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        logger.error(f"[ML] Unexpected video prediction error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail="Video prediction failed due to an internal error.")
    finally:
        if tmp_input and tmp_input.exists():
            cleanup_file(tmp_input)
        if "raw_output_path" in locals() and raw_output_path.exists():
            cleanup_file(raw_output_path)


# ─────────────────────────────────────────────
# Result Image Serving
# ─────────────────────────────────────────────

@app.get("/results/{filename}", tags=["Results"])
async def get_result_image(filename: str):
    """
    Serve a previously generated annotated result image.
    Only UUID-pattern filenames are accepted (prevents path traversal).
    """
    try:
        safe_path = safe_result_path(filename)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid result filename.")

    if not safe_path.exists():
        raise HTTPException(status_code=404, detail="Result image not found.")

    return FileResponse(
        path=str(safe_path),
        media_type="image/jpeg",
        filename=filename,
    )


# ─────────────────────────────────────────────
# Result Video Serving
# ─────────────────────────────────────────────

@app.get("/results/video/{filename}", tags=["Results"])
async def get_result_video(filename: str):
    """
    Serve a previously generated annotated result video.
    Only UUID-pattern filenames are accepted (prevents path traversal).
    """
    try:
        safe_path = safe_video_result_path(filename)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid video result filename.")

    if not safe_path.exists():
        raise HTTPException(status_code=404, detail="Result video not found.")

    media_type = "video/mp4"
    if filename.endswith(".webm"):
        media_type = "video/webm"
    elif filename.endswith(".mov"):
        media_type = "video/quicktime"
    elif filename.endswith(".avi"):
        media_type = "video/x-msvideo"

    return FileResponse(
        path=str(safe_path),
        media_type=media_type,
        filename=filename,
    )


# ─────────────────────────────────────────────
# Global error handler
# ─────────────────────────────────────────────

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"[ML] Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": "An internal server error occurred."},
    )

