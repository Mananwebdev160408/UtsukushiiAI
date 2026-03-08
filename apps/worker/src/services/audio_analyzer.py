"""
Audio Analysis Service — Librosa-based beat/rhythm analysis with mood detection.
"""

import librosa
import numpy as np
import logging
from typing import List, Dict, Any, Optional
import os
from src.schemas.pipeline import AudioMood, AudioAnalysisResult

logger = logging.getLogger(__name__)


class AudioAnalyzer:
    def __init__(self, sample_rate: int = 22050):
        self.sample_rate = sample_rate

    def analyze(self, audio_path: str) -> AudioAnalysisResult:
        """Performs full audio analysis for beat tracking and synchronization."""
        if not os.path.exists(audio_path):
            logger.error(f"Audio file not found: {audio_path}")
            raise FileNotFoundError(f"Audio file not found: {audio_path}")

        try:
            logger.info(f"Analyzing audio: {audio_path}")
            y, sr = librosa.load(audio_path, sr=self.sample_rate)
            duration = librosa.get_duration(y=y, sr=sr)

            # 1. BPM and Beat Tracking
            tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
            beat_times = librosa.frames_to_time(beat_frames, sr=sr)

            # 2. Onset Detection (transients/hits)
            onset_env = librosa.onset.onset_strength(y=y, sr=sr)
            onset_frames = librosa.onset.onset_detect(onset_env=onset_env, sr=sr)
            onset_times = librosa.frames_to_time(onset_frames, sr=sr)

            # 3. Harmonic/Percussive separation
            y_harmonic, y_percussive = librosa.effects.hpss(y)

            # 4. Segment detection
            C = librosa.feature.chroma_cqt(y=y, sr=sr)
            try:
                boundaries = librosa.segment.agglomerate(C, k=min(5, max(2, int(duration / 15))))
                boundary_times = librosa.frames_to_time(boundaries, sr=sr)
            except Exception:
                # Fallback for very short audio
                boundary_times = np.array([0.0, duration])

            segments = [
                {"start": float(boundary_times[i]), "end": float(boundary_times[i + 1])}
                for i in range(len(boundary_times) - 1)
            ]

            # 5. Mood Detection
            mood = self._detect_mood(y, sr, y_harmonic, y_percussive, float(tempo[0] if isinstance(tempo, np.ndarray) else tempo))

            # 6. Key Detection (optional)
            key = self._detect_key(C)

            # 7. Energy Profile
            energy_profile = self._get_energy_profile(y, sr)

            result = AudioAnalysisResult(
                duration=float(duration),
                bpm=float(tempo[0] if isinstance(tempo, np.ndarray) else tempo),
                beat_times=beat_times.tolist(),
                onset_times=onset_times.tolist(),
                segments=segments,
                energy_profile=energy_profile,
                mood=mood,
                key=key,
            )

            logger.info(
                f"Audio analysis complete. BPM: {result.bpm:.1f}, "
                f"Mood: {result.mood.value}, Key: {result.key or 'N/A'}, "
                f"Duration: {result.duration:.1f}s"
            )
            return result

        except Exception as e:
            logger.error(f"Audio analysis failed: {e}")
            raise

    def _get_energy_profile(self, y: np.ndarray, sr: int, bins_per_sec: int = 10) -> List[float]:
        """Generates a normalized energy profile."""
        hop_length = sr // bins_per_sec
        rmse = librosa.feature.rms(y=y, hop_length=hop_length)[0]
        if len(rmse) > 0:
            rmin, rmax = rmse.min(), rmse.max()
            if rmax > rmin:
                rmse = (rmse - rmin) / (rmax - rmin)
            else:
                rmse = np.zeros_like(rmse)
        return rmse.tolist()

    def _detect_mood(
        self,
        y: np.ndarray,
        sr: int,
        y_harmonic: np.ndarray,
        y_percussive: np.ndarray,
        bpm: float,
    ) -> AudioMood:
        """
        Detects audio mood from spectral features, rhythm, and energy.
        """
        try:
            # Spectral centroid — brightness indicator
            centroid = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
            avg_centroid = float(centroid.mean())

            # Spectral rolloff
            rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr, roll_percent=0.85)[0]
            avg_rolloff = float(rolloff.mean())

            # RMS energy
            rms = librosa.feature.rms(y=y)[0]
            avg_energy = float(rms.mean())
            energy_variance = float(rms.var())

            # Zero crossing rate — noise/roughness indicator
            zcr = librosa.feature.zero_crossing_rate(y=y)[0]
            avg_zcr = float(zcr.mean())

            # Harmonic to percussive ratio
            h_energy = np.sqrt(np.mean(y_harmonic ** 2))
            p_energy = np.sqrt(np.mean(y_percussive ** 2))
            hp_ratio = h_energy / (p_energy + 1e-8)

            # Normalized features for scoring
            is_fast = bpm > 130
            is_slow = bpm < 85
            is_bright = avg_centroid > sr * 0.15
            is_dark = avg_centroid < sr * 0.06
            is_loud = avg_energy > 0.1
            is_quiet = avg_energy < 0.03
            is_dynamic = energy_variance > 0.005
            is_harmonic = hp_ratio > 2.0
            is_percussive = hp_ratio < 0.5

            # Score each mood
            scores = {
                AudioMood.ENERGETIC: (
                    (0.4 if is_fast else 0)
                    + (0.3 if is_loud else 0)
                    + (0.2 if is_percussive else 0)
                    + (0.1 if is_dynamic else 0)
                ),
                AudioMood.CALM: (
                    (0.4 if is_slow else 0)
                    + (0.3 if is_quiet else 0)
                    + (0.2 if is_harmonic else 0)
                    + (0.1 if not is_dynamic else 0)
                ),
                AudioMood.DARK: (
                    (0.4 if is_dark else 0)
                    + (0.3 if is_slow else 0)
                    + (0.2 if avg_zcr < 0.04 else 0)
                    + (0.1 if is_quiet else 0)
                ),
                AudioMood.EPIC: (
                    (0.3 if is_loud else 0)
                    + (0.3 if is_dynamic else 0)
                    + (0.2 if is_bright else 0)
                    + (0.2 if 100 < bpm < 150 else 0)
                ),
                AudioMood.MELANCHOLY: (
                    (0.4 if is_slow else 0)
                    + (0.3 if is_harmonic else 0)
                    + (0.2 if not is_loud else 0)
                    + (0.1 if is_dark else 0)
                ),
                AudioMood.ROMANTIC: (
                    (0.3 if is_harmonic else 0)
                    + (0.3 if is_quiet else 0)
                    + (0.2 if 70 < bpm < 110 else 0)
                    + (0.2 if not is_dark else 0)
                ),
                AudioMood.TENSE: (
                    (0.3 if is_dynamic else 0)
                    + (0.3 if avg_zcr > 0.06 else 0)
                    + (0.2 if is_dark else 0)
                    + (0.2 if is_percussive else 0)
                ),
                AudioMood.MYSTERIOUS: (
                    (0.3 if is_dark else 0)
                    + (0.3 if is_quiet else 0)
                    + (0.2 if is_harmonic else 0)
                    + (0.2 if 70 < bpm < 100 else 0)
                ),
            }

            best_mood = max(scores, key=scores.get)
            if scores[best_mood] < 0.3:
                return AudioMood.NEUTRAL
            return best_mood

        except Exception as e:
            logger.warning(f"Mood detection failed, defaulting to NEUTRAL: {e}")
            return AudioMood.NEUTRAL

    def _detect_key(self, chroma: np.ndarray) -> Optional[str]:
        """Estimates the musical key from chroma features."""
        try:
            # Average chroma across time
            avg_chroma = np.mean(chroma, axis=1)

            # Note names
            notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

            # Major key profiles (Krumhansl-Kessler)
            major_profile = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
            minor_profile = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])

            best_corr = -1
            best_key = "C"
            best_mode = "major"

            for shift in range(12):
                rotated = np.roll(avg_chroma, -shift)

                # Major
                corr_maj = float(np.corrcoef(rotated, major_profile)[0, 1])
                if corr_maj > best_corr:
                    best_corr = corr_maj
                    best_key = notes[shift]
                    best_mode = "major"

                # Minor
                corr_min = float(np.corrcoef(rotated, minor_profile)[0, 1])
                if corr_min > best_corr:
                    best_corr = corr_min
                    best_key = notes[shift]
                    best_mode = "minor"

            return f"{best_key} {best_mode}"

        except Exception:
            return None
