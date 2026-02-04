import os
import pandas as pd
from django.core.management.base import BaseCommand
from premier_league_backend.models import Team, Player


TEAM_LOGOS = {
    "Arsenal": "https://resources.premierleague.com/premierleague/badges/t3.svg",
    "Manchester City": "https://resources.premierleague.com/premierleague/badges/t43.svg",
    "Liverpool": "https://resources.premierleague.com/premierleague/badges/t14.svg",
    "Aston Villa": "https://resources.premierleague.com/premierleague/badges/t7.svg",
    "Tottenham Hotspur": "https://resources.premierleague.com/premierleague/badges/t6.svg",
    "Chelsea": "https://resources.premierleague.com/premierleague/badges/t8.svg",
    "Newcastle United": "https://resources.premierleague.com/premierleague/badges/t4.svg",
    "Manchester United": "https://resources.premierleague.com/premierleague/badges/t1.svg",
    "West Ham United": "https://resources.premierleague.com/premierleague/badges/t21.svg",
    "Crystal Palace": "https://resources.premierleague.com/premierleague/badges/t31.svg",
    "Brighton & Hove Albion": "https://resources.premierleague.com/premierleague/badges/t36.svg",
    "Bournemouth": "https://resources.premierleague.com/premierleague/badges/t91.svg",
    "Fulham": "https://resources.premierleague.com/premierleague/badges/t54.svg",
    "Wolverhampton": "https://resources.premierleague.com/premierleague/badges/t39.svg",
    "Everton": "https://resources.premierleague.com/premierleague/badges/t11.svg",
    "Brentford": "https://resources.premierleague.com/premierleague/badges/t94.svg",
    "Nottingham Forest": "https://resources.premierleague.com/premierleague/badges/t17.svg",
    "Luton Town": "https://resources.premierleague.com/premierleague/badges/t102.svg",
    "Burnley": "https://resources.premierleague.com/premierleague/badges/t90.svg",
    "Sheffield United": "https://resources.premierleague.com/premierleague/badges/t49.svg",
    "Leicester City": "https://resources.premierleague.com/premierleague/badges/t13.svg",
    "Ipswich Town": "https://resources.premierleague.com/premierleague/badges/t40.svg",
    "Leeds United": "https://resources.premierleague.com/premierleague/badges/t2.svg",
    "Southampton": "https://resources.premierleague.com/premierleague/badges/t20.svg",
    "Watford": "https://resources.premierleague.com/premierleague/badges/t57.svg",
    "Norwich City": "https://resources.premierleague.com/premierleague/badges/t45.svg",
    "Huddersfield Town" :"https://resources.premierleague.com/premierleague/badges/t38.svg",
    "Swansea City":"https://resources.premierleague.com/premierleague/badges/t80.svg" ,
    "Stoke City":"https://resources.premierleague.com/premierleague/badges/t110.svg" ,
    "West Bromwich Albion":"https://resources.premierleague.com/premierleague/badges/t35.svg" ,
}


