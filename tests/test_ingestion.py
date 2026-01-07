import pytest
from unittest.mock import MagicMock, patch
from src.ingestion.fetcher import MockFetcher

def test_mock_fetcher_generation():
    """Test that MockFetcher returns valid data structures"""
    fetcher = MockFetcher()
    
    players = fetcher.fetch_players()
    assert len(players) > 0
    assert 'player_id' in players[0]
    assert 'xg' in players[0]
    
    teams = fetcher.fetch_teams()
    assert len(teams) > 0
    assert 'team_name' in teams[0]
    assert 'points' in teams[0]

@patch('src.ingestion.manager.db_client')  # Mock the global db_client
def test_ingestion_manager_flow(mock_db):
    """Test the ingestion manager orchestration without real DB"""
    from src.ingestion.manager import IngestionManager
    
    # Setup mock collection
    mock_collection = MagicMock()
    mock_db.get_collection.return_value = mock_collection
    mock_collection.bulk_write.return_value.upserted_count = 10
    mock_collection.bulk_write.return_value.modified_count = 5
    
    # Run manager in Mock mode (forced via MockFetcher being default if LIVE_SCRAPING=0)
    # We ensure fetcher uses MockFetcher by default config in test env
    manager = IngestionManager()
    
    # Override fetcher to be sure we don't hit networking even if config changed
    manager.fetcher = MockFetcher() 
    
    manager.run_ingestion()
    
    # Check that get_collection was valid
    assert mock_db.get_collection.call_count >= 2 # players and teams
    
    # Check that bulk_write was called
    assert mock_collection.bulk_write.called
