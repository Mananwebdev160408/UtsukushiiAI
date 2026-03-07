import torch
import logging

logger = logging.getLogger(__name__)

def get_device():
    """Returns the best available device (cuda, mps, or cpu)."""
    if torch.cuda.is_available():
        return "cuda"
    # Support for Mac M1/M2 chips
    # if torch.backends.mps.is_available():
    #     return "mps"
    return "cpu"

def get_device_info():
    """Returns detailed information about the current device."""
    device_type = get_device()
    info = {
        "device": device_type,
        "name": "CPU",
        "memory_total": 0,
        "memory_allocated": 0
    }

    if device_type == "cuda":
        prop = torch.cuda.get_device_properties(0)
        info.update({
            "name": prop.name,
            "memory_total": prop.total_memory // (1024 * 1024),  # MB
            "memory_allocated": torch.cuda.memory_allocated(0) // (1024 * 1024)  # MB
        })
    
    return info

def clear_cache():
    """Clears GPU cache if applicable."""
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
        logger.debug("CUDA cache cleared")
