import requests
import time
import sys
from pathlib import Path
from typing import List, Dict, Any
from pymongo import UpdateOne

# Add project root to sys.path for easy execution as a script
project_root = str(Path(__file__).resolve().parent.parent.parent)
if project_root not in sys.path:
    sys.path.append(project_root)

from src.config import Config
from src.utils.db import db_client
from src.utils.logger import setup_logger

logger = setup_logger(__name__)

SEASON_IDS = {
    "2024/25": 719,
    "2023/24": 578,
    "2022/23": 489,
    "2021/22": 418,
    "2020/21": 363
}

BASE_URL = "https://footballapi.pulselive.com/football"
HEADERS = {
    "Origin": "https://www.premierleague.com",
    "Referer": "https://www.premierleague.com/",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

class PulseScraper:
    def __init__(self):
        self.db = db_client
        self.raw_collection = self.db.get_collection("raw")

    def _fetch_url(self, url: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Fetch data from Pulse API with retries."""
        for attempt in range(3):
            try:
                response = requests.get(url, params=params, headers=HEADERS, timeout=10)
                response.raise_for_status()
                return response.json()
            except Exception as e:
                logger.warning(f"Attempt {attempt + 1} failed for {url}: {e}")
                time.sleep(2)
        return {}

    def scrape_season_teams(self, season_label: str, season_id: int):
        """Scrape all teams and their stats for a given season."""
        logger.info(f"Scraping teams for season {season_label} (ID: {season_id})")
        
        # 1. Get teams for the season
        teams_url = f"{BASE_URL}/teams"
        params = {
            "pageSize": 100,
            "compSeasons": season_id,
            "comps": 1,
            "altIds": True
        }
        data = self._fetch_url(teams_url, params)
        teams = data.get("content", [])
        
        operations = []
        for team in teams:
            team_id = int(team["id"])
            team_name = team["name"]
            
            # 2. Get team stats
            stats_url = f"{BASE_URL}/stats/team/{team_id}"
            stats_params = {"compSeasons": season_id}
            stats_data = self._fetch_url(stats_url, stats_params)
            
            payload = {
                "type": "team",
                "season": season_label,
                "season_id": season_id,
                "team_id": team_id,
                "team_name": team_name,
                "data": team,
                "stats": stats_data.get("stats", []),
                "scraped_at": time.time()
            }
            
            operations.append(UpdateOne(
                {"type": "team", "season": season_label, "team_id": team_id},
                {"$set": payload},
                upsert=True
            ))

        if operations:
            result = self.raw_collection.bulk_write(operations)
            logger.info(f"Stored {result.upserted_count + result.modified_count} team stats for {season_label}")

    def scrape_season_players(self, season_label: str, season_id: int):
        """Scrape top players for a given season. 
        Note: Scraping ALL players is heavy, we'll start with top contributors per stat.
        """
        logger.info(f"Scraping players for season {season_label} (ID: {season_id})")
        
        # We fetch ranked players for major metrics to get a good coverage
        metrics = ["goals", "goal_assist", "appearances", "clean_sheet"]
        seen_players = set()

        for metric in metrics:
            ranked_url = f"{BASE_URL}/stats/ranked/players/{metric}"
            params = {
                "page": 0,
                "pageSize": 50, # Get top 50 per metric
                "compSeasons": season_id,
                "comps": 1,
                "compCodeForFilter": "EN_PR",
                "altIds": True
            }
            data = self._fetch_url(ranked_url, params)
            
            # The structure for player stats ranked is usually { "stats": { "content": [...] } }
            # but let's be defensive.
            stats_root = data.get("stats", {})
            entries = stats_root.get("content", [])
            
            operations = []
            for entry in entries:
                # Some entries might be differently structured or have missing player data
                # It seems 'player' or 'owner' can be used depending on the metric
                player = entry.get("player") or entry.get("owner")
                if not player:
                    logger.debug(f"Entry missing 'player' or 'owner' object in {metric} for {season_label}: {entry}")
                    continue
                
                raw_id = player.get("id")
                if raw_id is None:
                    logger.debug(f"Player object missing 'id' in {metric} for {season_label}: {player}")
                    continue
                player_id = int(raw_id)
                
                if player_id in seen_players:
                    continue
                
                # Get detailed stats for this player in this season
                player_stats_url = f"{BASE_URL}/stats/player/{player_id}"
                player_stats_params = {"compSeasons": season_id}
                player_stats_data = self._fetch_url(player_stats_url, player_stats_params)
                
                player_name = player.get("name", {}).get("display", "Unknown Player")
                
                payload = {
                    "type": "player",
                    "season": season_label,
                    "season_id": season_id,
                    "player_id": player_id,
                    "player_name": player_name,
                    "data": player,
                    "stats": player_stats_data.get("stats", []),
                    "scraped_at": time.time()
                }
                
                operations.append(UpdateOne(
                    {"type": "player", "season": season_label, "player_id": player_id},
                    {"$set": payload},
                    upsert=True
                ))
                seen_players.add(player_id)

            if operations:
                result = self.raw_collection.bulk_write(operations)
                logger.info(f"Stored {result.upserted_count + result.modified_count} {metric} player stats for {season_label}")
            else:
                logger.info(f"No unique players found for metric '{metric}' in {season_label}")

    def run(self):
        for label, sid in SEASON_IDS.items():
            try:
                self.scrape_season_teams(label, sid)
                self.scrape_season_players(label, sid)
                logger.info(f"Completed scraping for season {label}")
            except Exception as e:
                logger.error(f"Failed to scrape season {label}: {e}")

if __name__ == "__main__":
    scraper = PulseScraper()
    scraper.run()
