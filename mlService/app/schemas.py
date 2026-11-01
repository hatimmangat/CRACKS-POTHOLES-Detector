"""
schemas.py — Pydantic models for FastAPI request/response validation.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class BoundingBox(BaseModel):
    x1: int = Field(..., description="Left coordinate (pixels)")
    y1: int = Field(..., description="Top coordinate (pixels)")
    x2: int = Field(..., description="Right coordinate (pixels)")
    y2: int = Field(..., description="Bottom coordinate (pixels)")


class Detection(BaseModel):
    class_id: int = Field(..., description="Numeric class ID from model")
    class_name: str = Field(..., description="Human-readable class name (lowercase)")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Detection confidence 0-1")
    bbox: BoundingBox


class Summary(BaseModel):
    total_detections: int
    cracks: int
    potholes: int
    average_confidence: float = Field(..., description="Mean confidence across all detections")


class ImageDimensions(BaseModel):
    width: int
    height: int


class PredictionResponse(BaseModel):
    success: bool
    detections: List[Detection]
    summary: Summary
    image_dimensions: ImageDimensions
    result_image_url: Optional[str] = Field(
        None, description="URL to retrieve the annotated result image"
    )
    message: Optional[str] = None


class VideoSummary(BaseModel):
    total_frames: int
    processed_frames: int
    total_detections: int
    cracks: int
    potholes: int
    average_confidence: float


class VideoDetectionResponse(BaseModel):
    success: bool
    summary: VideoSummary
    result_video_url: Optional[str] = Field(
        None, description="URL to retrieve the annotated result video"
    )
    message: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    service: str
    model_loaded: bool


class ErrorResponse(BaseModel):
    success: bool = False
    message: str

