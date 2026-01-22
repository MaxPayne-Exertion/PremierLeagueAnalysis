import csv
from django.core.management.base import BaseCommand
from django.db.models import Q
from api.models import Player
import unicodedata

def normalize_name(name):
    # remove accents for easier matching
    return unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode("ascii").lower().strip()

class Command(BaseCommand):
    help = "Backfill sofascore_id from CSV"

    def handle(self, *args, **options):
        csv_file = "data/processed/PLAYERS_ID_23_24.csv"
        updated_count = 0

        with open(csv_file, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                csv_name = normalize_name(row["player_name"])
                sofascore_id = row["player_id"].strip()

                # Find all players in season that roughly match the name
                players = Player.objects.filter(season="2023-24")
                players = [p for p in players if normalize_name(p.name) == csv_name]

                if not players:
                    print(f"Player not found: {row['player_name']}")
                    continue

                for p in players:
                    p.sofascore_id = sofascore_id
                    p.save()
                    updated_count += 1

        self.stdout.write(self.style.SUCCESS(f"Updated {updated_count} players."))
