import torch
import logging
from contextlib import contextmanager
from typing import Optional

logger = logging.getLogger(__name__)


def get_device() -> str:
    """Returns the best available device (cuda, mps, or cpu)."""
    if torch.cuda.is_available():
        return "cuda"
    if hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
        return "mps"
    return "cpu"


def get_device_info() -> dict:
    """Returns detailed information about the current device."""
    device_type = get_device()
    info = {
        "device": device_type,
        "name": "CPU",
        "memory_total": 0,
        "memory_allocated": 0,
        "memory_free": 0,
    }

    if device_type == "cuda":
        prop = torch.cuda.get_device_properties(0)
        allocated = torch.cuda.memory_allocated(0)
        # torch exposes total_memory on current versions; keep fallback for compatibility.
        total = getattr(prop, "total_memory", getattr(prop, "total_mem", 0))
        info.update({
            "name": prop.name,
            "memory_total": total // (1024 * 1024),
            "memory_allocated": allocated // (1024 * 1024),
            "memory_free": (total - allocated) // (1024 * 1024),
            "cuda_version": torch.version.cuda or "N/A",
            "compute_capability": f"{prop.major}.{prop.minor}",
        })

    return info


def clear_cache():
    """Clears GPU cache if applicable."""
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
        torch.cuda.ipc_collect()
        logger.debug("CUDA cache cleared")


def get_memory_usage() -> Optional[dict]:
    """Returns current GPU memory usage stats."""
    if not torch.cuda.is_available():
        return None
    return {
        "allocated_mb": torch.cuda.memory_allocated(0) // (1024 * 1024),
        "reserved_mb": torch.cuda.memory_reserved(0) // (1024 * 1024),
        "max_allocated_mb": torch.cuda.max_memory_allocated(0) // (1024 * 1024),
    }


@contextmanager
def autocast_context(device: str = "cuda", dtype=torch.float16):
    """Context manager for mixed-precision inference.

    Usage:
        with autocast_context("cuda"):
            output = model(input_tensor)
    """
    if device == "cuda" and torch.cuda.is_available():
        with torch.autocast(device_type="cuda", dtype=dtype):
            yield
    elif device == "mps":
        # MPS doesn't support autocast well yet, just run normally
        yield
    else:
        yield


@contextmanager
def gpu_memory_guard(threshold_mb: int = 500):
    """Context manager that monitors GPU memory and clears cache after use.

    Args:
        threshold_mb: If free memory drops below this, force cache clear.
    """
    try:
        yield
    finally:
        if torch.cuda.is_available():
            mem = get_memory_usage()
            if mem:
                logger.debug(f"GPU memory after op: allocated={mem['allocated_mb']}MB, reserved={mem['reserved_mb']}MB")
            clear_cache()


def enable_memory_efficient_attention(model):
    """Enables memory-efficient attention if xformers is available."""
    try:
        import xformers  # noqa: F401
        if hasattr(model, "enable_xformers_memory_efficient_attention"):
            model.enable_xformers_memory_efficient_attention()
            logger.info("xformers memory-efficient attention enabled")
            return True
    except ImportError:
        logger.debug("xformers not available, using default attention")
    return False


def optimize_model_for_inference(model: torch.nn.Module, device: str = "cuda") -> torch.nn.Module:
    """Applies inference-time optimizations to a PyTorch model."""
    model.eval()

    # Disable gradient computation globally for this model
    for param in model.parameters():
        param.requires_grad = False

    # Move to device with optional half precision
    if device == "cuda" and torch.cuda.is_available():
        model = model.to(device)
        # Try to compile for faster inference (PyTorch 2.0+)
        try:
            model = torch.compile(model, mode="reduce-overhead")
            logger.info("Model compiled with torch.compile for faster inference")
        except Exception:
            logger.debug("torch.compile not available, using eager mode")
    else:
        model = model.to(device)

    return model
