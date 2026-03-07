from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class BBox(BaseModel):
    x: float = Field(..., description="Normalized x coordinate (0.0 - 1.0)")
    y: float = Field(..., description="Normalized y coordinate (0.0 - 1.0)")
    width: float = Field(..., description="Normalized width (0.0 - 1.0)")
    height: float = Field(..., description="Normalized height (0.0 - 1.0)")

class DetectionResult(BaseModel):
    bbox: BBox
    confidence: float
    class_id: int
    label: Optional[str] = None

class Panel(BaseModel):
    id: str
    index: int
    bbox: BBox
    image_path: Optional[str] = None
    mask_path: Optional[str] = None
    depth_map_path: Optional[str] = None
    character_path: Optional[str] = None
    animated_frames_path: Optional[str] = None

class RenderSettings(BaseModel):
    quality: str = Field("standard", pattern="^(draft|standard|high|ultra)$")
    fps: int = 24
    width: int = 1080
    height: int = 1920
    effects: Dict[str, bool] = {
        "parallax": True,
        "glow": True,
        "zoom": True,
        "animation": True
    }

class PipelineMetadata(BaseModel):
    project_id: str
    manga_path: str
    audio_path: str
    created_at: str
    status: str
    progress: float
    settings: RenderSettings = Field(default_factory=RenderSettings)
    panels: List[Panel] = []
    audio_analysis: Optional[Dict[str, Any]] = None
