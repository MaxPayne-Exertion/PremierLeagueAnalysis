import ScraperFC as sfc
import pandas as pd

seasons = [
    '15/16', '16/17', '17/18', '18/19', '19/20',
    '20/21', '21/22', '22/23', '23/24', '24/25'
]

def season_to_filename(season):
    year1, year2 = season.split('/')
    return f"{year1}_{year2}"

ss = sfc.Sofascore()

for season in seasons:
    print(f"\nProcessing season {season}...")
    
    try:
        df_gk = ss.scrape_player_league_stats(season, "England Premier League", "total", ["Goalkeepers"])
        df_gk['goalsConceded'] = df_gk['goalsConcededInsideTheBox'] + df_gk['goalsConcededOutsideTheBox']
        cols = df_gk.columns.tolist()
        inside_box_index = cols.index('goalsConcededInsideTheBox')
        cols.remove('goalsConceded')
        cols.insert(inside_box_index, 'goalsConceded')
        df_gk = df_gk[cols]
        df_gk['position'] = 'GK'
        
        df_def = ss.scrape_player_league_stats(season, "England Premier League", "total", ["Defenders"])
        df_def['goalsConcededInsideTheBox'] = 0
        df_def['goalsConcededOutsideTheBox'] = 0
        df_def['goalsConceded'] = df_def['goalsConcededInsideTheBox'] + df_def['goalsConcededOutsideTheBox']
        cols = df_def.columns.tolist()
        cols.remove('goalsConceded')
        cols.remove('goalsConcededInsideTheBox')
        cols.remove('goalsConcededOutsideTheBox')
        player_index = cols.index('player')
        cols.insert(player_index, 'goalsConcededOutsideTheBox')
        cols.insert(player_index, 'goalsConcededInsideTheBox')
        cols.insert(player_index, 'goalsConceded')
        df_def = df_def[cols]
        df_def['position'] = 'DF'
       
        df_mid = ss.scrape_player_league_stats(season, "England Premier League", "total", ["Midfielders"])
        df_mid['goalsConcededInsideTheBox'] = 0
        df_mid['goalsConcededOutsideTheBox'] = 0
        df_mid['goalsConceded'] = df_mid['goalsConcededInsideTheBox'] + df_mid['goalsConcededOutsideTheBox']
        cols = df_mid.columns.tolist()
        cols.remove('goalsConceded')
        cols.remove('goalsConcededInsideTheBox')
        cols.remove('goalsConcededOutsideTheBox')
        player_index = cols.index('player')
        cols.insert(player_index, 'goalsConcededOutsideTheBox')
        cols.insert(player_index, 'goalsConcededInsideTheBox')
        cols.insert(player_index, 'goalsConceded')
        df_mid = df_mid[cols]
        df_mid['position'] = 'MF'
      
        df_fwd = ss.scrape_player_league_stats(season, "England Premier League", "total", ["Forwards"])
        df_fwd['goalsConcededInsideTheBox'] = 0
        df_fwd['goalsConcededOutsideTheBox'] = 0
        df_fwd['goalsConceded'] = df_fwd['goalsConcededInsideTheBox'] + df_fwd['goalsConcededOutsideTheBox']
        cols = df_fwd.columns.tolist()
        cols.remove('goalsConceded')
        cols.remove('goalsConcededInsideTheBox')
        cols.remove('goalsConcededOutsideTheBox')
        player_index = cols.index('player')
        cols.insert(player_index, 'goalsConcededOutsideTheBox')
        cols.insert(player_index, 'goalsConcededInsideTheBox')
        cols.insert(player_index, 'goalsConceded')
        df_fwd = df_fwd[cols]
        df_fwd['position'] = 'FW'
   
        df_combined = pd.concat([df_gk, df_def, df_mid, df_fwd], ignore_index=True)

        filename = f"EPL_STATS_{season_to_filename(season)}.csv"
        
        df_combined.to_csv(f"backend/data/processed/{filename}", index=False)
        
        print(f"{filename} created successfully! Total players: {len(df_combined)}")
        
    except Exception as e:
        print(f"Error processing season {season}: {str(e)}")

print("\nAll seasons processed!")