"""
UtsukushiiAI ML Worker — FastAPI Application

Endpoints:
  - POST /render/submit      — Submit a new render job
  - GET  /render/status/{id}  — Get job status
  - POST /render/cancel/{id}  — Cancel a running job
  - GET  /render/jobs         — List all jobs
  - POST /suggest/music       — Get music suggestions for a manga page
  - GET  /health              — Health check
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import os
import logging
import signal
import tempfile
import shutil

from utils.logger import setup_logger
from utils.device import get_device_info, clear_cache
from config.config import settings

# Initialize logger
setup_logger()
logger = logging.getLogger(__name__)

app = FastAPI(
    title="UtsukushiiAI ML Worker",
    description="Background worker for manga-to-video processing",
    version="0.2.0",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request/Response Models ────────────────────────────────────────────

class RenderRequest(BaseModel):
    project_id: str
    manga_path: str
    audio_path: str
    settings: Optional[Dict[str, Any]] = {}

class MusicSuggestionRequest(BaseModel):
    manga_path: str

class CancelResponse(BaseModel):
    project_id: str
    status: str
    error: Optional[str] = None


# ── Lifecycle Events ───────────────────────────────────────────────────

@app.on_event("startup")
async def startup_event():
    logger.info("ML Worker starting up...")
    device_info = get_device_info()
    logger.info(f"Running on device: {device_info['device']} ({device_info['name']})")
    logger.info(f"Memory available: {device_info.get('memory_free', 'N/A')} MB")
    logger.info(f"Model cache dir: {settings.MODEL_CACHE_DIR}")
    logger.info(f"Output dir: {settings.OUTPUT_PATH}")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("ML Worker shutting down...")
    clear_cache()
    logger.info("GPU cache cleared. Goodbye.")


# ── Health Check ───────────────────────────────────────────────────────

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "worker_name": settings.WORKER_NAME,
        "device": get_device_info(),
        "version": "0.2.0",
    }


# ── Render Endpoints ───────────────────────────────────────────────────

from jobs.render_job import JobManager


@app.post("/render/submit")
async def submit_render_job(request: RenderRequest):
    """Submits a new manga-to-video render job."""
    # Validate paths exist
    if not os.path.exists(request.manga_path):
        raise HTTPException(status_code=400, detail=f"Manga file not found: {request.manga_path}")
    if not os.path.exists(request.audio_path):
        raise HTTPException(status_code=400, detail=f"Audio file not found: {request.audio_path}")

    job_id = JobManager.create_job(
        project_id=request.project_id,
        manga_path=request.manga_path,
        audio_path=request.audio_path,
        job_settings=request.settings,
    )
    return {"job_id": job_id, "status": "queued"}


@app.get("/render/status/{project_id}")
async def get_render_job_status(project_id: str):
    """Returns the current status of a render job."""
    status = JobManager.get_job_status(project_id)
    if status["status"] == "not_found":
        raise HTTPException(status_code=404, detail="Job not found")
    return status


@app.post("/render/cancel/{project_id}")
async def cancel_render_job(project_id: str):
    """Cancels a running render job."""
    result = JobManager.cancel_job(project_id)
    if result["status"] == "not_found":
        raise HTTPException(status_code=404, detail="Job not found")
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@app.get("/render/jobs")
async def list_render_jobs():
    """Lists all render jobs."""
    return {"jobs": JobManager.list_jobs()}


# ── Music Suggestion ───────────────────────────────────────────────────

@app.post("/suggest/music")
async def suggest_music(request: MusicSuggestionRequest):
    """Analyzes a manga page and suggests music genres/mood/BPM."""
    if not os.path.exists(request.manga_path):
        raise HTTPException(status_code=400, detail=f"Manga file not found: {request.manga_path}")

    try:
        from pipelines.render_pipeline import RenderPipeline
        pipeline = RenderPipeline()
        suggestion = await pipeline.suggest_music(request.manga_path)
        return suggestion.model_dump()
    except Exception as e:
        logger.error(f"Music suggestion failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/suggest/music/upload")
async def suggest_music_from_upload(file: UploadFile = File(...)):
    """Upload a manga image and get music suggestions."""
    # Save uploaded file temporarily
    tmp_dir = tempfile.mkdtemp()
    try:
        file_path = os.path.join(tmp_dir, file.filename or "manga.png")
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)

        from pipelines.render_pipeline import RenderPipeline
        pipeline = RenderPipeline()
        suggestion = await pipeline.suggest_music(file_path)
        return suggestion.model_dump()
    except Exception as e:
        logger.error(f"Music suggestion from upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


# ── GPU Management ─────────────────────────────────────────────────────

@app.post("/gpu/clear")
async def clear_gpu_cache():
    """Manually clears GPU cache."""
    clear_cache()
    return {"status": "cache_cleared", "device": get_device_info()}


# ── Entry Point ────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8001)),
        log_level="info",
    )
