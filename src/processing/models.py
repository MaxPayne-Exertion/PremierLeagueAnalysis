from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime

class PlayerStats(BaseModel):
    player_id: str = Field(..., description="Unique ID for the player")
    name: str
    team: str
    position: str
    age: int
    matches_played: int = 0
    minutes_played: int = 0
    goals: int = 0
    assists: int = 0
    xg: float = Field(0.0, description="Expected Goals")
    xag: float = Field(0.0, description="Expected Assisted Goals")
    progressive_carries: int = 0
    progressive_passes: int = 0
    tackles_won: int = 0
    interceptions: int = 0
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    @field_validator('xg', 'xag')
    def non_negative(cls, v):
        if v < 0:
            return 0.0
        return v

class TeamStats(BaseModel):
    team_name: str
    matches_played: int = 0
    wins: int = 0
    draws: int = 0
    losses: int = 0
    goals_for: int = 0
    goals_against: int = 0
    xg_for: float = 0.0
    xg_against: float = 0.0
    points: int = 0
    updated_at: datetime = Field(default_factory=datetime.utcnow)
