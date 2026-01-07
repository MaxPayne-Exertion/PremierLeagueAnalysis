import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import sys
from pathlib import Path

# Add project root to sys.path
root_path = Path(__file__).resolve().parent.parent.parent
if str(root_path) not in sys.path:
    sys.path.insert(0, str(root_path))

from src.utils.db import db_client
from src.processing.cleaner import clean_player_data, normalize_per_90
from src.analysis.metrics import calculate_advanced_metrics
from src.ui.components import render_plotly_radar, render_comparison_radar

st.set_page_config(page_title="EPL Analytics", layout="wide")

# --- Data Loading ---
@st.cache_data(ttl=600)
def load_data(season):
    try:
        # Map season to filename
        file_map = {
            "2020-21": "EPL_20_21.csv",
            "2023-24": "EPL_23_24.csv"
        }
        
        filename = file_map.get(season)
        if not filename:
             return pd.DataFrame(), pd.DataFrame()

        csv_path = Path(__file__).resolve().parent.parent.parent / "data" / "processed" / filename
        
        if csv_path.exists():
            df = pd.read_csv(csv_path)
            
            # Define mappings based on season
            if season == "2020-21":
                column_mapping = {
                    "Name": "name",
                    "Club": "team",
                    "Nationality": "nationality",
                    "Position": "position",
                    "Age": "age",
                    "Matches": "matches",
                    "Starts": "starts",
                    "Mins": "minutes_played",
                    "Goals": "goals",
                    "Assists": "assists",
                    "Passes_Attempted": "passes_attempted",
                    "Perc_Passes_Completed": "pass_completion_rate",
                    "Penalty_Goals": "penalties_scored",
                    "Penalty_Attempted": "penalties_attempted",
                    "xG": "xg",
                    "xA": "xag",
                    "Yellow_Cards": "yellow_cards",
                    "Red_Cards": "red_cards"
                }
            elif season == "2023-24":
                column_mapping = {
                    "Player": "name",
                    "Team": "team",
                    "Nation": "nationality",
                    "Pos": "position",
                    "Age": "age",
                    "MP": "matches",
                    "Starts": "starts",
                    "Min": "minutes_played",
                    "Gls": "goals",
                    "Ast": "assists",
                    # "Passes_Attempted": "passes_attempted", # Missing in this export
                    # "Perc_Passes_Completed": "pass_completion_rate", # Missing
                    "PK": "penalties_scored",
                    "PKatt": "penalties_attempted",
                    "xG": "xg",
                    "xAG": "xag", # Note xAG vs xA
                    "CrdY": "yellow_cards",
                    "CrdR": "red_cards",
                    "PrgC": "progressive_carries",
                    "PrgP": "progressive_passes"
                }
            
            df = df.rename(columns=column_mapping)
            
            # Ensure missing columns exist (handle differences)
            required_cols = ['progressive_carries', 'progressive_passes', 'passes_attempted', 'pass_completion_rate']
            for col in required_cols:
                if col not in df.columns:
                    df[col] = 0.0 # Fill missing data with 0
            
            # Clean Nationality for 23-24 (often 'eng ENG')
            if season == "2023-24" and 'nationality' in df.columns:
                 df['nationality'] = df['nationality'].apply(lambda x: x.split()[-1] if isinstance(x, str) else x)

            # Normalize and Calculate Metrics
            df = normalize_per_90(df, ['goals', 'assists', 'progressive_carries', 'progressive_passes', 'xg', 'xag'])
            df = calculate_advanced_metrics(df)
            
            # Create Teams DataFrame Aggregation
            df_teams = df.groupby('team').agg({
                'goals': 'sum',
                'xg': 'sum',
                'assists': 'sum',
                'passes_attempted': 'sum',
                'pass_completion_rate': 'mean' 
            }).reset_index()
            
            # Mocking other team stats for correlation heatmap to work roughly
            df_teams['goals_for'] = df_teams['goals']
            df_teams['xg_for'] = df_teams['xg']
            # These are unknown from just player stats, mocking zeroes or deriving
            df_teams['goals_against'] = 0 
            df_teams['xg_against'] = 0
            df_teams['points'] = 0
            
            return df, df_teams
        
        return pd.DataFrame(), pd.DataFrame()
        
    except Exception as e:
        st.error(f"Error loading data: {e}")
        return pd.DataFrame(), pd.DataFrame()

