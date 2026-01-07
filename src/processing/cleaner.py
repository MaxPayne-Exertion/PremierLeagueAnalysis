from typing import List, Dict, Any
import pandas as pd
import numpy as np
from src.processing.models import PlayerStats

def normalize_per_90(df: pd.DataFrame, cols_to_normalize: List[str]) -> pd.DataFrame:
    """
    Normalizes selected columns to 'Per 90 minutes' values.
    Formula: (Value / Minutes Played) * 90
    """
    if 'minutes_played' not in df.columns:
        raise ValueError("DataFrame must contain 'minutes_played' column.")

    # Avoid division by zero
    mask = df['minutes_played'] > 0
    
    # Create copy to avoid SettingWithCopy warnings
    df_norm = df.copy()

    for col in cols_to_normalize:
        if col in df.columns:
            new_col_name = f"{col}_per90"
            df_norm.loc[mask, new_col_name] = (df_norm.loc[mask, col] / df_norm.loc[mask, 'minutes_played']) * 90
            df_norm.loc[~mask, new_col_name] = 0.0
            
    return df_norm

def clean_player_data(players: List[Dict[str, Any]]) -> pd.DataFrame:
    df = pd.DataFrame(players)
    
    # Fill standard NaNs
    df.fillna(0, inplace=True)
    
    # Ensure types
    numeric_cols = ['goals', 'assists', 'xg', 'xag', 'minutes_played']
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
            
    return df
