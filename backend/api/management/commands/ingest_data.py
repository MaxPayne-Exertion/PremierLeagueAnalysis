import pandas as pd
from django.core.management.base import BaseCommand
from api.models import Team, Player
import os
import re

# Team name normalization mapping
# TEAM_NAME_MAPPING = {
#     "Newcastle United": "Newcastle Utd",
#     "Tottenham Hotspur": "Tottenham",
#     "Manchester United": "Manchester Utd",
#     "West Ham United": "West Ham",
#     "Wolverhampton Wanderers": "Wolves",
#     "Sheffield United": "Sheffield Utd",
#     "Brighton and Hove Albion": "Brighton",
# }

# Static Logo Mapping
TEAM_LOGOS = {
    "Arsenal": "https://resources.premierleague.com/premierleague/badges/t3.svg",
    "Manchester City": "https://resources.premierleague.com/premierleague/badges/t43.svg",
    "Liverpool": "https://resources.premierleague.com/premierleague/badges/t14.svg",
    "Aston Villa": "https://resources.premierleague.com/premierleague/badges/t7.svg",
    "Tottenham Hotspur": "https://resources.premierleague.com/premierleague/badges/t6.svg",
    "Tottenham": "https://resources.premierleague.com/premierleague/badges/t6.svg",
    "Chelsea": "https://resources.premierleague.com/premierleague/badges/t8.svg",
    "Newcastle United": "https://resources.premierleague.com/premierleague/badges/t4.svg",
    "Newcastle Utd": "https://resources.premierleague.com/premierleague/badges/t4.svg",
    "Manchester United": "https://resources.premierleague.com/premierleague/badges/t1.svg",
    "Manchester Utd": "https://resources.premierleague.com/premierleague/badges/t1.svg",
    "West Ham United": "https://resources.premierleague.com/premierleague/badges/t21.svg",
    "West Ham": "https://resources.premierleague.com/premierleague/badges/t21.svg",
    "Crystal Palace": "https://resources.premierleague.com/premierleague/badges/t31.svg",
    "Brighton": "https://resources.premierleague.com/premierleague/badges/t36.svg",
    "Brighton and Hove Albion": "https://resources.premierleague.com/premierleague/badges/t36.svg",
    "Bournemouth": "https://resources.premierleague.com/premierleague/badges/t91.svg",
    "Fulham": "https://resources.premierleague.com/premierleague/badges/t54.svg",
    "Wolverhampton Wanderers": "https://resources.premierleague.com/premierleague/badges/t39.svg",
    "Wolverhampton": "https://resources.premierleague.com/premierleague/badges/t39.svg",
    "Wolves": "https://resources.premierleague.com/premierleague/badges/t39.svg",
    "Everton": "https://resources.premierleague.com/premierleague/badges/t11.svg",
    "Brentford": "https://resources.premierleague.com/premierleague/badges/t94.svg",
    "Nottingham Forest": "https://resources.premierleague.com/premierleague/badges/t17.svg",
    "Nott'ham Forest": "https://resources.premierleague.com/premierleague/badges/t17.svg",
    "Luton Town": "https://resources.premierleague.com/premierleague/badges/t102.svg",
    "Burnley": "https://resources.premierleague.com/premierleague/badges/t90.svg",
    "Sheffield United": "https://resources.premierleague.com/premierleague/badges/t49.svg",
    # "Sheffield Utd": "https://resources.premierleague.com/premierleague/badges/t49.svg",
    "Leeds United": "https://resources.premierleague.com/premierleague/badges/t2.svg",
    "Leicester City": "https://resources.premierleague.com/premierleague/badges/t13.svg",
    "Southampton": "https://resources.premierleague.com/premierleague/badges/t20.svg",
    "West Bromwich Albion": "https://resources.premierleague.com/premierleague/badges/t35.svg",
}


