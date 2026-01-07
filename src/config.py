import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

class Config:
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/epl_analytics")
    MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "epl_analytics")
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    ENV_TYPE = os.getenv("ENV_TYPE", "dev")
    LIVE_SCRAPING = int(os.getenv("LIVE_SCRAPING", 0))

    # Paths
    BASE_DIR = Path(__file__).parent.parent
    LOG_DIR = BASE_DIR.parent / 'logs'
    
    @staticmethod
    def ensure_dirs():
        Config.LOG_DIR.mkdir(parents=True, exist_ok=True)

# Ensure directories exist on import
Config.ensure_dirs()
