"""
Model Download Script — Downloads required ML models from HuggingFace Hub.

Usage:
    python scripts/download_models.py
    python scripts/download_models.py --models sam2 midas
    python scripts/download_models.py --all
"""

from huggingface_hub import hf_hub_download, snapshot_download
import os
import sys
import logging
import argparse

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")


# ── Model Definitions ──────────────────────────────────────────────────

MODELS = {
    "yolo": {
        "name": "YOLOv12 Manga Panel Detector",
        "repo": "ultralytics/yolov8n",
        "files": ["yolov8n.pt"],
        "local_dir": os.path.join(MODELS_DIR, "yolov12"),
        "notes": (
            "Using YOLOv8n as a base. For manga-specific detection, "
            "fine-tune on Manga109 dataset or use a community manga YOLO model."
        ),
    },
    "sam2": {
        "name": "SAM 2.1 Hiera Base Plus",
        "repo": "facebook/sam2.1-hiera-base-plus",
        "files": ["sam2.1_hiera_base_plus.pt"],
        "local_dir": os.path.join(MODELS_DIR, "sam2"),
    },
    "midas": {
        "name": "MiDaS v3 DPT-Large (Depth Estimation)",
        "repo": "intel/dpt-large",
        "files": [],  # Download entire repo for config files
        "local_dir": os.path.join(MODELS_DIR, "midas"),
        "snapshot": True,
    },
    "svd": {
        "name": "Stable Video Diffusion (Image-to-Video)",
        "repo": "stabilityai/stable-video-diffusion-img2vid",
        "files": [],  # Download entire repo for full pipeline
        "local_dir": os.path.join(MODELS_DIR, "svd"),
        "snapshot": True,
        "notes": (
            "SVD is ~10GB+. Ensure you have sufficient disk space and VRAM (≥8GB). "
            "For CPU-only setups, the procedural animation fallback will be used."
        ),
    },
}


# ── Download Functions ──────────────────────────────────────────────────

def download_model(model_key: str):
    """Downloads a specific model by its key."""
    if model_key not in MODELS:
        logger.error(f"Unknown model: {model_key}. Available: {list(MODELS.keys())}")
        return False

    model = MODELS[model_key]
    local_dir = model["local_dir"]
    os.makedirs(local_dir, exist_ok=True)

    logger.info(f"{'='*60}")
    logger.info(f"Downloading: {model['name']}")
    logger.info(f"Repository: {model['repo']}")
    logger.info(f"Target: {local_dir}")

    if "notes" in model:
        logger.info(f"Note: {model['notes']}")

    try:
        if model.get("snapshot"):
            # Download entire repository
            logger.info("Downloading full repository (this may take a while)...")
            snapshot_download(
                repo_id=model["repo"],
                local_dir=local_dir,
                ignore_patterns=["*.md", "*.txt", ".gitattributes"],
            )
        else:
            # Download specific files
            for filename in model["files"]:
                logger.info(f"Downloading: {filename}...")
                hf_hub_download(
                    repo_id=model["repo"],
                    filename=filename,
                    local_dir=local_dir,
                )

        logger.info(f"✓ {model['name']} downloaded successfully")
        return True

    except Exception as e:
        logger.error(f"✗ Failed to download {model['name']}: {e}")
        return False


def download_all():
    """Downloads all models."""
    results = {}
    for key in MODELS:
        results[key] = download_model(key)

    # Summary
    logger.info(f"\n{'='*60}")
    logger.info("Download Summary:")
    for key, success in results.items():
        status = "✓" if success else "✗"
        logger.info(f"  {status} {MODELS[key]['name']}")

    failed = [k for k, v in results.items() if not v]
    if failed:
        logger.warning(f"\n{len(failed)} model(s) failed to download. You can retry with:")
        logger.warning(f"  python scripts/download_models.py --models {' '.join(failed)}")

    return all(results.values())


def list_models():
    """Lists available models and their download status."""
    logger.info("Available models:")
    for key, model in MODELS.items():
        local_dir = model["local_dir"]
        exists = os.path.exists(local_dir) and os.listdir(local_dir)
        status = "✓ Downloaded" if exists else "✗ Not downloaded"
        size = ""
        if exists:
            total_size = sum(
                os.path.getsize(os.path.join(dp, f))
                for dp, dn, files in os.walk(local_dir)
                for f in files
            )
            size = f" ({total_size / 1024 / 1024:.0f} MB)"

        logger.info(f"  [{key}] {model['name']} - {status}{size}")


# ── CLI ─────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Download ML models for UtsukushiiAI")
    parser.add_argument("--all", action="store_true", help="Download all models")
    parser.add_argument("--models", nargs="+", choices=list(MODELS.keys()), help="Download specific models")
    parser.add_argument("--list", action="store_true", help="List available models")

    args = parser.parse_args()

    if args.list:
        list_models()
        return

    if args.all:
        success = download_all()
        sys.exit(0 if success else 1)

    if args.models:
        results = [download_model(m) for m in args.models]
        sys.exit(0 if all(results) else 1)

    # Default: show status and prompt
    list_models()
    logger.info("\nUsage:")
    logger.info("  python scripts/download_models.py --all         # Download everything")
    logger.info("  python scripts/download_models.py --models sam2  # Download specific model")


if __name__ == "__main__":
    main()
