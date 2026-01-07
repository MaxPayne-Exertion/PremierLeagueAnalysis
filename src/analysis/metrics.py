import pandas as pd
import numpy as np

def calculate_xg_clinicality(df: pd.DataFrame) -> pd.DataFrame:
    """
    Calculates Clinicality (Goals - xG).
    Positive = Overperforming. Negative = Underperforming.
    """
    if 'goals' in df.columns and 'xg' in df.columns:
        df['clinicality'] = df['goals'] - df['xg']
    else:
        df['clinicality'] = 0.0
    return df

def calculate_advanced_metrics(df: pd.DataFrame) -> pd.DataFrame:
    """
    Wrapper for all advanced metrics.
    """
    df = calculate_xg_clinicality(df)
    
    # Example: Goal Contribution
    if 'goals' in df.columns and 'assists' in df.columns:
        df['goal_contribution'] = df['goals'] + df['assists']
        
    return df
