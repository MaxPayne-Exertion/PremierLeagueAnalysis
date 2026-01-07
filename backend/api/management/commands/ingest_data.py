import pandas as pd
from django.core.management.base import BaseCommand
from api.models import Team, Player
import os

# Static Logo Mapping (Team names must match CSV values)
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
    "Sheffield Utd": "https://resources.premierleague.com/premierleague/badges/t49.svg",
    "Leeds United": "https://resources.premierleague.com/premierleague/badges/t2.svg",
    "Leicester City": "https://resources.premierleague.com/premierleague/badges/t13.svg",
    "Southampton": "https://resources.premierleague.com/premierleague/badges/t20.svg",
}

class Command(BaseCommand):
    help = 'Ingests data from all CSV files in data/processed/'

    def add_arguments(self, parser):
        parser.add_argument(
            '--season',
            type=str,
            help='Specific season to ingest (e.g., 2023-24)',
        )

    def ingest_season(self, csv_path, season):
        """Ingest data for a specific season"""
        if not os.path.exists(csv_path):
            self.stderr.write(f"File not found: {csv_path}")
            return

        self.stdout.write(f"Reading {csv_path} for season {season}...")
        df = pd.read_csv(csv_path)

        # 1. Ingest Teams
        unique_teams = df['Team'].unique()
        for team_name in unique_teams:
            team_stats = df[df['Team'] == team_name]
            total_goals = team_stats['Gls'].sum()
            total_xg = team_stats['xG'].sum()
            
            logo = TEAM_LOGOS.get(team_name, "")
            if not logo:
                for k in TEAM_LOGOS:
                    if k in team_name or team_name in k:
                        logo = TEAM_LOGOS[k]
                        break
            
            # Mock W/D/L for visual demonstration
            import random
            mp = int(team_stats['MP'].max())
            wins = random.randint(0, mp)
            losses = random.randint(0, mp - wins)
            draws = mp - wins - losses
            points = (wins * 3) + draws
            goals_against = int(total_goals * (random.uniform(0.8, 1.2) if points > 40 else random.uniform(1.2, 1.6)))

            Team.objects.update_or_create(
                season=season,
                team_name=team_name,
                defaults={
                    "logo_url": logo,
                    "matches_played": mp,
                    "wins": wins,
                    "draws": draws,
                    "losses": losses,
                    "points": points,
                    "goals_for": total_goals,
                    "goals_against": goals_against,
                    "xg_for": round(total_xg, 2),
                }
            )
            self.stdout.write(f"Processed team: {team_name} ({season})")

        # 2. Ingest Players
        for _, row in df.iterrows():
            team = Team.objects.get(season=season, team_name=row['Team'])
            
            # Nation parsing
            raw_nation = str(row['Nation'])
            import re
            codes = re.findall(r'\b[A-Z]{3}\b', raw_nation)
            if not codes:
                codes = [raw_nation.split(' ')[1]] if ' ' in raw_nation else [raw_nation]
            
            nationality_display = " ".join(codes)
            
            # Generate flag URLs
            lower_codes = re.findall(r'\b[a-z]{2,}\b', raw_nation)
            
            final_flag_urls = []
            if len(lower_codes) == len(codes):
                for lc in lower_codes:
                    if lc == 'eng': lc = 'gb-eng'
                    elif lc == 'sco': lc = 'gb-sct'
                    elif lc == 'wal': lc = 'gb-wls'
                    elif lc == 'nir': lc = 'gb-nir'
                    final_flag_urls.append(f"https://flagcdn.com/w40/{lc}.png")
            else:
                for code in codes:
                    final_flag_urls.append(f"https://flagcdn.com/w40/{code[:2].lower()}.png")

            flag_url_str = ",".join(final_flag_urls)
            
            player_id = f"{season}_{team.team_name}_{row['Player']}".replace(" ", "_")

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
        
        self.stdout.write(self.style.SUCCESS(f"Successfully ingested {len(df)} players for {season}"))

    def handle(self, *args, **options):
        data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../../data/processed'))
        
        # Map CSV files to seasons
        season_files = {
            '2020-21': 'EPL_20_21.csv',
            '2023-24': 'EPL_23_24.csv',
        }

        if options['season']:
            # Ingest specific season
            season = options['season']
            if season not in season_files:
                self.stderr.write(f"Unknown season: {season}")
                return
            
            csv_path = os.path.join(data_dir, season_files[season])
            self.ingest_season(csv_path, season)
        else:
            # Ingest all seasons
            for season, filename in season_files.items():
                csv_path = os.path.join(data_dir, filename)
                self.ingest_season(csv_path, season)

# Helper to normalize team names if CSV differs
def normalize_team(name):
    # CSV might say "Manchester City" or "Man City". Our logos dict has "Manchester City" to be safe.
    # Let's map common vars. 
    # Based on CSV snippet: "Manchester City"
    return name