class Command(BaseCommand):
    help = "Ingest team and player data for EPL seasons"

    def add_arguments(self, parser):
        parser.add_argument(
            "--season",
            type=str,
            help="Season to ingest (e.g. 2023-24)",
        )
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Clear existing data for the season before importing",
        )

    def get_logo_url(self, team_name: str) -> str:
        return TEAM_LOGOS.get(team_name, "")

    def normalize_df(self, df: pd.DataFrame) -> pd.DataFrame:
        df.columns = df.columns.str.strip().str.lower()
        return df
    
    def safe_int(self, value, default=0):
        """Safely convert value to int"""
        try:
            return int(value) if pd.notna(value) and value != '' else default
        except (ValueError, TypeError):
            return default
    
    def safe_float(self, value, default=0.0):
        """Safely convert value to float"""
        try:
            return float(value) if pd.notna(value) and value != '' else default
        except (ValueError, TypeError):
            return default

    def ingest_team_stats(self, csv_path: str, season: str):
        if not os.path.exists(csv_path):
            self.stderr.write(f"Team CSV not found: {csv_path}")
            return

        self.stdout.write(f"Reading team stats from {csv_path}...")
        df = self.normalize_df(pd.read_csv(csv_path))

        for _, row in df.iterrows():
            team_name = row["team"]

            Team.objects.update_or_create(
                season=season,
                team_name=team_name,
                defaults={
                    "logo_url": self.get_logo_url(team_name),
                    "matches_played": self.safe_int(row.get("played")),
                    "wins": self.safe_int(row.get("won")),
                    "draws": self.safe_int(row.get("drawn")),
                    "losses": self.safe_int(row.get("lost")),
                    "points": self.safe_int(row.get("points")),
                    "goals_for": self.safe_int(row.get("gf")),
                    "goals_against": self.safe_int(row.get("ga")),
                    "goal_difference": self.safe_int(row.get("gd")),
                    "rank": self.safe_int(row.get("rank")),
                    "manager": row.get("manager", ""),
                    "captain": row.get("captain", ""),
                    "stadium": row.get("stadium", ""),
                    "top_scorer_all_time": row.get("top_scorer_all_time", ""),
                    "premier_league_titles": row.get("premier_league_titles", ""),
                    "fa_cup_titles": row.get("fa_cup_titles", ""),
                    "league_cup_titles": row.get("league_cup_titles", ""),
                    "xg_for": 0.0,
                }
            )

            self.stdout.write(f"  ✓ {team_name}")

        self.stdout.write(self.style.SUCCESS(
            f"Ingested {len(df)} teams for {season}"
        ))

    def ingest_player_stats(self, csv_path: str, season: str):
        if not os.path.exists(csv_path):
            self.stderr.write(f"Player CSV not found: {csv_path}")
            return

        self.stdout.write(f"Reading player stats from {csv_path}...")
        df = self.normalize_df(pd.read_csv(csv_path))
        
        # Print columns to debug
        self.stdout.write(f"CSV Columns: {list(df.columns)}")

        # -------- Update team xG --------
        if "expectedgoals" in df.columns:
            for team_name in df["team"].unique():
                total_xg = df[df["team"] == team_name]["expectedgoals"].sum()

                try:
                    team = Team.objects.get(season=season, team_name=team_name)
                    team.xg_for = round(float(total_xg), 2)
                    team.save()
                except Team.DoesNotExist:
                    self.stderr.write(
                        f"Warning: team '{team_name}' not found"
                    )

        # -------- Ingest players --------
        created_count = 0
        updated_count = 0
        
        for _, row in df.iterrows():
            try:
                team = Team.objects.get(season=season, team_name=row["team"])
            except Team.DoesNotExist:
                self.stderr.write(f"Team not found: {row['team']}")
                continue

            player, created = Player.objects.update_or_create(
                season=season,
                player_id=str(row.get("player id", row.get("playerid", ""))),
                defaults={
                    "name": row.get("player", ""),
                    "team": team,
                    "position": row.get("position", ""),
                    
                    # Basic
                    "appearances": self.safe_int(row.get("appearances")),
                    "minutesPlayed": self.safe_int(row.get("minutesplayed", row.get("minutes"))),
                    
                    # Attacking
                    "goals": self.safe_int(row.get("goals")),
                    "assists": self.safe_int(row.get("assists")),
                    "expectedGoals": self.safe_float(row.get("expectedgoals", row.get("xg"))),
                    "totalShots": self.safe_int(row.get("totalshots", row.get("shots"))),
                    "shotsOnTarget": self.safe_int(row.get("shotsontarget")),
                    "blockedShots": self.safe_int(row.get("blockedshots")),
                    "bigChancesMissed": self.safe_int(row.get("bigchancesmissed")),
                    "goalConversionPercentage": self.safe_float(row.get("goalconversionpercentage")),
                    "hitWoodwork": self.safe_int(row.get("hitwoodwork")),
                    "offsides": self.safe_int(row.get("offsides")),
                    "passToAssist": self.safe_int(row.get("passtoassist")),
                    
                    # Passing
                    "accuratePasses": self.safe_int(row.get("accuratepasses")),
                    "accuratePassesPercentage": self.safe_float(row.get("accuratepassespercentage")),
                    "keyPasses": self.safe_int(row.get("keypasses")),
                    "accurateFinalThirdPasses": self.safe_int(row.get("accuratefinalthirdpasses")),
                    "accurateCrosses": self.safe_int(row.get("accuratecrosses")),
                    "accurateCrossesPercentage": self.safe_float(row.get("accuratecrossespercentage")),
                    "accurateLongBalls": self.safe_int(row.get("accuratelongballs")),
                    "accurateLongBallsPercentage": self.safe_float(row.get("accuratelongballspercentage")),
                    
                    # Duels & Defense
                    "tackles": self.safe_int(row.get("tackles")),
                    "interceptions": self.safe_int(row.get("interceptions")),
                    "clearances": self.safe_int(row.get("clearances")),
                    "dribbledPast": self.safe_int(row.get("dribbledpast")),
                    "groundDuelsWon": self.safe_int(row.get("groundduelswon")),
                    "groundDuelsWonPercentage": self.safe_float(row.get("groundduelswonpercentage")),
                    "aerialDuelsWon": self.safe_int(row.get("aerialduelswon")),
                    "aerialDuelsWonPercentage": self.safe_float(row.get("aerialduelswonpercentage")),
                    "totalDuelsWon": self.safe_int(row.get("totalduelswon")),
                    "totalDuelsWonPercentage": self.safe_float(row.get("totalduelswonpercentage")),
                    "successfulDribbles": self.safe_int(row.get("successfuldribbles")),
                    "successfulDribblesPercentage": self.safe_float(row.get("successfuldribblespercentage")),
                    
                    # Discipline
                    "yellowCards": self.safe_int(row.get("yellowcards")),
                    "redCards": self.safe_int(row.get("redcards")),
                    "fouls": self.safe_int(row.get("fouls")),
                    "wasFouled": self.safe_int(row.get("wasfouled")),
                    "dispossessed": self.safe_int(row.get("dispossessed")),
                    
                    # Goalkeeping - FIXED FIELD NAMES
                    "saves": self.safe_int(row.get("saves")),
                    "savedShotsFromInsideTheBox": self.safe_int(row.get("savedshotsfrominsidethebox")),
                    "savedShotsFromOutsideTheBox": self.safe_int(row.get("savedshotsfromoutsidethebox")),
                    "goalsConceded": self.safe_int(row.get("goalsconceded")),
                    "goalsConcededInsideTheBox": self.safe_int(row.get("goalsconcededinsidethebox")),
                    "goalsConcededOutsideTheBox": self.safe_int(row.get("goalsconcededoutsidethebox")),
                    "highClaims": self.safe_int(row.get("highclaims")),
                    "runsOut": self.safe_int(row.get("runsout")),
                    "successfulRunsOut": self.safe_int(row.get("successfulrunsout")),
                    "punches": self.safe_int(row.get("punches")),
                    
                    # Errors
                    "errorLeadToGoal": self.safe_int(row.get("errorleadtogoal")),
                    "errorLeadToShot": self.safe_int(row.get("errorleadtoshot")),
                }
            )
            
            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(self.style.SUCCESS(
            f"Ingested {len(df)} players for {season} (Created: {created_count}, Updated: {updated_count})"
        ))

    # -------------------- SEASON INGEST --------------------

    def ingest_season(self, season: str, clear: bool = False):
        data_dir = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "../../../../backend/data/processed")
        )

        season_files = {
            "2017-18": {
                "team": "TEAM_17_18.csv",
                "player": "EPL_17_18.csv",
            },

            "2020-21": {
                "team": "TEAM_20_21.csv",
                "player": "EPL_20_21.csv",
            },
            "2021-22": {
                "team": "TEAM_21_22.csv",
                "player": "EPL_21_22.csv",
            },
            "2022-23":{
                "team": "TEAM_22_23.csv",
                "player": "EPL_22_23.csv",
            },
            "2023-24": {
                "team": "TEAM_23_24.csv",
                "player": "EPL_23_24.csv",
            },
            "2024-25": {
                "team": "TEAM_24_25.csv",
                "player": "EPL_24_25.csv",
            },
        }

        if season not in season_files:
            self.stderr.write(f"Unknown season: {season}")
            return

        # Clear existing data if requested
        if clear:
            self.stdout.write(self.style.WARNING(f"Clearing existing data for {season}..."))
            Player.objects.filter(season=season).delete()
            Team.objects.filter(season=season).delete()
            self.stdout.write(self.style.SUCCESS("Data cleared."))

        self.stdout.write(self.style.WARNING(f"\n{'=' * 60}"))
        self.stdout.write(self.style.WARNING(f"INGESTING SEASON: {season}"))
        self.stdout.write(self.style.WARNING(f"{'=' * 60}\n"))

        self.ingest_team_stats(
            os.path.join(data_dir, season_files[season]["team"]),
            season,
        )

        self.ingest_player_stats(
            os.path.join(data_dir, season_files[season]["player"]),
            season,
        )

        self.stdout.write(self.style.SUCCESS(
            f"\n✓ Season {season} ingestion complete!\n"
        ))

    # -------------------- ENTRY POINT --------------------

    def handle(self, *args, **options):
        clear = options.get("clear", False)
        
        if options.get("season"):
            self.ingest_season(options["season"], clear=clear)
        else:
            for season in ["2020-21", "2023-24"]:
                self.ingest_season(season, clear=clear)