# --- Main App ---
# --- Main App ---
def main():
    # CSS Injection for Dark Theme Customizations
    st.markdown("""
        <style>
        /* Sidebar styling */
        .stSidebar .css-1d391kg {
            background-color: #0e1117;
        }
        /* Card-like styling for metrics */
        .metric-card {
            background-color: #262730;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 10px;
        }
        /* Custom Headers */
        h1, h2, h3 {
            color: #FAFAFA;
            font-family: 'sans-serif';
        }
        /* Profile List Styling */
        .profile-item {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #262730;
            padding: 5px 0;
            font-size: 14px;
        }
        .profile-label { color: #aaaaaa; font-weight: 500; }
        .profile-value { color: #fafafa; font-weight: bold; text-align: right; }
        </style>
    """, unsafe_allow_html=True)

    # Sidebar
    with st.sidebar:
        st.image("https://upload.wikimedia.org/wikipedia/en/f/f2/Premier_League_Logo.svg", width=80)
        st.title("EPL Analytics")
        
        # Season Selector
        season = st.selectbox("Season", ["2023-24", "2020-21"], key="season_select")
        
        st.divider()
        
        # Navigation
        page = st.radio("Navigation", ["Standings", "Statistics", "Details", "Comparison"], label_visibility="collapsed")
        
        st.divider()
        st.write("© 2024 EPL Analytics")

    # Load Data
    df_players, df_teams = load_data(season)

    if df_players.empty:
        st.error("No data loaded. Please check data source.")
        return

    # Header
    st.title(f"Premier League {season}")
    st.markdown("Your Ultimate Football Companion")

    # Router
    if page == "Standings":
        render_standings(df_teams)
    elif page == "Statistics":
        render_statistics(df_players, df_teams)
    elif page == "Details":
        render_details(df_players)
    elif page == "Comparison":
        render_comparison(df_players)

def display_player_profile_list(stats):
    """Render the vertical list of player stats."""
    details_fields = ["name", "team", "nationality", "position", "age", "matches", "starts", "minutes_played", "goals", "assists", "passes_attempted", "yellow_cards", "red_cards"]
    display_labels = ["Name", "Club", "Nationality", "Position", "Age", "Matches", "Starts", "Minutes", "Goals", "Assists", "Passes", "Yellow Cards", "Red Cards"]
    
    st.markdown("### Player Profile")
    st.markdown('<div style="background-color: #15171e; padding: 15px; border-radius: 8px;">', unsafe_allow_html=True)
    for label, field in zip(display_labels, details_fields):
        if field in stats:
            val = stats[field]
            if isinstance(val, float):
                val = f"{val:.2f}" if val % 1 != 0 else int(val)
            st.markdown(f'<div class="profile-item"><span class="profile-label">{label}</span><span class="profile-value">{val}</span></div>', unsafe_allow_html=True)
    st.markdown('</div>', unsafe_allow_html=True)

def render_comparison(df_players):
    st.subheader("Player Comparison")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("### Player 1")
        team1 = st.selectbox("Select Team 1", sorted(df_players['team'].unique()), key="team1")
        players1 = df_players[df_players['team'] == team1]
        player1 = st.selectbox("Select Player 1", sorted(players1['name']), key="p1")
        
    with col2:
        st.markdown("### Player 2")
        team2 = st.selectbox("Select Team 2", sorted(df_players['team'].unique()), key="team2")
        players2 = df_players[df_players['team'] == team2]
        player2 = st.selectbox("Select Player 2", sorted(players2['name']), key="p2")

    if player1 and player2:
        p1_stats = df_players[df_players['name'] == player1].iloc[0]
        p2_stats = df_players[df_players['name'] == player2].iloc[0]
        
        with col1:
            display_player_profile_list(p1_stats)
                
        with col2:
            display_player_profile_list(p2_stats)
        
        # Radar Chart Params
        params = ["goals_per90", "assists_per90", "xg_per90", "xag_per90", "pass_completion_rate"]
        
        # Calculate Percentiles for both
        values1 = []
        values2 = []
        
        for param in params:
            metric_series = df_players[param]
            rank1 = metric_series.rank(pct=True)[df_players['name'] == player1].values[0]
            values1.append(rank1)
            
            rank2 = metric_series.rank(pct=True)[df_players['name'] == player2].values[0]
            values2.append(rank2)
            
        display_params = [p.replace('_per90', '').replace('_', ' ').title() for p in params]
        display_params = [p.replace('Perc ', '').replace('Completed', '%') for p in display_params]

        render_comparison_radar(player1, values1, player2, values2, display_params)
        
        # Comparison Table
        st.divider()
        st.markdown("### Head-to-Head Stats")
        
        comp_df = pd.DataFrame({
            "Metric": display_params,
            player1: [p1_stats[p] for p in params],
            player2: [p2_stats[p] for p in params]
        })
        
        # Format formatting for better display
        # Note: pass_completion_rate is likely 0-100 or 0-1 depending on data. In dashboard load it was treated.
        
        st.table(comp_df.set_index("Metric"))

def render_standings(df_teams):
    st.subheader("League Standings")
    if not df_teams.empty:
        # Create a display table with necessary columns
        # Mocking points/played if missing for display purposes logic
        display_df = df_teams.copy()
        if 'points' not in display_df.columns:
            display_df['points'] = 0
        
        # Sort by points (desc) then goal difference (mock logic)
        display_df = display_df.sort_values(by=['points', 'goals'], ascending=False).reset_index(drop=True)
        display_df.index = display_df.index + 1 # Rank 1-indexed
        
        columns_to_show = ['team', 'matches', 'goals', 'xg', 'assists', 'points']
        # Rename for cleaner display
        display_df = display_df.rename(columns={
            'team': 'Club', 'matches': 'MP', 'goals': 'GF', 'xg': 'xG', 'assists': 'Ast', 'points': 'Pts'
        })
        
        st.dataframe(
            display_df[[c for c in ['Club', 'MP', 'GF', 'xG', 'Ast', 'Pts'] if c in display_df.columns]],
            use_container_width=True,
            height=600
        )