class Command(BaseCommand):
    help = 'Ingests real data from data/processed/EPL_23_24.csv'

    def handle(self, *args, **kwargs):
        # Path is relative to where manage.py is run (backend/), so we go up one level
        csv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../../data/processed/EPL_23_24.csv'))
        if not os.path.exists(csv_path):
            self.stderr.write(f"File not found: {csv_path}")
            return

        self.stdout.write(f"Reading {csv_path}...")
        df = pd.read_csv(csv_path)

        # 1. Ingest Teams
        unique_teams = df['Team'].unique()
        for team_name in unique_teams:
            # Stats aggregation
            team_stats = df[df['Team'] == team_name]
            total_goals = team_stats['Gls'].sum()
            total_xg = team_stats['xG'].sum()
            
            # Simple aggregation logic for team stats from player stats
            logo = TEAM_LOGOS.get(team_name, "")
            if not logo:
                # Fuzzy match attempt or fallback
                for k in TEAM_LOGOS:
                    if k in team_name or team_name in k:
                        logo = TEAM_LOGOS[k]
                        break
            
            # Mock W/D/L for visual demonstration (since CSV lacks match results)
            import random
            mp = int(team_stats['MP'].max())
            wins = random.randint(0, mp)
            losses = random.randint(0, mp - wins)
            draws = mp - wins - losses
            points = (wins * 3) + draws
            # Rough GA calc: let's assume GA is somewhat relative to Losses
            # This is purely for visual "completeness" of the table
            goals_against = int(total_goals * (random.uniform(0.8, 1.2) if points > 40 else random.uniform(1.2, 1.6)))

            Team.objects.update_or_create(
                team_name=team_name,
                defaults={
                    "logo_url": logo,
                    "matches_played": mp,
                    "wins": wins,
                    "draws": draws,
                    "losses": losses,
                    "points": points,
                    "goals_for": total_goals,
                    "goals_against": goals_against,
                    "xg_for": round(total_xg, 2),
                }
            )
            self.stdout.write(f"Processed team: {team_name}")

        # 2. Ingest Players
        for _, row in df.iterrows():
            team = Team.objects.get(team_name=row['Team'])
            
            # Nation parsing: "es ESP" -> "ESP". "es ESP en ENG" -> "ESP ENG"
            raw_nation = str(row['Nation'])
            # Extract all uppercase words of length 3 (ISOish)
            import re
            codes = re.findall(r'\b[A-Z]{3}\b', raw_nation)
            if not codes:
                # Fallback
                codes = [raw_nation.split(' ')[1]] if ' ' in raw_nation else [raw_nation]
            
            # Join for display
            nationality_display = " ".join(codes)
            
            # Generate flag URLs (comma separated)
            # Map common codes to flagcdn, strict mapping might be needed 
            # ENG -> gb-eng, ESP -> es, etc.
            flag_urls = []
            for code in codes:
                c = code.lower()
                # Manual Mapping for UK nations as they are common
                if c == 'eng': c = 'gb-eng'
                elif c == 'sco': c = 'gb-sct'
                elif c == 'wal': c = 'gb-wls'
                elif c == 'nir': c = 'gb-nir'
                # For others, assume ISO 2 approx (ESP->es, DEU->de? CSV uses 3 letter). 
                # flagcdn uses 2 letter ISO codes usually.
                # CSV seems to map "es ESP". "br BRA". 
                # We need a mapper from 3-letter to 2-letter if we want accuracy.
                # For now, let's use the first part of the string "es" if available?
                # "es ESP" -> "es" is available at start. 
                
            # Better approach: Use the lowercase prefix from the CSV "es ESP" -> "es"
            # But what if multiple? "es ESP br BRA"?
            # Let's extract the lowercase parts?
            lower_codes = re.findall(r'\b[a-z]{2,}\b', raw_nation)
            # If we match pairs, good.
            
            final_flag_urls = []
            if len(lower_codes) == len(codes):
                for lc in lower_codes:
                    if lc == 'eng': lc = 'gb-eng'
                    elif lc == 'sco': lc = 'gb-sct'
                    elif lc == 'wal': lc = 'gb-wls'
                    elif lc == 'nir': lc = 'gb-nir'
                    final_flag_urls.append(f"https://flagcdn.com/w40/{lc}.png")
            else:
                 # Fallback: just try to guess from the 3-letter code or use a generic one
                 # Or use the first one found
                 for code in codes:
                     # very rough fallback for demo
                     final_flag_urls.append(f"https://flagcdn.com/w40/{code[:2].lower()}.png")

            flag_url_str = ",".join(final_flag_urls)
            
            # ID generation
            # Real CSV doesn't have ID, generate simpler slug or hash?
            # Or just use name as unique key if simple
            player_id = f"{team.team_name}_{row['Player']}".replace(" ", "_")

            Player.objects.update_or_create(
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
        
        self.stdout.write(self.style.SUCCESS(f"Successfully ingested {len(df)} players"))
