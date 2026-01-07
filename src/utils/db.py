from pymongo import MongoClient, errors
from pymongo.collection import Collection
from pymongo.database import Database
from src.config import Config
from src.utils.logger import setup_logger
import time

logger = setup_logger(__name__)

class MongoDB:
    _instance = None
    _client: MongoClient = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MongoDB, cls).__new__(cls)
            # Lazy connection: Do not connect immediately on import
        return cls._instance

    def _connect(self):
        if self._client:
            return
        try:
            self._client = MongoClient(
                Config.MONGO_URI,
                serverSelectionTimeoutMS=5000,
                maxPoolSize=100,  # Connection Pooling
                minPoolSize=10
            )
            # Verify connection
            self._client.admin.command('ping')
            logger.info("Successfully connected to MongoDB.")
        except errors.ServerSelectionTimeoutError as err:
            logger.error(f"MongoDB Connection Failed: {err}")
            raise

    @property
    def db(self) -> Database:
        if not self._client:
            self._connect()
        return self._client[Config.MONGO_DB_NAME]

    def get_collection(self, collection_name: str) -> Collection:
        if not self._client:
            self._connect()
        return self.db[collection_name]

    def close(self):
        if self._client:
            self._client.close()
            logger.info("MongoDB connection closed.")

# Global instance
db_client = MongoDB()
