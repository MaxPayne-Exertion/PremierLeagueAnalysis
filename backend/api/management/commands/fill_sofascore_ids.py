import csv
import unicodedata
from difflib import get_close_matches
from django.core.management.base import BaseCommand
from api.models import Player

def normalize_name(name):
    """Normalize player names for matching."""
    if not name:
        return ""
    name = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode("ascii")  # remove accents
    name = name.lower().replace("-", " ").replace("'", "").strip()  # remove hyphens/apostrophes
    name = " ".join(name.split())  # collapse multiple spaces
    return name

class Command(BaseCommand):
    help = "Backfill sofascore_id from CSV with robust fuzzy matching"

    def handle(self, *args, **options):
        csv_file = "data/processed/PLAYERS_ID_23_24.csv"
        updated_count = 0

        # Load all players in season first
        players_qs = Player.objects.filter(season="2023-24")
        db_names = {normalize_name(p.name): p for p in players_qs}

        with open(csv_file, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                csv_name = normalize_name(row["player_name"])
                sofascore_id = row["player_id"].strip()

                # Exact match first
                if csv_name in db_names:
                    player = db_names[csv_name]
                    player.sofascore_id = sofascore_id
                    player.save()
                    updated_count += 1
                    continue

                # Fuzzy match if exact fails
                close_matches = get_close_matches(csv_name, db_names.keys(), n=1, cutoff=0.7)  # lower cutoff
                if close_matches:
                    player = db_names[close_matches[0]]
                    player.sofascore_id = sofascore_id
                    player.save()
                    updated_count += 1
                    continue

                # Not found
                print(f"Player not found: {row['player_name']}")

        self.stdout.write(self.style.SUCCESS(f"Updated {updated_count} players."))
