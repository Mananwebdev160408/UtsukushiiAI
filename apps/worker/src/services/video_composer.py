"""
Video Composer — FFmpeg-based multi-layer composition engine.

Handles: panel sequencing, zoom/pan effects, transitions (fade, slide, glitch),
parallax overlays, text rendering, and final audio-video muxing.
"""

import subprocess
import os
import logging
import shutil
import json
from typing import List, Dict, Any, Optional
from schemas.pipeline import (
    Panel, RenderSettings, TransitionEffect, QualityPreset, EffectsConfig
)
from config.config import settings

logger = logging.getLogger(__name__)


# ── Quality Presets ────────────────────────────────────────────────────

QUALITY_CONFIG = {
    QualityPreset.DRAFT: {"preset": "ultrafast", "crf": 35, "audio_bitrate": "96k"},
    QualityPreset.STANDARD: {"preset": "medium", "crf": 23, "audio_bitrate": "192k"},
    QualityPreset.HIGH: {"preset": "slow", "crf": 18, "audio_bitrate": "256k"},
    QualityPreset.ULTRA: {"preset": "veryslow", "crf": 15, "audio_bitrate": "320k"},
}


def _check_ffmpeg() -> bool:
    """Verify FFmpeg is available on the system."""
    try:
        result = subprocess.run(
            ["ffmpeg", "-version"],
            capture_output=True,
            text=True,
            timeout=5
        )
        return result.returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False


