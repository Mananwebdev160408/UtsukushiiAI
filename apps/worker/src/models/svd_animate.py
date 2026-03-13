"""
SVD Animator — Stable Video Diffusion for character animation
with robust procedural animation fallbacks.
"""

import torch
from PIL import Image
import logging
import os
import numpy as np
from typing import List, Optional
from config.config import settings
from utils.device import autocast_context, gpu_memory_guard, enable_memory_efficient_attention

logger = logging.getLogger(__name__)


class SVDAnimator:
    def __init__(self, model_path: str = None, device: str = None):
        if model_path is None:
            model_path = os.path.join(settings.MODEL_CACHE_DIR, "svd")

        self.device = device or settings.DEVICE
        self.model_path = model_path
        self.pipe = None

        if "cuda" not in self.device:
            logger.warning("SVDAnimator requires CUDA for reasonable performance. Procedural fallback will be used on CPU.")
            return

        if not os.path.exists(model_path):
            logger.warning(f"SVD model not found at {model_path}. Procedural animation fallback active.")
            return

        try:
            from diffusers import StableVideoDiffusionPipeline

            self.pipe = StableVideoDiffusionPipeline.from_pretrained(
                model_path,
                torch_dtype=torch.float16 if "cuda" in self.device else torch.float32,
                variant="fp16" if "cuda" in self.device else None,
            )

            if "cuda" in self.device:
                self.pipe.enable_model_cpu_offload()
                self.pipe.enable_vae_slicing()
                enable_memory_efficient_attention(self.pipe.unet)

            logger.info(f"SVD Animator initialized on {self.device}")

        except ImportError:
            logger.warning("diffusers not available. Procedural animation fallback active.")
        except Exception as e:
            logger.error(f"Failed to load SVD pipeline: {e}")
            self.pipe = None

    def animate_character(
        self,
        character_image: Image.Image,
        motion_bucket_id: int = 127,
        num_frames: int = 25,
        decode_chunk_size: int = 8,
        noise_aug_strength: float = 0.1,
    ) -> List[Image.Image]:
        """
        Generates animation frames using Stable Video Diffusion.
        Falls back to procedural animation if SVD is unavailable.
        """
        if self.pipe is None:
            logger.info("SVD not available. Using procedural 'breath' animation fallback.")
            return self.apply_procedural_animation(character_image, "breath", num_frames)

        try:
            # SVD works best on 576x576 or 1024x576
            original_size = character_image.size
            target_size = (576, 576)
            input_image = character_image.resize(target_size, Image.Resampling.LANCZOS)

            with gpu_memory_guard():
                generator = torch.manual_seed(42)
                frames = self.pipe(
                    input_image,
                    decode_chunk_size=decode_chunk_size,
                    generator=generator,
                    motion_bucket_id=motion_bucket_id,
                    noise_aug_strength=noise_aug_strength,
                    num_frames=num_frames,
                ).frames[0]

            # Resize back to original dimensions
            frames = [f.resize(original_size, Image.Resampling.LANCZOS) for f in frames]

            logger.info(f"SVD generated {len(frames)} animation frames")
            return frames

        except Exception as e:
            logger.error(f"SVD animation failed: {e}. Falling back to procedural animation.")
            return self.apply_procedural_animation(character_image, "breath", num_frames)

    def apply_procedural_animation(
        self,
        image: Image.Image,
        effect: str = "pulse",
        num_frames: int = 25,
    ) -> List[Image.Image]:
        """
        Applies lightweight procedural animation effects.

        Effects:
            - pulse: Subtle scale oscillation (breathing pattern)
            - breath: Vertical stretch (chest-rise effect)
            - sway: Gentle horizontal rock
            - hair_flow: Simulated top-region waviness
            - glow: Brightness oscillation
        """
        frames = []
        w, h = image.size
        img_np = np.array(image.convert("RGB")).astype(np.float32)

        for i in range(num_frames):
            phase = (i / num_frames) * 2 * np.pi

            if effect == "pulse":
                scale = 1.0 + 0.02 * np.sin(phase)
                new_size = (int(w * scale), int(h * scale))
                scaled = image.resize(new_size, Image.Resampling.LANCZOS)
                left = (new_size[0] - w) // 2
                top = (new_size[1] - h) // 2
                frame = scaled.crop((left, top, left + w, top + h))

            elif effect == "breath":
                scale_y = 1.0 + 0.015 * np.sin(phase)
                new_h = int(h * scale_y)
                scaled = image.resize((w, new_h), Image.Resampling.LANCZOS)
                top = (new_h - h) // 2
                frame = scaled.crop((0, top, w, top + h))

            elif effect == "sway":
                # Gentle horizontal warp (more at top, fixed at bottom)
                shift = 4.0 * np.sin(phase)
                frame_np = np.copy(img_np)

                for row in range(h):
                    # Top rows shift more, bottom rows shift less
                    factor = 1.0 - (row / h)
                    row_shift = int(shift * factor)
                    frame_np[row] = np.roll(img_np[row], row_shift, axis=0)

                frame = Image.fromarray(frame_np.astype(np.uint8))

            elif effect == "hair_flow":
                # Wave distortion in the top 30% of the image
                frame_np = np.copy(img_np)
                hair_region = int(h * 0.3)

                for row in range(hair_region):
                    amplitude = 2.0 * (1.0 - row / hair_region)
                    dx = int(amplitude * np.sin(phase + row * 0.1))
                    frame_np[row] = np.roll(img_np[row], dx, axis=0)

                frame = Image.fromarray(frame_np.astype(np.uint8))

            elif effect == "glow":
                # Brightness oscillation (subtle bloom)
                brightness_mod = 1.0 + 0.08 * np.sin(phase)
                frame_np = np.clip(img_np * brightness_mod, 0, 255).astype(np.uint8)
                frame = Image.fromarray(frame_np)

            else:
                frame = image.copy()

            frames.append(frame)

        return frames

    def unload(self):
        """Unloads the SVD pipeline to free memory."""
        if self.pipe is not None:
            del self.pipe
            self.pipe = None
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            logger.info("SVD pipeline unloaded")
