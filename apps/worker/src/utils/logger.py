import logging
import sys
import os

def setup_logger():
    log_level = os.getenv("LOG_LEVEL", "INFO").upper()
    
    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

    # Standard Output Handler
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    # Root Logger Configuration
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    root_logger.addHandler(handler)

    # Prevent duplicate logs
    root_logger.propagate = False

    logging.info(f"Logger initialized with level: {log_level}")
