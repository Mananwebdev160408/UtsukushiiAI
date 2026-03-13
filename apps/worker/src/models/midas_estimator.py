import torch
import numpy as np
from PIL import Image
import logging
import os
from typing import Dict, List, Tuple
from torchvision.transforms import Compose, Resize, ToTensor, Normalize
from config.config import settings
from utils.device import autocast_context, gpu_memory_guard, clear_cache

logger = logging.getLogger(__name__)


class MiDaSEstimator:
    def __init__(self, model_path: str = None, device: str = None):
        if model_path is None:
            model_path = os.path.join(settings.MODEL_CACHE_DIR, "midas", "dpt_large-v3.pt")

        self.device = device or settings.DEVICE
        self.model_path = model_path

        if not os.path.exists(model_path):
            logger.warning(f"MiDaS model not found at {model_path}. Please run download_models.py.")
            self.model = None
            return

        try:
            self.model = torch.jit.load(model_path, map_location=self.device)
            self.model.eval()
            self.model.to(self.device)
            logger.info(f"MiDaS v3 Estimator initialized on {self.device} using model: {model_path}")

            self.transform = Compose([
                Resize((384, 384)),
                ToTensor(),
                Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
            ])
        except Exception as e:
            logger.error(f"Failed to load MiDaS model: {e}")
            self.model = None

    def estimate_depth(self, image: Image.Image) -> np.ndarray:
        """
        Generates a depth map for the given image.
        Returns a normalized numpy array (H, W) where 0 is far and 255 is near.
        """
        if self.model is None:
            logger.warning("MiDaS model not initialized, returning flat depth map.")
            return np.full((image.height, image.width), 128, dtype=np.uint8)

        try:
            input_tensor = self.transform(image).unsqueeze(0).to(self.device)

            with gpu_memory_guard():
                with autocast_context(self.device):
                    with torch.no_grad():
                        prediction = self.model(input_tensor)

                        prediction = torch.nn.functional.interpolate(
                            prediction.unsqueeze(1),
                            size=(image.height, image.width),
                            mode="bicubic",
                            align_corners=False,
                        ).squeeze()

            depth = prediction.cpu().numpy()
            depth_min, depth_max = depth.min(), depth.max()

            if depth_max > depth_min:
                depth = 255 * (depth - depth_min) / (depth_max - depth_min)
            else:
                depth = np.full_like(depth, 128)

            return depth.astype(np.uint8)

        except Exception as e:
            logger.error(f"Depth estimation failed: {e}")
            return np.full((image.height, image.width), 128, dtype=np.uint8)

    def create_parallax_offset(self, depth_map: np.ndarray, strength: float = 0.05) -> np.ndarray:
        """
        Calculates horizontal/vertical offsets based on depth for parallax effects.
        Higher depth values (foreground) get larger shifts.
        """
        h, w = depth_map.shape
        norm_depth = depth_map.astype(float) / 255.0

        offset_x = norm_depth * strength * w
        offset_y = norm_depth * strength * h

        return np.stack([offset_x, offset_y], axis=-1)

    def create_wiggle_frames(
        self,
        image: Image.Image,
        depth_map: np.ndarray,
        num_frames: int = 24,
        amplitude: float = 8.0,
        frequency: float = 1.0,
    ) -> List[Image.Image]:
        """
        Generates 'wiggle' frames: subtle X/Y oscillation based on depth.

        Foreground elements (high depth values) move more than background,
        creating a compelling parallax animation loop.

        Args:
            image: The source panel image.
            depth_map: Depth map (H, W) with 0=far, 255=near.
            num_frames: Number of frames in the loop.
            amplitude: Max pixel displacement for nearest objects.
            frequency: Oscillation frequency (cycles per loop).

        Returns:
            List of PIL Images forming the wiggle animation.
        """
        img_np = np.array(image.convert("RGB")).astype(np.float32)
        h, w = img_np.shape[:2]

        # Resize depth to match image if needed
        if depth_map.shape != (h, w):
            depth_resized = np.array(
                Image.fromarray(depth_map).resize((w, h), Image.Resampling.BILINEAR)
            )
        else:
            depth_resized = depth_map

        # Normalize depth to [0, 1] — 1 = foreground (moves most)
        norm_depth = depth_resized.astype(np.float32) / 255.0

        # Create base coordinate grids
        y_coords, x_coords = np.meshgrid(np.arange(h), np.arange(w), indexing="ij")

        frames = []
        for i in range(num_frames):
            phase = (i / num_frames) * 2 * np.pi * frequency

            # Oscillation: foreground moves more
            dx = norm_depth * amplitude * np.sin(phase)
            dy = norm_depth * amplitude * 0.5 * np.cos(phase)  # Less vertical motion

            # Compute remapped coordinates
            map_x = np.clip(x_coords + dx, 0, w - 1).astype(np.float32)
            map_y = np.clip(y_coords + dy, 0, h - 1).astype(np.float32)

            # Bilinear interpolation via remap
            try:
                import cv2
                frame = cv2.remap(
                    img_np,
                    map_x,
                    map_y,
                    interpolation=cv2.INTER_LINEAR,
                    borderMode=cv2.BORDER_REFLECT,
                )
            except ImportError:
                # Fallback: nearest-neighbor (no opencv)
                ix = np.clip(np.round(map_x).astype(int), 0, w - 1)
                iy = np.clip(np.round(map_y).astype(int), 0, h - 1)
                frame = img_np[iy, ix]

            frames.append(Image.fromarray(frame.astype(np.uint8)))

        logger.info(f"Generated {num_frames} wiggle frames (amplitude={amplitude})")
        return frames

    def create_3d_parallax(
        self,
        image: Image.Image,
        depth_map: np.ndarray,
        num_frames: int = 30,
        camera_motion: str = "orbit",
        motion_range: float = 15.0,
    ) -> List[Image.Image]:
        """
        Creates advanced 3D parallax by projecting the image onto a depth mesh
        and rendering from slightly different camera angles.

        Args:
            image: Source panel image.
            depth_map: Depth map (H, W).
            num_frames: Number of frames.
            camera_motion: "orbit", "dolly", or "pan".
            motion_range: Pixel range for camera movement.

        Returns:
            List of PIL Images forming the parallax animation.
        """
        img_np = np.array(image.convert("RGB")).astype(np.float32)
        h, w = img_np.shape[:2]

        if depth_map.shape != (h, w):
            depth_resized = np.array(
                Image.fromarray(depth_map).resize((w, h), Image.Resampling.BILINEAR)
            )
        else:
            depth_resized = depth_map

        norm_depth = depth_resized.astype(np.float32) / 255.0
        y_coords, x_coords = np.meshgrid(np.arange(h), np.arange(w), indexing="ij")

        frames = []
        for i in range(num_frames):
            t = (i / num_frames) * 2 * np.pi

            if camera_motion == "orbit":
                cam_dx = motion_range * np.sin(t)
                cam_dy = motion_range * 0.3 * np.cos(t)
            elif camera_motion == "dolly":
                cam_dx = 0
                cam_dy = 0
                # Dolly: scale depth contribution
                depth_scale = 1.0 + 0.1 * np.sin(t)
                norm_depth_frame = norm_depth * depth_scale
            elif camera_motion == "pan":
                cam_dx = motion_range * np.sin(t)
                cam_dy = 0
            else:
                cam_dx = motion_range * np.sin(t)
                cam_dy = motion_range * 0.3 * np.cos(t)

            if camera_motion == "dolly":
                dx = norm_depth_frame * cam_dx
                dy = norm_depth_frame * cam_dy
            else:
                # Objects at different depths shift by different amounts
                dx = norm_depth * cam_dx
                dy = norm_depth * cam_dy

            map_x = np.clip(x_coords + dx, 0, w - 1).astype(np.float32)
            map_y = np.clip(y_coords + dy, 0, h - 1).astype(np.float32)

            try:
                import cv2
                frame = cv2.remap(
                    img_np,
                    map_x,
                    map_y,
                    interpolation=cv2.INTER_LINEAR,
                    borderMode=cv2.BORDER_REFLECT,
                )
            except ImportError:
                ix = np.clip(np.round(map_x).astype(int), 0, w - 1)
                iy = np.clip(np.round(map_y).astype(int), 0, h - 1)
                frame = img_np[iy, ix]

            frames.append(Image.fromarray(frame.astype(np.uint8)))

        logger.info(f"Generated {num_frames} 3D parallax frames (motion={camera_motion})")
        return frames
