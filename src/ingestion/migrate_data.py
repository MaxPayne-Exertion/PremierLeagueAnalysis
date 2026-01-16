from pymongo import MongoClient
import json
import os
import sys
from pathlib import Path

# Add project root to sys.path
project_root = str(Path(__file__).resolve().parent.parent.parent)
if project_root not in sys.path:
    sys.path.append(project_root)

from src.utils.db import db_client

def backup_data(filename="/tmp/epl_raw_backup.json"):
    print(f"Backing up data from current MongoDB to {filename}...")
    raw_col = db_client.get_collection("raw")
    data = list(raw_col.find({}, {"_id": 0}))
    
    with open(filename, "w") as f:
        json.dump(data, f)
    print(f"Successfully backed up {len(data)} documents.")

def restore_data(filename="/tmp/epl_raw_backup.json"):
    print(f"Restoring data from {filename} to new MongoDB storage...")
    if not os.path.exists(filename):
        print(f"Error: Backup file {filename} not found.")
        return

    with open(filename, "r") as f:
        data = json.load(f)

    if not data:
        print("No data to restore.")
        return

    from pymongo import UpdateOne
    raw_col = db_client.get_collection("raw")
    
    operations = []
    for doc in data:
        # Use a combination of fields to identify the document for upsert
        if doc["type"] == "team":
            filter_query = {"type": "team", "season": doc["season"], "team_id": doc["team_id"]}
        else:
            filter_query = {"type": "player", "season": doc["season"], "player_id": doc["player_id"]}
        
        operations.append(UpdateOne(filter_query, {"$set": doc}, upsert=True))

    if operations:
        result = raw_col.bulk_write(operations)
        print(f"Restored: {result.upserted_count} new, {result.modified_count} updated.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 migrate_data.py [backup|restore]")
        sys.exit(1)
    
    cmd = sys.argv[1]
    if cmd == "backup":
        backup_data()
    elif cmd == "restore":
        restore_data()
    else:
        print(f"Unknown command: {cmd}")
