from typing import List
from src.config import Config
from src.utils.logger import setup_logger
from src.utils.db import db_client
from src.ingestion.fetcher import MockFetcher, FBRFetcher
from src.processing.models import PlayerStats, TeamStats
from pymongo import UpdateOne

logger = setup_logger(__name__)

class IngestionManager:
    def __init__(self):
        self.live_mode = Config.LIVE_SCRAPING == 1
        self.fetcher = FBRFetcher() if self.live_mode else MockFetcher()
        self.db = db_client

    def run_ingestion(self):
        logger.info(f"Starting ingestion cycle. Mode: {'LIVE' if self.live_mode else 'MOCK'}")
        
        try:
            # 1. Fetch Data
            raw_players = self.fetcher.fetch_players()
            raw_teams = self.fetcher.fetch_teams()

            # 2. Validate & Model (Processing)
            valid_players = [PlayerStats(**p) for p in raw_players]
            valid_teams = [TeamStats(**t) for t in raw_teams]
            
            # 3. Store to DB
            self._upsert_players(valid_players)
            self._upsert_teams(valid_teams)
            
            logger.info("Ingestion cycle completed successfully.")
            
        except Exception as e:
            logger.error(f"Ingestion cycle failed: {e}", exc_info=True)

    def _upsert_players(self, players: List[PlayerStats]):
        collection = self.db.get_collection("players")
        operations = []
        for p in players:
            # Using player_id as unique key
            ops = UpdateOne(
                {"player_id": p.player_id},
                {"$set": p.model_dump(exclude={'updated_at'}), "$currentDate": {"updated_at": True}},
                upsert=True
            )
            operations.append(ops)
        
        if operations:
            result = collection.bulk_write(operations)
            logger.info(f"Upserted {result.upserted_count + result.modified_count} players.")

    def _upsert_teams(self, teams: List[TeamStats]):
        collection = self.db.get_collection("teams")
        operations = []
        for t in teams:
            ops = UpdateOne(
                {"team_name": t.team_name},
                {"$set": t.model_dump(exclude={'updated_at'}), "$currentDate": {"updated_at": True}},
                upsert=True
            )
            operations.append(ops)
            
        if operations:
            result = collection.bulk_write(operations)
            logger.info(f"Upserted {result.upserted_count + result.modified_count} teams.")

if __name__ == "__main__":
    manager = IngestionManager()
    manager.run_ingestion()
