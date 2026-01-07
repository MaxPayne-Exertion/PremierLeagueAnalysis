import logging
import sys
from logging.handlers import RotatingFileHandler
from src.config import Config

def setup_logger(name: str):
    logger = logging.getLogger(name)
    logger.setLevel(Config.LOG_LEVEL)

    if not logger.handlers:
        # Console Handler
        c_handler = logging.StreamHandler(sys.stdout)
        c_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        c_handler.setFormatter(c_formatter)
        logger.addHandler(c_handler)

        # File Handler
        log_file = Config.LOG_DIR / 'ingestion.log'
        f_handler = RotatingFileHandler(log_file, maxBytes=10*1024*1024, backupCount=5)
        f_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        f_handler.setFormatter(f_formatter)
        logger.addHandler(f_handler)

    return logger
