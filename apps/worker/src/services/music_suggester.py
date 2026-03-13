"""
Music Suggestion Service

Analyzes manga panels to detect visual mood, genre, and art style,
then recommends music genres, BPM ranges, and search keywords.
"""

import numpy as np
from PIL import Image, ImageStat
import logging
from typing import List, Tuple, Dict
from collections import Counter
from schemas.pipeline import (
    MusicSuggestion, VisualFeatures, MangaGenre, AudioMood
)

logger = logging.getLogger(__name__)


# ── Mood/Genre Mapping ────────────────────────────────────────────────

GENRE_MUSIC_MAP: Dict[MangaGenre, Dict] = {
    MangaGenre.ACTION: {
        "genres": ["rock", "metal", "electronic", "hip-hop", "drum-and-bass"],
        "bpm": [130, 180],
        "keywords": ["intense", "battle", "fight", "power", "energy"],
    },
    MangaGenre.ROMANCE: {
        "genres": ["pop", "acoustic", "indie", "R&B", "lo-fi"],
        "bpm": [70, 110],
        "keywords": ["love", "emotional", "soft", "heartfelt", "tender"],
    },
    MangaGenre.HORROR: {
        "genres": ["dark ambient", "industrial", "doom metal", "darkwave"],
        "bpm": [60, 100],
        "keywords": ["dark", "eerie", "suspense", "creepy", "tension"],
    },
    MangaGenre.COMEDY: {
        "genres": ["jazz", "funk", "pop", "ska", "chiptune"],
        "bpm": [100, 140],
        "keywords": ["playful", "upbeat", "quirky", "fun", "bouncy"],
    },
    MangaGenre.DRAMA: {
        "genres": ["classical", "orchestral", "post-rock", "cinematic"],
        "bpm": [60, 120],
        "keywords": ["emotional", "dramatic", "cinematic", "deep", "moving"],
    },
    MangaGenre.FANTASY: {
        "genres": ["orchestral", "celtic", "symphonic metal", "new age"],
        "bpm": [80, 140],
        "keywords": ["epic", "magical", "adventure", "mystical", "grand"],
    },
    MangaGenre.SLICE_OF_LIFE: {
        "genres": ["lo-fi", "acoustic", "indie", "jazz", "bossa nova"],
        "bpm": [70, 110],
        "keywords": ["chill", "relaxed", "warm", "cozy", "peaceful"],
    },
    MangaGenre.MYSTERY: {
        "genres": ["jazz", "noir", "electronic", "trip-hop", "dark jazz"],
        "bpm": [70, 120],
        "keywords": ["mysterious", "suspense", "detective", "moody", "noir"],
    },
    MangaGenre.SCI_FI: {
        "genres": ["synthwave", "electronic", "cyberpunk", "techno", "ambient"],
        "bpm": [90, 150],
        "keywords": ["futuristic", "cyber", "space", "digital", "neon"],
    },
}

MOOD_MUSIC_MAP: Dict[AudioMood, Dict] = {
    AudioMood.ENERGETIC: {"tempo_mod": 1.2, "keywords_add": ["hype", "fast", "adrenaline"]},
    AudioMood.CALM: {"tempo_mod": 0.7, "keywords_add": ["soothing", "ambient", "gentle"]},
    AudioMood.DARK: {"tempo_mod": 0.9, "keywords_add": ["ominous", "shadow", "dread"]},
    AudioMood.EPIC: {"tempo_mod": 1.1, "keywords_add": ["grand", "heroic", "triumphant"]},
    AudioMood.MELANCHOLY: {"tempo_mod": 0.8, "keywords_add": ["sad", "nostalgic", "bittersweet"]},
    AudioMood.ROMANTIC: {"tempo_mod": 0.85, "keywords_add": ["sweet", "intimate", "tender"]},
    AudioMood.COMEDIC: {"tempo_mod": 1.0, "keywords_add": ["silly", "fun", "lighthearted"]},
    AudioMood.TENSE: {"tempo_mod": 1.05, "keywords_add": ["anxiety", "thriller", "suspenseful"]},
    AudioMood.MYSTERIOUS: {"tempo_mod": 0.9, "keywords_add": ["enigmatic", "curious", "shadowy"]},
}


