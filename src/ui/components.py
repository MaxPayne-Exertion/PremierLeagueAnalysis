import plotly.graph_objects as go
import streamlit as st
import pandas as pd

def render_plotly_radar(player_name, values, params, ranges=None):
    """
    Renders a radar chart using Plotly.
    Assumes values are normalized (0-1 or 0-100).
    """
    # Closure for radar
    values = values + [values[0]]
    params = params + [params[0]]
    
    fig = go.Figure()
    
    fig.add_trace(go.Scatterpolar(
        r=values,
        theta=params,
        fill='toself',
        name=player_name,
        line_color='#FF4B4B',
        fillcolor='rgba(255, 75, 75, 0.5)'
    ))
    
    fig.update_layout(
        polar=dict(
            radialaxis=dict(
                visible=True,
                range=[0, 1], # Assuming percentile ranks 0-1
                showticklabels=False,
                linecolor='#262730',
                gridcolor='#262730'
            ),
            bgcolor='#0E1117'
        ),
        showlegend=False,
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)',
        font=dict(color='#FAFAFA', size=12),
        margin=dict(l=40, r=40, t=40, b=40)
    )
    
    st.plotly_chart(fig, use_container_width=True)

def render_comparison_radar(player1_name, values1, player2_name, values2, params):
    """
    Renders a comparison radar chart with two players.
    """
    # Closure
    values1 = values1 + [values1[0]]
    values2 = values2 + [values2[0]]
    params = params + [params[0]]
    
    fig = go.Figure()
    
    # Player 1 Trace
    fig.add_trace(go.Scatterpolar(
        r=values1,
        theta=params,
        fill='toself',
        name=player1_name,
        line_color='#FF4B4B',
        fillcolor='rgba(255, 75, 75, 0.4)'
    ))
    
    # Player 2 Trace
    fig.add_trace(go.Scatterpolar(
        r=values2,
        theta=params,
        fill='toself',
        name=player2_name,
        line_color='#00BFFF', # Deep Blue/Cyan for contrast
        fillcolor='rgba(0, 191, 255, 0.4)'
    ))
    
    fig.update_layout(
        polar=dict(
            radialaxis=dict(
                visible=True,
                range=[0, 1],
                showticklabels=False,
                linecolor='#262730',
                gridcolor='#262730'
            ),
            bgcolor='#0E1117'
        ),
        showlegend=True,
        legend=dict(
            font=dict(color='#FAFAFA'),
            orientation="h",
            yanchor="bottom",
            y=1.02,
            xanchor="right",
            x=1
        ),
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)',
        font=dict(color='#FAFAFA', size=12),
        margin=dict(l=40, r=40, t=40, b=40)
    )
    
    st.plotly_chart(fig, use_container_width=True)
