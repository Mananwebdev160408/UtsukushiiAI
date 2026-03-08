import torch
import numpy as np
from PIL import Image
import logging
import os
from typing import List, Optional
from src.config.config import settings
from src.schemas.pipeline import BBox
from src.utils.device import autocast_context, gpu_memory_guard

# SAM 2 import with graceful fallback
try:
    from sam2.build_sam import build_sam2
    from sam2.sam2_image_predictor import SAM2ImagePredictor
    HAS_SAM2 = True
except ImportError:
    HAS_SAM2 = False

logger = logging.getLogger(__name__)


class SAMSegmenter:
    def __init__(self, model_path: str = None, device: str = None):
        if model_path is None:
            model_path = os.path.join(settings.MODEL_CACHE_DIR, "sam2", "sam2.1_hiera_base_plus.pt")

        self.device = device or settings.DEVICE
        self.model_path = model_path
        self.predictor = None

        if not HAS_SAM2:
            logger.warning("SAM 2 package not found. Using fallback segmentation.")
            return

        if not os.path.exists(model_path):
            logger.warning(f"SAM 2 model not found at {model_path}. Please run download_models.py.")
            return

        try:
            model_cfg = "sam2.1_hiera_b+.yaml"
            sam2_model = build_sam2(model_cfg, model_path, device=self.device)
            self.predictor = SAM2ImagePredictor(sam2_model)
            logger.info(f"SAM 2 Segmenter initialized on {self.device}")
        except Exception as e:
            logger.error(f"Failed to initialize SAM 2: {e}")

    def segment_panel(self, panel_image: Image.Image, bbox: Optional[BBox] = None) -> np.ndarray:
        """
        Generates an alpha mask for the main character/foreground in a panel.
        Returns a numpy array (H, W) where 1 is foreground, 0 is background.
        """
        try:
            img_np = np.array(panel_image.convert("RGB"))
            h, w = img_np.shape[:2]

            if self.predictor is not None:
                with gpu_memory_guard():
                    self.predictor.set_image(img_np)

                    if bbox:
                        input_box = np.array([
                            bbox.x * w,
                            bbox.y * h,
                            (bbox.x + bbox.width) * w,
                            (bbox.y + bbox.height) * h
                        ])

                        masks, scores, logits = self.predictor.predict(
                            box=input_box[None, :],
                            multimask_output=False
                        )
                        raw_mask = (masks[0] > 0).astype(np.uint8)
                    else:
                        input_point = np.array([[w // 2, h // 2]])
                        input_label = np.array([1])

                        masks, scores, logits = self.predictor.predict(
                            point_coords=input_point,
                            point_labels=input_label,
                            multimask_output=False
                        )
                        raw_mask = (masks[0] > 0).astype(np.uint8)

                    # Apply refinement
                    return self.refine_mask(raw_mask)
            else:
                # Fallback: central region mask
                logger.debug("Using fallback segmentation (no SAM 2)")
                mask = np.zeros((h, w), dtype=np.uint8)
                mask[int(h * 0.15):int(h * 0.85), int(w * 0.15):int(w * 0.85)] = 1
                return mask

        except Exception as e:
            logger.error(f"Segmentation failed: {e}")
            h, w = np.array(panel_image).shape[:2]
            return np.zeros((h, w), dtype=np.uint8)

    def refine_mask(self, mask: np.ndarray, kernel_size: int = 5, iterations: int = 2) -> np.ndarray:
        """
        Refines a binary mask using morphological operations and smoothing.

        Steps:
            1. Morphological close (fill small gaps)
            2. Morphological open (remove noise)
            3. Fill interior holes
            4. Gaussian blur for smooth edges
        """
        try:
            import cv2

            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (kernel_size, kernel_size))

            # Close: fill small gaps in the mask
            refined = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=iterations)

            # Open: remove small noise blobs
            refined = cv2.morphologyEx(refined, cv2.MORPH_OPEN, kernel, iterations=1)

            # Fill interior holes
            refined = self.fill_holes(refined)

            # Smooth edges with Gaussian blur + threshold
            blurred = cv2.GaussianBlur(refined.astype(np.float32), (7, 7), sigmaX=2.0)
            refined = (blurred > 0.5).astype(np.uint8)

            logger.debug(f"Mask refined: {mask.sum()} -> {refined.sum()} foreground pixels")
            return refined

        except ImportError:
            logger.warning("cv2 not available for mask refinement, returning raw mask")
            return mask

    def fill_holes(self, mask: np.ndarray) -> np.ndarray:
        """
        Fills interior holes in a binary mask using flood fill.
        """
        try:
            import cv2

            h, w = mask.shape
            # Create a padded mask for flood fill
            padded = np.zeros((h + 2, w + 2), dtype=np.uint8)
            padded[1:-1, 1:-1] = mask.copy()

            # Flood fill from the border — fills the exterior
            cv2.floodFill(padded, None, (0, 0), 1)

            # Invert: exterior becomes 0, holes become 1
            filled_holes = 1 - padded[1:-1, 1:-1]

            # Combine: original mask + filled holes
            return np.maximum(mask, filled_holes)

        except ImportError:
            # Simple fallback: no hole filling
            return mask

    def extract_character(self, panel_image: Image.Image, mask: np.ndarray) -> Image.Image:
        """Applies mask to extract character with transparency (RGBA)."""
        panel_np = np.array(panel_image.convert("RGBA"))

        # Ensure mask matches image size
        h, w = panel_np.shape[:2]
        if mask.shape[:2] != (h, w):
            mask_img = Image.fromarray(mask * 255).resize((w, h), Image.Resampling.NEAREST)
            mask = np.array(mask_img) // 255

        # Smooth alpha edges for cleaner compositing
        try:
            import cv2
            alpha = cv2.GaussianBlur(mask.astype(np.float32) * 255, (5, 5), sigmaX=1.5)
            panel_np[:, :, 3] = alpha.astype(np.uint8)
        except ImportError:
            panel_np[:, :, 3] = mask * 255

        return Image.fromarray(panel_np)

    def generate_automatic_masks(self, image: Image.Image, min_area: float = 0.01) -> List[np.ndarray]:
        """
        Generates all masks for an image automatically (useful for multi-character panels).

        Args:
            image: Input image.
            min_area: Minimum mask area as fraction of image (filters tiny detections).

        Returns:
            List of binary masks sorted by area (largest first).
        """
        if self.predictor is None:
            logger.warning("SAM 2 not available for automatic mask generation")
            return []

        try:
            img_np = np.array(image.convert("RGB"))
            h, w = img_np.shape[:2]
            total_area = h * w

            self.predictor.set_image(img_np)

            # Grid of prompt points
            grid_size = 8
            points = []
            labels = []
            for gy in range(grid_size):
                for gx in range(grid_size):
                    px = int((gx + 0.5) * w / grid_size)
                    py = int((gy + 0.5) * h / grid_size)
                    points.append([px, py])
                    labels.append(1)

            input_points = np.array(points)
            input_labels = np.array(labels)

            masks, scores, logits = self.predictor.predict(
                point_coords=input_points,
                point_labels=input_labels,
                multimask_output=True
            )

            # Filter by size and deduplicate
            valid_masks = []
            for i, m in enumerate(masks):
                binary = (m > 0).astype(np.uint8)
                area = binary.sum() / total_area
                if area >= min_area:
                    refined = self.refine_mask(binary)
                    valid_masks.append((refined, float(scores[i]), area))

            # Sort by area descending
            valid_masks.sort(key=lambda x: x[2], reverse=True)
            return [m[0] for m in valid_masks]

        except Exception as e:
            logger.error(f"Automatic mask generation failed: {e}")
            return []
