import pytest
import pandas as pd
from src.processing.models import PlayerStats
from src.processing.cleaner import normalize_per_90
from src.analysis.metrics import calculate_xg_clinicality

def test_player_stats_model_validation():
    """Test Pydantic model validation"""
    # Valid data
    valid_data = {
        "player_id": "123",
        "name": "Test Player",
        "team": "Test FC",
        "position": "FW",
        "age": 25,
        "xg": 5.5,
        "xag": 3.2
    }
    player = PlayerStats(**valid_data)
    assert player.xg == 5.5
    
    # Invalid data (negative xg should become 0)
    invalid_data = valid_data.copy()
    invalid_data['xg'] = -1.0
    player_invalid = PlayerStats(**invalid_data)
    assert player_invalid.xg == 0.0

def test_normalize_per_90():
    """Test Per 90 normalization logic"""
    data = {
        'player_id': ['1', '2'],
        'minutes_played': [90, 45],
        'goals': [1, 1],
        'assists': [0, 1]
    }
    df = pd.DataFrame(data)
    
    df_norm = normalize_per_90(df, ['goals', 'assists'])
    
    # Player 1: 1 goal in 90 mins = 1.0 per 90
    assert df_norm.loc[0, 'goals_per90'] == 1.0
    
    # Player 2: 1 goal in 45 mins = 2.0 per 90
    assert df_norm.loc[1, 'goals_per90'] == 2.0

def test_xg_clinicality():
    """Test Clinicality calculation"""
    data = {
        'goals': [10, 5],
        'xg': [8.0, 7.0]
    }
    df = pd.DataFrame(data)
    df_calc = calculate_xg_clinicality(df)
    
    # 10 - 8 = +2.0
    assert df_calc.loc[0, 'clinicality'] == 2.0
    # 5 - 7 = -2.0
    assert df_calc.loc[1, 'clinicality'] == -2.0
