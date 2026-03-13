import os
from ultralytics import YOLO
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def train_yolo():
    """Trains a YOLO model for manga panel detection locally."""
    
    # The dataset directory should contain your data.yaml
    # Make sure you've downloaded the ZIP from Roboflow and extracted it here
    dataset_yaml = os.path.join(os.path.dirname(os.path.dirname(__file__)), "datasets", "manga_panels", "data.yaml")
    
    if not os.path.exists(dataset_yaml):
        logger.error(f"Dataset YAML not found at {dataset_yaml}")
        logger.error("Please download the YOLOv11 ZIP from Roboflow and extract it to apps/worker/datasets/manga_panels/")
        return

    logger.info(f"Starting YOLO training using dataset config: {dataset_yaml}")
    
    # Load a pre-trained model (we use yolov8n.pt as a fast, light starting point)
    # Note: Ultralytics currently supports up to YOLOv11 natively in their pip package.
    # The 'yolo11n.pt' is the nano version of YOLOv11.
    try:
        model = YOLO("yolo11n.pt") 
    except Exception as e:
        logger.warning(f"Failed to load yolo11n.pt, falling back to yolov8n.pt: {e}")
        model = YOLO("yolov8n.pt")

    # Enforce GPU training
    import torch
    if not torch.cuda.is_available():
        logger.error("CUDA is not available. Please install PyTorch with CUDA support.")
        logger.error("Run: pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu128")
        return
    
    gpu_name = torch.cuda.get_device_name(0)
    vram_gb = round(torch.cuda.get_device_properties(0).total_memory / 1024**3, 1)
    logger.info(f"Using GPU: {gpu_name} ({vram_gb} GB VRAM)")

    # Train the model on GPU
    try:
        results = model.train(
            data=dataset_yaml,
            epochs=50,
            imgsz=640,
            batch=8,            # Tuned for 4GB VRAM (RTX 3050)
            device=0,           # GPU 0
            name="yolov12-manga",
            project="models/training_runs",
            resume=False        # Fresh training (set to True only to resume from checkpoint)
        )
        
        logger.info("Training complete!")
        logger.info("Your trained weights are located in: apps/worker/models/training_runs/yolov12-manga/weights/best.pt")
        logger.info("Copy 'best.pt' to 'apps/worker/models/yolov12-manga.pt' to use it in the pipeline.")
        
    except Exception as e:
        logger.error(f"Training failed: {e}")

if __name__ == "__main__":
    train_yolo()