class Command(BaseCommand):
    help = 'Ingests team and player data for specified seasons'

    def add_arguments(self, parser):
        parser.add_argument(
            '--season',
            type=str,
            help='Specific season to ingest (e.g., 2023-24)',
        )

    # def normalize_team_name(self, team_name):
    #     """Normalize team name to match between CSVs"""
    #     return TEAM_NAME_MAPPING.get(team_name, team_name)

    def get_logo_url(self, team_name):
        """Get logo URL for a team with fuzzy matching"""
        logo = TEAM_LOGOS.get(team_name, "")
        if not logo:
            # Fuzzy match attempt
            for key in TEAM_LOGOS:
                if key in team_name or team_name in key:
                    logo = TEAM_LOGOS[key]
                    break
        return logo

    def ingest_team_stats(self, csv_path, season):
        """Ingest team statistics from TEAM CSV"""
        if not os.path.exists(csv_path):
            self.stderr.write(f"Team stats file not found: {csv_path}")
            return

        self.stdout.write(
            f"Reading team stats from {csv_path} for season {season}...")
        df = pd.read_csv(csv_path)

        for _, row in df.iterrows():
            team_name = row['team']
            logo = self.get_logo_url(team_name)

            Team.objects.update_or_create(
                season=season,
                team_name=team_name,
                defaults={
                    "logo_url": logo,
                    "matches_played": int(row['played']),
                    "wins": int(row['won']),
                    "draws": int(row['drawn']),
                    "losses": int(row['lost']),
                    "points": int(row['points']),
                    "goals_for": int(row['gf']),
                    "goals_against": int(row['ga']),
                    "goal_difference": int(row['gd']),
                    "rank": int(row['rank']),
                    "manager": row['manager'],
                    "captain": row['captain'],
                    "stadium": row['stadium'],
                    "top_scorer_all_time": row["top_scorer_all_time"],
                    "premier_league_titles": row["premier_league_titles"],
                    "fa_cup_titles": row["fa_cup_titles"],
                    "league_cup_titles": row["league_cup_titles"],
                    "xg_for": 0.0,  # Will be updated from player stats if available
                }
            )
            self.stdout.write(f"  ✓ Processed team: {team_name}")

        self.stdout.write(self.style.SUCCESS(
            f"Successfully ingested {len(df)} teams for {season}"))

    def ingest_player_stats(self, csv_path, season):
        """Ingest player statistics from EPL CSV"""
        if not os.path.exists(csv_path):
            self.stderr.write(f"Player stats file not found: {csv_path}")
            return

        self.stdout.write(
            f"Reading player stats from {csv_path} for season {season}...")
        df = pd.read_csv(csv_path)

        # Update team xG totals from player data
        unique_teams = df['Team'].unique()
        for team_name in unique_teams:
            team_stats = df[df['Team'] == team_name]
            total_xg = team_stats['xG'].sum()

            try:
                team = Team.objects.get(season=season, team_name=team_name)
                team.xg_for = round(total_xg, 2)
                team.save()
            except Team.DoesNotExist:
                self.stderr.write(
                    f"Warning: Team '{team_name}' not found for season {season}")

        # Ingest players
        for _, row in df.iterrows():
            try:
                team = Team.objects.get(season=season, team_name=row['Team'])
            except Team.DoesNotExist:
                self.stderr.write(
                    f"Warning: Skipping player {row['Player']} - team not found")
                continue

            # Parse nationality
            raw_nation = str(row['Nation'])
            codes = re.findall(r'\b[A-Z]{3}\b', raw_nation)
            if not codes:
                codes = [raw_nation.split(' ')[1]] if ' ' in raw_nation else [
                    raw_nation]

            nationality_display = " ".join(codes)

            # Generate flag URLs
            lower_codes = re.findall(r'\b[a-z]{2,}\b', raw_nation)
            final_flag_urls = []

            if len(lower_codes) == len(codes):
                for lc in lower_codes:
                    if lc == 'eng':
                        lc = 'gb-eng'
                    elif lc == 'sco':
                        lc = 'gb-sct'
                    elif lc == 'wal':
                        lc = 'gb-wls'
                    elif lc == 'nir':
                        lc = 'gb-nir'
                    final_flag_urls.append(f"https://flagcdn.com/w40/{lc}.png")
            else:
                for code in codes:
                    final_flag_urls.append(
                        f"https://flagcdn.com/w40/{code[:2].lower()}.png")

            flag_url_str = ",".join(final_flag_urls)

            # Generate unique player ID
            player_id = f"{season}_{team.team_name}_{row['Player']}".replace(
                " ", "_")

            Player.objects.update_or_create(
                season=season,
                player_id=player_id,
                defaults={
                    "name": row['Player'],
                    "team": team,
                    "nationality": nationality_display,
                    "flag_url": flag_url_str,
                    "position": row['Pos'],
                    "age": int(row['Age']) if not pd.isna(row['Age']) else 0,
                    "matches_played": int(row['MP']),
                    "minutes_played": int(row['Min']),
                    "goals": int(row['Gls']),
                    "assists": int(row['Ast']),
                    "xg": row['xG'],
                    "xag": row['xAG'] if 'xAG' in row else 0.0,
                    "progressive_carries": row['PrgC'] if 'PrgC' in row else 0,
                    "progressive_passes": row['PrgP'] if 'PrgP' in row else 0,
                }
            )

        self.stdout.write(self.style.SUCCESS(
            f"Successfully ingested {len(df)} players for {season}"))

    def ingest_season(self, season):
        """Ingest both team and player data for a season"""
        data_dir = os.path.abspath(os.path.join(
            os.path.dirname(__file__),
            '../../../../backend/data/processed'
        ))

        # Define file mappings
        season_files = {
            '2020-21': {
                'team': 'TEAM_20_21.csv',
                'player': 'EPL_20_21.csv'
            },
            '2023-24': {
                'team': 'TEAM_23_24.csv',
                'player': 'EPL_23_24.csv'
            },
        }

        if season not in season_files:
            self.stderr.write(f"Unknown season: {season}")
            self.stdout.write("Available seasons: " +
                              ", ".join(season_files.keys()))
            return

        self.stdout.write(self.style.WARNING(f"\n{'='*60}"))
        self.stdout.write(self.style.WARNING(f"INGESTING SEASON: {season}"))
        self.stdout.write(self.style.WARNING(f"{'='*60}\n"))

        # Ingest team stats first
        team_csv = os.path.join(data_dir, season_files[season]['team'])
        self.ingest_team_stats(team_csv, season)

        # Then ingest player stats
        player_csv = os.path.join(data_dir, season_files[season]['player'])
        self.ingest_player_stats(player_csv, season)

        self.stdout.write(self.style.SUCCESS(
            f"\n✓ Season {season} ingestion complete!\n"))

    def handle(self, *args, **options):
        if options['season']:
            # Ingest specific season
            self.ingest_season(options['season'])
        else:
            # Ingest all seasons
            seasons = ['2020-21', '2023-24']
            for season in seasons:
                self.ingest_season(season)
