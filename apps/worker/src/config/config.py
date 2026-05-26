"""Worker Configuration — Centralized settings from environment variables."""

from pydantic_settings import BaseSettings
from pydantic import model_validator
import os


class Settings(BaseSettings):
    # Service
    PORT: int = 8001
    WORKER_NAME: str = "utsukushiiai-ml-worker"
    WORKER_CONCURRENCY: int = 2

    # Device — can be overridden via DEVICE env var; auto-detected if set to "auto"
    DEVICE: str = "auto"

    # Paths
    MODEL_CACHE_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "models")
    STORAGE_PATH: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "storage")
    DOWNLOAD_PATH: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "downloads")
    OUTPUT_PATH: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "output")

    # Database & Cache
    MONGODB_URI: str = "mongodb://localhost:27017/utsukushiiai"
    REDIS_URL: str = "redis://localhost:6379/0"

    # External APIs
    API_WEBHOOK_URL: str = "http://localhost:4000/v1/webhooks/render"

    # Logging
    LOG_LEVEL: str = "INFO"

    @model_validator(mode="after")
    def resolve_device(self) -> "Settings":
        """Auto-detect the best device if DEVICE is 'auto' or 'cuda' but CUDA is unavailable."""
        if self.DEVICE in ("auto", "cuda"):
            try:
                import torch
                if torch.cuda.is_available():
                    self.DEVICE = "cuda"
                elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
                    self.DEVICE = "mps"
                else:
                    self.DEVICE = "cpu"
            except ImportError:
                # torch not available yet — keep explicit value or fall back to cpu
                if self.DEVICE == "auto":
                    self.DEVICE = "cpu"
        return self

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

    def ensure_directories(self):
        """Creates all required directories."""
        for d in [self.MODEL_CACHE_DIR, self.STORAGE_PATH, self.DOWNLOAD_PATH, self.OUTPUT_PATH]:
            os.makedirs(d, exist_ok=True)


settings = Settings()
settings.ensure_directories()
