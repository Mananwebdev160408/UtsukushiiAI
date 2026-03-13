"""
Render Pipeline — End-to-end manga-to-video orchestration.

Connects all ML stages: detection → segmentation → depth → animation → composition.
Includes per-stage error recovery, GPU memory management, and progress reporting.
"""

import os
import shutil
import logging
import datetime
import time
from typing import List, Callable, Optional
from PIL import Image

from models.yolo_detector import YOLODetector
from models.sam_segmenter import SAMSegmenter
from models.midas_estimator import MiDaSEstimator
from models.svd_animate import SVDAnimator
from services.audio_analyzer import AudioAnalyzer
from services.video_composer import VideoComposer
from services.music_suggester import MusicSuggester
from schemas.pipeline import (
    PipelineMetadata, Panel, RenderSettings, PipelineStage,
    JobStatus, MusicSuggestion, AudioAnalysisResult
)
from utils.storage import StorageHelper
from utils.device import clear_cache, get_memory_usage

logger = logging.getLogger(__name__)


class PipelineCancelled(Exception):
    """Raised when the pipeline is cancelled by the user."""
    pass


class RenderPipeline:
    def __init__(self):
        self._cancelled = False

        # Lazy-init models on first use to save memory
        self._detector = None
        self._segmenter = None
        self._depth_estimator = None
        self._animator = None
        self._audio_analyzer = None
        self._composer = None
        self._music_suggester = None

    # ── Lazy Model Loading ──────────────────────────────────────────

    @property
    def detector(self) -> YOLODetector:
        if self._detector is None:
            self._detector = YOLODetector()
        return self._detector

    @property
    def segmenter(self) -> SAMSegmenter:
        if self._segmenter is None:
            self._segmenter = SAMSegmenter()
        return self._segmenter

    @property
    def depth_estimator(self) -> MiDaSEstimator:
        if self._depth_estimator is None:
            self._depth_estimator = MiDaSEstimator()
        return self._depth_estimator

    @property
    def animator(self) -> SVDAnimator:
        if self._animator is None:
            self._animator = SVDAnimator()
        return self._animator

    @property
    def audio_analyzer(self) -> AudioAnalyzer:
        if self._audio_analyzer is None:
            self._audio_analyzer = AudioAnalyzer()
        return self._audio_analyzer

    @property
    def composer(self) -> VideoComposer:
        if self._composer is None:
            self._composer = VideoComposer()
        return self._composer

    @property
    def music_suggester(self) -> MusicSuggester:
        if self._music_suggester is None:
            self._music_suggester = MusicSuggester()
        return self._music_suggester

    # ── Cancellation ────────────────────────────────────────────────

    def cancel(self):
        """Sets the cancellation flag. Checked between pipeline stages."""
        self._cancelled = True
        logger.info("Pipeline cancellation requested")

    def _check_cancelled(self):
        if self._cancelled:
            raise PipelineCancelled("Pipeline was cancelled by user")

    # ── Main Pipeline ───────────────────────────────────────────────

    async def execute(
        self,
        project_id: str,
        manga_path: str,
        audio_path: str,
        settings: RenderSettings,
        progress_callback: Optional[Callable[[float, str], None]] = None,
    ) -> PipelineMetadata:
        """
        Runs the full manga-to-video pipeline.

        Returns a PipelineMetadata object with all results and output path.
        """
        self._cancelled = False
        start_time = time.time()

        # Initialize metadata
        metadata = PipelineMetadata(
            project_id=project_id,
            manga_path=manga_path,
            audio_path=audio_path,
            created_at=datetime.datetime.now().isoformat(),
            status=JobStatus.PROCESSING,
            progress=0.0,
        )
        metadata.settings = settings

        # Setup project directory
        project_dir = StorageHelper.get_asset_path("storage", project_id)
        os.makedirs(project_dir, exist_ok=True)
        temp_dir = os.path.join(project_dir, "_temp")
        os.makedirs(temp_dir, exist_ok=True)

        try:
            # ── Stage 1: Audio Analysis ────────────────────────────
            self._check_cancelled()
            self._update_progress(metadata, progress_callback, 5.0, PipelineStage.AUDIO_ANALYSIS, "Analyzing audio...")

            audio_result = self.audio_analyzer.analyze(audio_path)
            metadata.audio_analysis = audio_result
            clear_cache()

            # ── Stage 2: Panel Detection ───────────────────────────
            self._check_cancelled()
            self._update_progress(metadata, progress_callback, 12.0, PipelineStage.PANEL_DETECTION, "Detecting panels...")

            manga_img = Image.open(manga_path).convert("RGB")
            detections = self.detector.detect(manga_img)

            if not detections:
                logger.warning("No panels detected. Using full image as single panel.")
                from schemas.pipeline import BBox, DetectionResult
                detections = [DetectionResult(
                    bbox=BBox(x=0.0, y=0.0, width=1.0, height=1.0),
                    confidence=1.0,
                    class_id=0,
                    label="full_page"
                )]

            clear_cache()

            # ── Stage 3: Per-Panel Processing ──────────────────────
            total_panels = len(detections)
            for i, det in enumerate(detections):
                self._check_cancelled()
                panel_progress = 15.0 + (i / total_panels) * 55.0
                self._update_progress(
                    metadata, progress_callback, panel_progress,
                    PipelineStage.SEGMENTATION,
                    f"Processing panel {i + 1}/{total_panels}..."
                )

                panel_id = f"panel_{i:03d}"
                p = self.detector.get_pixel_bbox(det.bbox, manga_img.width, manga_img.height)
                panel_img = manga_img.crop((p["left"], p["top"], p["right"], p["bottom"]))

                panel_path = os.path.join(project_dir, f"{panel_id}.png")
                panel_img.save(panel_path)

                panel = Panel(
                    id=panel_id,
                    index=i,
                    bbox=det.bbox,
                    image_path=panel_path,
                )

                # 3.1: Segmentation
                try:
                    mask = self.segmenter.segment_panel(panel_img, det.bbox)
                    mask_path = os.path.join(project_dir, f"{panel_id}_mask.png")
                    Image.fromarray(mask * 255).save(mask_path)
                    panel.mask_path = mask_path

                    # 3.2: Character Extraction
                    char_img = self.segmenter.extract_character(panel_img, mask)
                    char_path = os.path.join(project_dir, f"{panel_id}_char.png")
                    char_img.save(char_path)
                    panel.character_path = char_path
                except Exception as e:
                    logger.warning(f"Segmentation failed for panel {i}: {e}. Continuing without mask.")

                clear_cache()

                # 3.3: Depth Estimation & Wiggle
                if settings.effects.parallax or settings.effects.wiggle:
                    try:
                        depth_map = self.depth_estimator.estimate_depth(panel_img)
                        depth_path = os.path.join(project_dir, f"{panel_id}_depth.png")
                        Image.fromarray(depth_map).save(depth_path)
                        panel.depth_map_path = depth_path

                        # Generate wiggle frames
                        if settings.effects.wiggle:
                            wiggle_dir = os.path.join(temp_dir, f"{panel_id}_wiggle")
                            os.makedirs(wiggle_dir, exist_ok=True)
                            wiggle_frames = self.depth_estimator.create_wiggle_frames(
                                panel_img, depth_map, num_frames=settings.fps
                            )
                            for fi, frame in enumerate(wiggle_frames):
                                frame.save(os.path.join(wiggle_dir, f"frame_{fi:04d}.png"))
                            panel.wiggle_frames_dir = wiggle_dir
                    except Exception as e:
                        logger.warning(f"Depth estimation failed for panel {i}: {e}. Continuing without parallax.")

                    clear_cache()

                # 3.4: Character Animation (SVD) — optional, GPU-heavy
                if settings.effects.animation and panel.character_path:
                    try:
                        self._update_progress(
                            metadata, progress_callback, panel_progress + 2,
                            PipelineStage.ANIMATION,
                            f"Animating panel {i + 1}/{total_panels}..."
                        )
                        # Use procedural animation as default (much faster than SVD)
                        animated_frames = self.animator.apply_procedural_animation(
                            panel_img, effect="pulse", num_frames=settings.fps
                        )
                        anim_dir = os.path.join(temp_dir, f"{panel_id}_anim")
                        os.makedirs(anim_dir, exist_ok=True)
                        for fi, frame in enumerate(animated_frames):
                            frame.save(os.path.join(anim_dir, f"frame_{fi:04d}.png"))
                        panel.animated_frames_path = anim_dir
                    except Exception as e:
                        logger.warning(f"Animation failed for panel {i}: {e}. Continuing without animation.")

                    clear_cache()

                metadata.panels.append(panel)

            # ── Stage 4: Video Composition ─────────────────────────
            self._check_cancelled()
            self._update_progress(metadata, progress_callback, 75.0, PipelineStage.COMPOSITION, "Composing final video...")

            audio_dict = {
                "duration": audio_result.duration,
                "bpm": audio_result.bpm,
                "beat_times": audio_result.beat_times,
                "onset_times": audio_result.onset_times,
                "segments": audio_result.segments,
                "energy_profile": audio_result.energy_profile,
            }

            output_path = self.composer.compose(
                panels=metadata.panels,
                audio_path=audio_path,
                audio_analysis=audio_dict,
                render_settings=settings,
                output_filename=f"{project_id}_final.mp4",
            )

            metadata.output_path = output_path

            # ── Stage 5: Metadata Extraction ───────────────────────
            self._update_progress(metadata, progress_callback, 92.0, PipelineStage.ENCODING, "Extracting metadata...")

            video_info = self.composer.get_video_info(output_path)
            if video_info:
                metadata.duration_seconds = video_info.get("duration")
                metadata.file_size_bytes = video_info.get("size_bytes")

            # Generate thumbnail
            self.composer.create_thumbnail(output_path)

            # ── Stage 6: Cleanup ───────────────────────────────────
            self._update_progress(metadata, progress_callback, 96.0, PipelineStage.CLEANUP, "Cleaning up temp files...")
            self._cleanup_temp(temp_dir)

            # ── Done ───────────────────────────────────────────────
            elapsed = time.time() - start_time
            metadata.status = JobStatus.COMPLETED
            metadata.progress = 100.0
            metadata.current_stage = PipelineStage.COMPLETE

            self._update_progress(metadata, progress_callback, 100.0, PipelineStage.COMPLETE, "Render complete!")

            logger.info(f"Pipeline completed in {elapsed:.1f}s. Output: {output_path}")
            return metadata

        except PipelineCancelled:
            metadata.status = JobStatus.CANCELLED
            metadata.error = "Cancelled by user"
            self._cleanup_temp(temp_dir)
            logger.info("Pipeline cancelled by user")
            return metadata

        except Exception as e:
            metadata.status = JobStatus.FAILED
            metadata.error = str(e)
            self._cleanup_temp(temp_dir)
            logger.error(f"Pipeline execution failed: {e}")
            raise

    # ── Music Suggestion (standalone) ──────────────────────────────

    async def suggest_music(self, manga_path: str) -> MusicSuggestion:
        """Analyzes a manga page and suggests music."""
        manga_img = Image.open(manga_path).convert("RGB")

        # Detect panels first
        detections = self.detector.detect(manga_img)

        if not detections:
            # Use full image
            panel_images = [manga_img]
        else:
            panel_images = []
            for det in detections:
                p = self.detector.get_pixel_bbox(det.bbox, manga_img.width, manga_img.height)
                panel_img = manga_img.crop((p["left"], p["top"], p["right"], p["bottom"]))
                panel_images.append(panel_img)

        clear_cache()
        return self.music_suggester.analyze_panels(panel_images)

    # ── Helpers ─────────────────────────────────────────────────────

    def _update_progress(
        self,
        metadata: PipelineMetadata,
        callback: Optional[Callable],
        progress: float,
        stage: PipelineStage,
        message: str,
    ):
        metadata.progress = progress
        metadata.current_stage = stage
        if callback:
            callback(progress, message)

    def _cleanup_temp(self, temp_dir: str):
        """Removes temporary working files."""
        try:
            if os.path.exists(temp_dir):
                shutil.rmtree(temp_dir)
                logger.debug(f"Cleaned up temp dir: {temp_dir}")
        except Exception as e:
            logger.warning(f"Failed to clean up temp dir: {e}")

        clear_cache()

    def unload_models(self):
        """Explicitly unloads all models to free GPU memory."""
        self._detector = None
        self._segmenter = None
        self._depth_estimator = None
        self._animator = None
        clear_cache()
        logger.info("All models unloaded")
