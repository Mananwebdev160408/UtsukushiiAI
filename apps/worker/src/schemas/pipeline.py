from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum


# ── Enums ──────────────────────────────────────────────────────────────

class TransitionEffect(str, Enum):
    FADE = "fade"
    SLIDE_LEFT = "slide_left"
    SLIDE_RIGHT = "slide_right"
    SLIDE_UP = "slide_up"
    SLIDE_DOWN = "slide_down"
    GLITCH = "glitch"
    ZOOM_IN = "zoom_in"
    ZOOM_OUT = "zoom_out"
    DISSOLVE = "dissolve"
    WIPE = "wipe"
    NONE = "none"


class AnimationEffect(str, Enum):
    PULSE = "pulse"
    BREATH = "breath"
    SVD = "svd"
    PARALLAX = "parallax"
    WIGGLE = "wiggle"
    NONE = "none"


class QualityPreset(str, Enum):
    DRAFT = "draft"
    STANDARD = "standard"
    HIGH = "high"
    ULTRA = "ultra"


class AudioMood(str, Enum):
    ENERGETIC = "energetic"
    CALM = "calm"
    DARK = "dark"
    EPIC = "epic"
    MELANCHOLY = "melancholy"
    ROMANTIC = "romantic"
    COMEDIC = "comedic"
    TENSE = "tense"
    MYSTERIOUS = "mysterious"
    NEUTRAL = "neutral"


class MangaGenre(str, Enum):
    ACTION = "action"
    ROMANCE = "romance"
    HORROR = "horror"
    COMEDY = "comedy"
    DRAMA = "drama"
    FANTASY = "fantasy"
    SLICE_OF_LIFE = "slice_of_life"
    MYSTERY = "mystery"
    SCI_FI = "sci_fi"
    UNKNOWN = "unknown"


class JobStatus(str, Enum):
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class PipelineStage(str, Enum):
    AUDIO_ANALYSIS = "audio_analysis"
    PANEL_DETECTION = "panel_detection"
    SEGMENTATION = "segmentation"
    DEPTH_ESTIMATION = "depth_estimation"
    ANIMATION = "animation"
    COMPOSITION = "composition"
    ENCODING = "encoding"
    CLEANUP = "cleanup"
    COMPLETE = "complete"


# ── Core Schemas ───────────────────────────────────────────────────────

class BBox(BaseModel):
    x: float = Field(..., ge=0.0, le=1.0, description="Normalized x coordinate")
    y: float = Field(..., ge=0.0, le=1.0, description="Normalized y coordinate")
    width: float = Field(..., gt=0.0, le=1.0, description="Normalized width")
    height: float = Field(..., gt=0.0, le=1.0, description="Normalized height")


class DetectionResult(BaseModel):
    bbox: BBox
    confidence: float = Field(..., ge=0.0, le=1.0)
    class_id: int
    label: Optional[str] = None


# ── Panel & Transition ─────────────────────────────────────────────────

class PanelTransition(BaseModel):
    effect: TransitionEffect = TransitionEffect.FADE
    duration: float = Field(0.5, ge=0.1, le=3.0, description="Transition duration in seconds")

class Panel(BaseModel):
    id: str
    index: int
    bbox: BBox
    image_path: Optional[str] = None
    mask_path: Optional[str] = None
    depth_map_path: Optional[str] = None
    character_path: Optional[str] = None
    animated_frames_path: Optional[str] = None
    wiggle_frames_dir: Optional[str] = None
    transition: PanelTransition = Field(default_factory=PanelTransition)
    animation_effect: AnimationEffect = AnimationEffect.PARALLAX
    duration: Optional[float] = None  # computed from audio beats


# ── Render Settings ────────────────────────────────────────────────────

class EffectsConfig(BaseModel):
    parallax: bool = True
    glow: bool = True
    zoom: bool = True
    animation: bool = True
    wiggle: bool = True
    text_overlay: bool = False

class RenderSettings(BaseModel):
    quality: QualityPreset = QualityPreset.STANDARD
    fps: int = Field(24, ge=12, le=60)
    width: int = Field(1080, ge=480, le=3840)
    height: int = Field(1920, ge=480, le=3840)
    codec: str = Field("libx264", pattern="^(libx264|libx265)$")
    effects: EffectsConfig = Field(default_factory=EffectsConfig)
    transition: TransitionEffect = TransitionEffect.FADE
    transition_duration: float = Field(0.5, ge=0.1, le=3.0)


# ── Music Suggestion ───────────────────────────────────────────────────

class VisualFeatures(BaseModel):
    """Features extracted from manga panel visual analysis."""
    dominant_colors: List[List[int]] = Field(default_factory=list, description="Top 5 RGB colors")
    brightness: float = Field(0.5, ge=0.0, le=1.0, description="Average brightness")
    contrast: float = Field(0.5, ge=0.0, le=1.0, description="Contrast ratio")
    edge_density: float = Field(0.5, ge=0.0, le=1.0, description="Action/detail intensity")
    text_density: float = Field(0.0, ge=0.0, le=1.0, description="Amount of text/dialogue")
    panel_count: int = Field(1, ge=1, description="Number of panels detected")
    scene_complexity: float = Field(0.5, ge=0.0, le=1.0, description="Overall scene complexity")

class MusicSuggestion(BaseModel):
    """Result from the music suggestion engine."""
    detected_genre: MangaGenre = MangaGenre.UNKNOWN
    detected_mood: AudioMood = AudioMood.NEUTRAL
    suggested_genres: List[str] = Field(default_factory=list, description="Music genre suggestions")
    suggested_bpm_range: List[int] = Field(default_factory=lambda: [90, 130])
    search_keywords: List[str] = Field(default_factory=list, description="Keywords for music search")
    confidence: float = Field(0.5, ge=0.0, le=1.0)
    visual_features: Optional[VisualFeatures] = None
    reasoning: str = ""


# ── Audio Analysis ─────────────────────────────────────────────────────

class AudioAnalysisResult(BaseModel):
    duration: float
    bpm: float
    beat_times: List[float] = Field(default_factory=list)
    onset_times: List[float] = Field(default_factory=list)
    segments: List[Dict[str, float]] = Field(default_factory=list)
    energy_profile: List[float] = Field(default_factory=list)
    mood: AudioMood = AudioMood.NEUTRAL
    key: Optional[str] = None


# ── Pipeline Metadata ──────────────────────────────────────────────────

class ProgressUpdate(BaseModel):
    stage: PipelineStage
    progress: float = Field(0.0, ge=0.0, le=100.0)
    message: str = ""
    panel_index: Optional[int] = None

class PipelineMetadata(BaseModel):
    project_id: str
    manga_path: str
    audio_path: str
    created_at: str
    status: JobStatus = JobStatus.QUEUED
    progress: float = Field(0.0, ge=0.0, le=100.0)
    current_stage: PipelineStage = PipelineStage.AUDIO_ANALYSIS
    settings: RenderSettings = Field(default_factory=RenderSettings)
    panels: List[Panel] = Field(default_factory=list)
    audio_analysis: Optional[AudioAnalysisResult] = None
    music_suggestion: Optional[MusicSuggestion] = None
    output_path: Optional[str] = None
    error: Optional[str] = None
    duration_seconds: Optional[float] = None
    file_size_bytes: Optional[int] = None
