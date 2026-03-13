import os
import shutil
import logging
from config.config import settings

logger = logging.getLogger(__name__)

class StorageHelper:
    @staticmethod
    def get_asset_path(asset_type: str, filename: str) -> str:
        """Returns the absolute path for a given asset."""
        if asset_type == "download":
            return os.path.join(settings.DOWNLOAD_PATH, filename)
        elif asset_type == "output":
            return os.path.join(settings.OUTPUT_PATH, filename)
        elif asset_type == "storage":
            return os.path.join(settings.STORAGE_PATH, filename)
        else:
            raise ValueError(f"Unknown asset type: {asset_type}")

    @staticmethod
    def save_file(source_path: str, target_dir: str, filename: str) -> str:
        """Copies a file to a target directory with a new filename."""
        os.makedirs(target_dir, exist_ok=True)
        target_path = os.path.join(target_dir, filename)
        shutil.copy2(source_path, target_path)
        logger.debug(f"File saved: {target_path}")
        return target_path

    @staticmethod
    def delete_file(file_path: str):
        """Deletes a file if it exists."""
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.debug(f"File deleted: {file_path}")

    @staticmethod
    def cleanup_old_files(directory: str, max_age_hours: int = 24):
        """Cleans up files older than a certain age."""
        import time
        now = time.time()
        for f in os.listdir(directory):
            path = os.path.join(directory, f)
            if os.stat(path).st_mtime < now - max_age_hours * 3600:
                if os.path.isfile(path):
                    os.remove(path)
                    logger.debug(f"Cleaned up old file: {path}")
