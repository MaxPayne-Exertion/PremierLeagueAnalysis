"""
MongoDB JSON Schema Validators for Premier League Analyse
Season-based analytics with strict validation
"""

# PLAYERS COLLECTION SCHEMA

players_schema = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["_id", "name", "team_id", "position", "nationality"],
        "properties": {
            "_id": {"bsonType": "string", "description": "Unique player identifier"},
            "name": {"bsonType": "string"},
            "team_id": {"bsonType": "string"},
            "position": {"enum": ["GK", "DF", "MF", "FW"]},
            "age": {"bsonType": "int", "minimum": 15, "maximum": 45},
            "nationality": {"bsonType": "string"},
            "height_cm": {"bsonType": "int", "minimum": 140, "maximum": 220},
            "preferred_foot": {"enum": ["Left", "Right", "Both"]},
        },
    }
}


# PLAYER SEASON STATS SCHEMA


player_stats_schema = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["player_id", "season", "minutes"],
        "properties": {
            "player_id": {"bsonType": "string"},
            "season": {"bsonType": "string", "pattern": "^[0-9]{4}-[0-9]{2}$"},
            "minutes": {"bsonType": "int", "minimum": 0},
            "matches_played": {"bsonType": "int", "minimum": 0, "maximum": 38},
            # Attacking
            "goals": {"bsonType": "int", "minimum": 0},
            "assists": {"bsonType": "int", "minimum": 0},
            "shots": {"bsonType": "int", "minimum": 0},
            "shots_on_target": {"bsonType": "int", "minimum": 0},
            "xG": {"bsonType": "double", "minimum": 0},
            "xA": {"bsonType": "double", "minimum": 0},
            # Passing
            "passes_attempted": {"bsonType": "int", "minimum": 0},
            "pass_accuracy": {"bsonType": "double", "minimum": 0, "maximum": 100},
            "key_passes": {"bsonType": "int", "minimum": 0},
            "progressive_passes": {"bsonType": "int", "minimum": 0},
            # Defensive
            "tackles": {"bsonType": "int", "minimum": 0},
            "interceptions": {"bsonType": "int", "minimum": 0},
            "clearances": {"bsonType": "int", "minimum": 0},
            "blocks": {"bsonType": "int", "minimum": 0},
        },
    }
}


# TEAMS COLLECTION SCHEMA


teams_schema = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["_id", "name", "stadium"],
        "properties": {
            "_id": {"bsonType": "string"},
            "name": {"bsonType": "string"},
            "stadium": {"bsonType": "string"},
            "manager": {"bsonType": "string"},
            "founded_year": {"bsonType": "int", "minimum": 1800, "maximum": 2100},
        },
    }
}


# TEAM SEASON STATS SCHEMA


team_stats_schema = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["team_id", "season", "points"],
        "properties": {
            "team_id": {"bsonType": "string"},
            "season": {"bsonType": "string", "pattern": "^[0-9]{4}-[0-9]{2}$"},
            "points": {"bsonType": "int", "minimum": 0, "maximum": 114},
            "goals_for": {"bsonType": "int", "minimum": 0},
            "goals_against": {"bsonType": "int", "minimum": 0},
            "xG": {"bsonType": "double", "minimum": 0},
            "xGA": {"bsonType": "double", "minimum": 0},
            "possession": {"bsonType": "double", "minimum": 0, "maximum": 100},
            "clean_sheets": {"bsonType": "int", "minimum": 0, "maximum": 38},
        },
    }
}


# MATCHES COLLECTION SCHEMA


matches_schema = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["_id", "date", "home_team", "away_team"],
        "properties": {
            "_id": {"bsonType": "string"},
            "date": {"bsonType": "date"},
            "home_team": {"bsonType": "string"},
            "away_team": {"bsonType": "string"},
            "home_goals": {"bsonType": "int", "minimum": 0},
            "away_goals": {"bsonType": "int", "minimum": 0},
            "home_xG": {"bsonType": "double", "minimum": 0},
            "away_xG": {"bsonType": "double", "minimum": 0},
        },
    }
}