def render_statistics(df_players, df_teams):
    st.subheader("Season Statistics")
    
    col1, col2, col3 = st.columns(3)
    
    # Top Scorer
    top_scorer = df_players.sort_values(by='goals', ascending=False).iloc[0]
    with col1:
        st.markdown(f"""
        <div class="metric-card">
            <h3>Top Scorer</h3>
            <h2>{top_scorer['name']}</h2>
            <p>{top_scorer['team']}</p>
            <h1>{int(top_scorer['goals'])} Goals</h1>
        </div>
        """, unsafe_allow_html=True)
        
    # Top Assister
    top_assister = df_players.sort_values(by='assists', ascending=False).iloc[0]
    with col2:
        st.markdown(f"""
        <div class="metric-card">
            <h3>Top Playmaker</h3>
            <h2>{top_assister['name']}</h2>
            <p>{top_assister['team']}</p>
            <h1>{int(top_assister['assists'])} Assists</h1>
        </div>
        """, unsafe_allow_html=True)
        
    # Top xG Performer
    top_xg = df_players.sort_values(by='xg', ascending=False).iloc[0]
    with col3:
        st.markdown(f"""
        <div class="metric-card">
            <h3>Highest xG</h3>
            <h2>{top_xg['name']}</h2>
            <p>{top_xg['team']}</p>
            <h1>{top_xg['xg']:.2f} xG</h1>
        </div>
        """, unsafe_allow_html=True)

    st.divider()
    
    st.subheader("Team Goals vs xG")
    if not df_teams.empty:
         # Add identity line (x=y) to show over/under performance
         max_val = max(df_teams['xg_for'].max(), df_teams['goals_for'].max())
         
         fig = px.scatter(df_teams, x='xg_for', y='goals_for', text='team', 
                          title="Finishing Performance (Goals vs Expected)",
                          labels={'xg_for': 'Expected Goals (xG)', 'goals_for': 'Actual Goals'},
                          hover_data=['team', 'goals_for', 'xg_for'])
         
         fig.add_shape(type="line",
            x0=0, y0=0, x1=max_val, y1=max_val,
            line=dict(color="gray", dash="dash"),
            layer='below'
         )
         
         fig.update_traces(textposition='top center', marker=dict(size=12, color='#FF4B4B', line=dict(width=2, color='DarkSlateGrey')))
         fig.update_layout(
             plot_bgcolor='rgba(0,0,0,0)',
             paper_bgcolor='rgba(0,0,0,0)',
             font=dict(color='#FAFAFA'),
             xaxis=dict(showgrid=False, zeroline=False, title="Expected Goals (xG)"),
             yaxis=dict(showgrid=False, zeroline=False, title="Actual Goals")
         )
         
         st.plotly_chart(fig, use_container_width=True)

def render_details(df_players):
    st.subheader("Player Analysis")
    
    col1, col2 = st.columns([1, 2])
    with col1:
        # Filter filters
        selected_team = st.selectbox("Select Team", sorted(df_players['team'].unique()))
        team_players = df_players[df_players['team'] == selected_team]
        selected_player = st.selectbox("Select Player", sorted(team_players['name']))
        
        if selected_player:
            player_stats = df_players[df_players['name'] == selected_player].iloc[0]
            st.divider()
            display_player_profile_list(player_stats)
        
    with col2:
        if selected_player:
            player_stats = df_players[df_players['name'] == selected_player].iloc[0]
            
            st.markdown(f"## {selected_player}")
            st.markdown(f"**Position:** {player_stats['position']} | **Age:** {player_stats['age']} | **Minutes:** {player_stats['minutes_played']}")
            
            # Radar Chart Params
            params = ["goals_per90", "assists_per90", "xg_per90", "xag_per90", "pass_completion_rate"]
            
            # --- Percentile Calculation for Normalization ---
            # We calculate the percentile rank of the selected player against ALL players in the dataset
            # This ensures the chart is not skewed by outliers and is normalized 0-1
            values = []
            for param in params:
                # Calculate percentile rank (0 to 1)
                metric_series = df_players[param]
                rank = metric_series.rank(pct=True)[df_players['name'] == selected_player].values[0]
                values.append(rank)
            
            # Clean up param names for display
            display_params = [p.replace('_per90', '').replace('_', ' ').title() for p in params]
            display_params = [p.replace('Perc ', '').replace('Completed', '%') for p in display_params] # Special fix for pass completion
            
            render_plotly_radar(selected_player, values, display_params)

if __name__ == "__main__":
    main()
