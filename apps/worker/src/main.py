from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
from src.utils.logger import setup_logger
from src.utils.device import get_device_info

# Initialize logger
setup_logger()
logger = logging.getLogger(__name__)

app = FastAPI(
    title="UtsukushiiAI ML Worker",
    description="Background worker for manga-to-video processing",
    version="0.1.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    logger.info("ML Worker starting up...")
    device_info = get_device_info()
    logger.info(f"Running on device: {device_info['device']} ({device_info['name']})")
    logger.info(f"Memory available: {device_info.get('memory_total', 'N/A')} MB")

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "worker_name": os.getenv("WORKER_NAME", "utsukushiiai-worker-01"),
        "device": get_device_info()
    }

from src.jobs.render_job import JobManager
from pydantic import BaseModel
from typing import Dict, Any, Optional

# ... rest of imports

class RenderRequest(BaseModel):
    project_id: str
    manga_path: str
    audio_path: str
    settings: Optional[Dict[str, Any]] = {}

@app.post("/render/submit")
async def submit_render_job(request: RenderRequest):
    """Submits a new manga-to-video render job."""
    job_id = JobManager.create_job(
        project_id=request.project_id,
        manga_path=request.manga_path,
        audio_path=request.audio_path,
        settings=request.settings
    )
    return {"job_id": job_id, "status": "queued"}

@app.get("/render/status/{project_id}")
async def get_render_job_status(project_id: str):
    """Returns the current status of a render job."""
    status = JobManager.get_job_status(project_id)
    if status["status"] == "not_found":
        return {"error": "Job not found"}, 404
    return status

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8001)))