class MusicSuggester:
    """Analyzes manga panel visuals and recommends music."""

    def analyze_panels(self, images: List[Image.Image]) -> MusicSuggestion:
        """
        Analyzes a list of manga panel images and returns music suggestions.

        Args:
            images: List of PIL Images (manga panels or full pages).

        Returns:
            MusicSuggestion with genre, mood, BPM, and keywords.
        """
        if not images:
            logger.warning("No images provided for music suggestion")
            return MusicSuggestion()

        try:
            # Extract visual features from all panels
            features = self._extract_visual_features(images)

            # Detect genre from visual cues
            genre = self._detect_genre(features)

            # Detect mood from visual cues
            mood = self._detect_mood(features)

            # Build music suggestion
            genre_info = GENRE_MUSIC_MAP.get(genre, GENRE_MUSIC_MAP[MangaGenre.UNKNOWN])
            mood_info = MOOD_MUSIC_MAP.get(mood, {"tempo_mod": 1.0, "keywords_add": []})

            # Adjust BPM range based on mood
            base_bpm = genre_info.get("bpm", [90, 130])
            adjusted_bpm = [
                int(base_bpm[0] * mood_info["tempo_mod"]),
                int(base_bpm[1] * mood_info["tempo_mod"]),
            ]

            # Combine keywords
            keywords = genre_info.get("keywords", []) + mood_info.get("keywords_add", [])

            # Calculate confidence based on feature clarity
            confidence = self._calculate_confidence(features)

            suggestion = MusicSuggestion(
                detected_genre=genre,
                detected_mood=mood,
                suggested_genres=genre_info.get("genres", []),
                suggested_bpm_range=adjusted_bpm,
                search_keywords=keywords,
                confidence=confidence,
                visual_features=features,
                reasoning=self._build_reasoning(genre, mood, features),
            )

            logger.info(
                f"Music suggestion: genre={genre.value}, mood={mood.value}, "
                f"bpm={adjusted_bpm}, confidence={confidence:.2f}"
            )
            return suggestion

        except Exception as e:
            logger.error(f"Music suggestion analysis failed: {e}")
            return MusicSuggestion()

    def _extract_visual_features(self, images: List[Image.Image]) -> VisualFeatures:
        """Extracts aggregate visual features from a list of images."""
        all_brightness = []
        all_contrast = []
        all_edge_density = []
        all_colors = []

        for img in images:
            img_rgb = img.convert("RGB")
            img_arr = np.array(img_rgb)

            # Brightness (mean luminance)
            gray = np.mean(img_arr, axis=2)
            brightness = float(gray.mean() / 255.0)
            all_brightness.append(brightness)

            # Contrast (std of luminance)
            contrast = float(gray.std() / 128.0)  # normalize to ~[0,1]
            all_contrast.append(min(1.0, contrast))

            # Edge density (Sobel approximation)
            edge_density = self._compute_edge_density(gray)
            all_edge_density.append(edge_density)

            # Dominant colors
            colors = self._get_dominant_colors(img_rgb, n=3)
            all_colors.extend(colors)

        # Aggregate: top 5 most common colors
        color_tuples = [tuple(c) for c in all_colors]
        color_counts = Counter(color_tuples)
        top_colors = [list(c) for c, _ in color_counts.most_common(5)]

        return VisualFeatures(
            dominant_colors=top_colors,
            brightness=float(np.mean(all_brightness)),
            contrast=float(np.mean(all_contrast)),
            edge_density=float(np.mean(all_edge_density)),
            text_density=0.0,  # TODO: OCR-based text density
            panel_count=len(images),
            scene_complexity=float(np.mean(all_edge_density) * 0.6 + np.mean(all_contrast) * 0.4),
        )

    def _compute_edge_density(self, gray: np.ndarray) -> float:
        """Computes normalized edge density using Sobel-like gradient."""
        # Simple gradient magnitude
        gy = np.abs(np.diff(gray, axis=0))
        gx = np.abs(np.diff(gray, axis=1))

        edge_strength = (gy[:, :-1] + gx[:-1, :]) / 2.0
        density = float(edge_strength.mean() / 128.0)
        return min(1.0, density)

    def _get_dominant_colors(self, image: Image.Image, n: int = 5) -> List[List[int]]:
        """Extracts dominant colors by quantizing the image."""
        small = image.resize((64, 64))
        quantized = small.quantize(colors=n, method=Image.Quantize.MEDIANCUT)
        palette = quantized.getpalette()

        colors = []
        for i in range(n):
            idx = i * 3
            if idx + 2 < len(palette):
                colors.append([palette[idx], palette[idx + 1], palette[idx + 2]])

        return colors

    def _detect_genre(self, features: VisualFeatures) -> MangaGenre:
        """Heuristic genre detection from visual features."""
        scores = {}

        b = features.brightness
        c = features.contrast
        e = features.edge_density
        sc = features.scene_complexity
        colors = features.dominant_colors

        # Check color characteristics
        is_dark = b < 0.35
        is_bright = b > 0.6
        is_high_contrast = c > 0.6
        is_low_contrast = c < 0.3
        is_detailed = e > 0.4
        is_simple = e < 0.2

        # Color warmth
        avg_r = np.mean([c[0] for c in colors]) if colors else 128
        avg_g = np.mean([c[1] for c in colors]) if colors else 128
        avg_b = np.mean([c[2] for c in colors]) if colors else 128
        is_warm = avg_r > avg_b + 20
        is_cool = avg_b > avg_r + 20

        # Score each genre
        scores[MangaGenre.ACTION] = (
            (0.4 if is_high_contrast else 0)
            + (0.3 if is_detailed else 0)
            + (0.2 if is_dark else 0)
            + (0.1 if sc > 0.5 else 0)
        )

        scores[MangaGenre.ROMANCE] = (
            (0.4 if is_bright else 0)
            + (0.3 if is_warm else 0)
            + (0.2 if is_simple else 0)
            + (0.1 if is_low_contrast else 0)
        )

        scores[MangaGenre.HORROR] = (
            (0.5 if is_dark else 0)
            + (0.3 if is_high_contrast else 0)
            + (0.2 if is_cool else 0)
        )

        scores[MangaGenre.COMEDY] = (
            (0.4 if is_bright else 0)
            + (0.3 if is_simple else 0)
            + (0.2 if not is_dark else 0)
            + (0.1 if is_warm else 0)
        )

        scores[MangaGenre.DRAMA] = (
            (0.3 if 0.3 < b < 0.6 else 0)
            + (0.3 if is_high_contrast else 0)
            + (0.2 if is_detailed else 0)
            + (0.2 if not is_bright else 0)
        )

        scores[MangaGenre.FANTASY] = (
            (0.3 if is_detailed else 0)
            + (0.3 if sc > 0.5 else 0)
            + (0.2 if is_bright else 0)
            + (0.2 if is_cool else 0)
        )

        scores[MangaGenre.SLICE_OF_LIFE] = (
            (0.4 if is_simple else 0)
            + (0.3 if is_bright else 0)
            + (0.2 if is_low_contrast else 0)
            + (0.1 if is_warm else 0)
        )

        scores[MangaGenre.MYSTERY] = (
            (0.4 if is_dark else 0)
            + (0.3 if 0.3 < c < 0.6 else 0)
            + (0.2 if is_cool else 0)
            + (0.1 if is_detailed else 0)
        )

        scores[MangaGenre.SCI_FI] = (
            (0.3 if is_cool else 0)
            + (0.3 if is_high_contrast else 0)
            + (0.2 if is_detailed else 0)
            + (0.2 if not is_warm else 0)
        )

        # Pick highest scoring genre
        best = max(scores, key=scores.get)
        if scores[best] < 0.3:
            return MangaGenre.UNKNOWN
        return best

    def _detect_mood(self, features: VisualFeatures) -> AudioMood:
        """Heuristic mood detection from visual features."""
        b = features.brightness
        c = features.contrast
        e = features.edge_density

        if b < 0.25 and c > 0.5:
            return AudioMood.DARK
        if b < 0.3 and e < 0.3:
            return AudioMood.MYSTERIOUS
        if c > 0.7 and e > 0.5:
            return AudioMood.ENERGETIC
        if b > 0.6 and e < 0.25:
            return AudioMood.CALM
        if b > 0.55 and c < 0.35:
            return AudioMood.ROMANTIC
        if e > 0.6:
            return AudioMood.EPIC
        if b < 0.4 and c > 0.4:
            return AudioMood.TENSE
        if b > 0.5 and e < 0.35:
            return AudioMood.MELANCHOLY

        return AudioMood.NEUTRAL

    def _calculate_confidence(self, features: VisualFeatures) -> float:
        """Calculates a confidence score for the suggestion."""
        # More panels = more data = higher confidence
        panel_factor = min(1.0, features.panel_count / 5.0) * 0.3

        # Stronger features = higher confidence
        feature_clarity = (
            abs(features.brightness - 0.5) * 2  # How far from neutral brightness
            + features.contrast  # Higher contrast = clearer signal
            + features.edge_density  # More edges = more info
        ) / 3.0 * 0.7

        return min(1.0, panel_factor + feature_clarity)

    def _build_reasoning(self, genre: MangaGenre, mood: AudioMood, features: VisualFeatures) -> str:
        """Builds a human-readable reasoning string."""
        parts = []

        if features.brightness < 0.35:
            parts.append("dark tones suggest tension or drama")
        elif features.brightness > 0.6:
            parts.append("bright palette suggests lighthearted or romantic content")

        if features.contrast > 0.6:
            parts.append("high contrast indicates dynamic/action scenes")
        elif features.contrast < 0.3:
            parts.append("soft contrast suggests calm or slice-of-life")

        if features.edge_density > 0.4:
            parts.append("detailed linework indicates complex or action-heavy panels")
        elif features.edge_density < 0.2:
            parts.append("minimal detail suggests simple or comedic art style")

        parts.append(f"detected genre: {genre.value}, mood: {mood.value}")

        return "; ".join(parts)