class VideoComposer:
    def __init__(self, output_dir: str = None):
        self.output_dir = output_dir or settings.OUTPUT_PATH
        os.makedirs(self.output_dir, exist_ok=True)
        self.ffmpeg_available = _check_ffmpeg()

        if not self.ffmpeg_available:
            logger.warning("FFmpeg not found on system. Video composition will be limited.")

    def compose(
        self,
        panels: List[Panel],
        audio_path: str,
        audio_analysis: Dict[str, Any],
        render_settings: RenderSettings,
        output_filename: str = "output.mp4",
        progress_callback=None,
    ) -> str:
        """
        Composes the final video from panels, effects, and audio.

        Returns the absolute path to the output video file.
        """
        output_path = os.path.join(self.output_dir, output_filename)

        if not panels:
            raise ValueError("No panels to compose")

        if not self.ffmpeg_available:
            logger.error("FFmpeg is required for video composition")
            raise RuntimeError("FFmpeg not found. Please install FFmpeg.")

        # Calculate per-panel duration from beats
        total_duration = audio_analysis.get("duration", 10.0)
        beat_times = audio_analysis.get("beat_times", [])
        panel_durations = self._calculate_panel_durations(panels, beat_times, total_duration)

        # Build FFmpeg command
        cmd = self._build_ffmpeg_command(
            panels=panels,
            audio_path=audio_path,
            panel_durations=panel_durations,
            render_settings=render_settings,
            output_path=output_path,
        )

        # Execute
        try:
            logger.info(f"Starting video composition: {output_path}")
            logger.debug(f"FFmpeg command: {' '.join(cmd)}")

            process = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=600,  # 10 minute timeout
            )

            if process.returncode != 0:
                logger.error(f"FFmpeg stderr: {process.stderr[-2000:]}")
                raise RuntimeError(f"FFmpeg failed with code {process.returncode}")

            # Verify output exists
            if not os.path.exists(output_path):
                raise RuntimeError("Output file was not created")

            file_size = os.path.getsize(output_path)
            logger.info(f"Composition complete: {output_path} ({file_size / 1024 / 1024:.1f} MB)")
            return output_path

        except subprocess.TimeoutExpired:
            logger.error("FFmpeg timed out after 10 minutes")
            raise RuntimeError("Video composition timed out")
        except Exception as e:
            logger.error(f"Video composition failed: {e}")
            raise

    def _calculate_panel_durations(
        self,
        panels: List[Panel],
        beat_times: List[float],
        total_duration: float
    ) -> List[float]:
        """
        Distributes panels across beat timestamps for rhythm-synced transitions.
        Falls back to even distribution if not enough beats.
        """
        n = len(panels)

        if len(beat_times) >= n + 1:
            # Assign panels to beat intervals
            # Pick n+1 evenly-spaced beats for transitions
            indices = [int(i * (len(beat_times) - 1) / n) for i in range(n + 1)]
            selected_beats = [beat_times[i] for i in indices]

            durations = []
            for i in range(n):
                dur = selected_beats[i + 1] - selected_beats[i]
                durations.append(max(0.5, dur))  # Minimum 0.5s per panel
            return durations
        else:
            # Even distribution
            even_dur = total_duration / n
            return [max(0.5, even_dur)] * n

    def _build_ffmpeg_command(
        self,
        panels: List[Panel],
        audio_path: str,
        panel_durations: List[float],
        render_settings: RenderSettings,
        output_path: str,
    ) -> List[str]:
        """Builds the full FFmpeg command with filter_complex."""
        quality = QUALITY_CONFIG[render_settings.quality]
        w = render_settings.width
        h = render_settings.height
        fps = render_settings.fps
        transition_dur = render_settings.transition_duration

        input_args = []
        filter_parts = []

        # Input 0: audio
        input_args.extend(["-i", audio_path])

        # Add each panel as an input
        for i, panel in enumerate(panels):
            img_path = panel.image_path
            if not img_path or not os.path.exists(img_path):
                logger.warning(f"Panel {i} image not found: {img_path}")
                continue

            dur = panel_durations[i] if i < len(panel_durations) else 3.0
            input_args.extend(["-loop", "1", "-t", f"{dur:.3f}", "-i", img_path])

        n_panels = len(panels)

        # Build per-panel filter chains
        for i in range(n_panels):
            idx = i + 1  # FFmpeg input index (0 is audio)
            dur = panel_durations[i] if i < len(panel_durations) else 3.0
            n_frames = max(1, int(dur * fps))

            # Base: scale to target resolution
            base_filter = f"[{idx}:v]scale={w}:{h}:force_original_aspect_ratio=decrease,pad={w}:{h}:(ow-iw)/2:(oh-ih)/2:black"

            # Add zoom/pan effect if enabled
            if render_settings.effects.zoom:
                zoom_speed = 0.0008
                base_filter += f",zoompan=z='min(zoom+{zoom_speed},{1.3})':d={n_frames}:s={w}x{h}:fps={fps}"
            else:
                base_filter += f",fps={fps}"

            base_filter += f"[v{i}]"
            filter_parts.append(base_filter)

        # Apply transitions between panels
        if n_panels > 1:
            transition_chain = self._build_transition_chain(
                n_panels, panel_durations, render_settings.transition, transition_dur, fps
            )
            filter_parts.extend(transition_chain)
            final_label = f"[outv]"
        else:
            # Single panel
            filter_parts.append(f"[v0]copy[outv]")
            final_label = "[outv]"

        filter_complex = ";".join(filter_parts)

        cmd = [
            "ffmpeg", "-y",
            *input_args,
            "-filter_complex", filter_complex,
            "-map", "[outv]",
            "-map", "0:a",
            "-c:v", render_settings.codec,
            "-pix_fmt", "yuv420p",
            "-preset", quality["preset"],
            "-crf", str(quality["crf"]),
            "-c:a", "aac",
            "-b:a", quality["audio_bitrate"],
            "-shortest",
            "-movflags", "+faststart",
            output_path,
        ]

        return cmd

    def _build_transition_chain(
        self,
        n_panels: int,
        durations: List[float],
        transition: TransitionEffect,
        transition_dur: float,
        fps: int,
    ) -> List[str]:
        """Builds xfade filter chain for smooth transitions between panels."""
        parts = []
        prev_label = "v0"

        for i in range(1, n_panels):
            # Calculate offset: sum of all previous durations minus overlap
            offset = sum(durations[:i]) - transition_dur * i
            offset = max(0, offset)

            xfade_type = self._get_xfade_type(transition)
            out_label = f"xf{i}" if i < n_panels - 1 else "outv"

            parts.append(
                f"[{prev_label}][v{i}]xfade=transition={xfade_type}"
                f":duration={transition_dur:.3f}:offset={offset:.3f}[{out_label}]"
            )
            prev_label = out_label

        return parts

    def _get_xfade_type(self, effect: TransitionEffect) -> str:
        """Maps TransitionEffect enum to FFmpeg xfade transition name."""
        mapping = {
            TransitionEffect.FADE: "fade",
            TransitionEffect.SLIDE_LEFT: "slideleft",
            TransitionEffect.SLIDE_RIGHT: "slideright",
            TransitionEffect.SLIDE_UP: "slideup",
            TransitionEffect.SLIDE_DOWN: "slidedown",
            TransitionEffect.DISSOLVE: "dissolve",
            TransitionEffect.WIPE: "wiperight",
            TransitionEffect.ZOOM_IN: "zoomin",
            TransitionEffect.ZOOM_OUT: "fadeblack",
            TransitionEffect.GLITCH: "pixelize",
            TransitionEffect.NONE: "fade",
        }
        return mapping.get(effect, "fade")

    def add_text_overlay(
        self,
        input_path: str,
        text: str,
        position: str = "bottom",
        font_size: int = 36,
        output_path: str = None,
    ) -> str:
        """
        Adds a text overlay to an existing video.

        Args:
            input_path: Path to input video.
            text: Text to overlay.
            position: "top", "bottom", "center".
            font_size: Font size in pixels.
            output_path: Output path (defaults to input_overlay.mp4).
        """
        if not output_path:
            base, ext = os.path.splitext(input_path)
            output_path = f"{base}_text{ext}"

        y_pos = {
            "top": "50",
            "center": "(h-text_h)/2",
            "bottom": "h-text_h-50",
        }.get(position, "h-text_h-50")

        # Escape text for FFmpeg
        safe_text = text.replace("'", "\\'").replace(":", "\\:")

        cmd = [
            "ffmpeg", "-y",
            "-i", input_path,
            "-vf", (
                f"drawtext=text='{safe_text}'"
                f":fontsize={font_size}"
                f":fontcolor=white"
                f":borderw=3:bordercolor=black"
                f":x=(w-text_w)/2:y={y_pos}"
            ),
            "-c:a", "copy",
            output_path,
        ]

        try:
            subprocess.run(cmd, check=True, capture_output=True, text=True, timeout=120)
            return output_path
        except Exception as e:
            logger.error(f"Text overlay failed: {e}")
            return input_path

    def create_thumbnail(self, video_path: str, timestamp: float = 1.0) -> Optional[str]:
        """Extracts a thumbnail frame from the video."""
        thumb_path = os.path.splitext(video_path)[0] + "_thumb.jpg"

        cmd = [
            "ffmpeg", "-y",
            "-ss", str(timestamp),
            "-i", video_path,
            "-vframes", "1",
            "-q:v", "2",
            thumb_path,
        ]

        try:
            subprocess.run(cmd, check=True, capture_output=True, timeout=30)
            return thumb_path
        except Exception:
            return None

    def get_video_info(self, video_path: str) -> Optional[Dict[str, Any]]:
        """Gets video metadata using ffprobe."""
        cmd = [
            "ffprobe",
            "-v", "quiet",
            "-print_format", "json",
            "-show_format",
            "-show_streams",
            video_path,
        ]

        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
            if result.returncode == 0:
                info = json.loads(result.stdout)
                fmt = info.get("format", {})
                return {
                    "duration": float(fmt.get("duration", 0)),
                    "size_bytes": int(fmt.get("size", 0)),
                    "format": fmt.get("format_name", "unknown"),
                    "bitrate": int(fmt.get("bit_rate", 0)),
                }
        except Exception:
            pass
        return None
