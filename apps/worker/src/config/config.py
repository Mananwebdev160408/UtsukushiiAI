import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Service Config
    PROJECT_NAME: str = "UtsukushiiAI ML Worker"
    PORT: int = 8001
    WORKER_NAME: str = "utsukushiiai-worker-01"
    LOG_LEVEL: str = "INFO"
    
    # ML Config
    DEVICE: str = "cuda"
    MODEL_CACHE_DIR: str = os.path.join(os.getcwd(), "models")
    
    # Storage Config
    STORAGE_PATH: str = os.path.join(os.getcwd(), "storage")
    DOWNLOAD_PATH: str = os.path.join(os.getcwd(), "downloads")
    OUTPUT_PATH: str = os.path.join(os.getcwd(), "output")
    
    # External Services
    MONGODB_URI: str = "mongodb://localhost:27017/utsukushiiai"
    REDIS_URL: str = "redis://localhost:6379/0"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

# Ensure directories exist
for path in [settings.MODEL_CACHE_DIR, settings.STORAGE_PATH, settings.DOWNLOAD_PATH, settings.OUTPUT_PATH]:
    os.makedirs(path, exist_ok=True)
