import React from 'react';
import Plot from 'react-plotly.js';

export const PlotlyRadar = ({ player, showTitle = true }) => {
    if (!player) return null;
    const metrics = [
        { label: 'Goals', key: 'goals', max: 30 },
        { label: 'Assists', key: 'assists', max: 20 },
        { label: 'xG', key: 'xg', max: 30 },
        { label: 'Prg. Carries', key: 'progressive_carries', max: 150 },
        { label: 'Prg. Passes', key: 'progressive_passes', max: 150 },
    ];

    const values = metrics.map(m => Math.min((player[m.key] || 0) / m.max * 100, 100));
    const labels = metrics.map(m => m.label);

    // Close the loop
    const plotValues = [...values, values[0]];
    const plotLabels = [...labels, labels[0]];

    return (
        <div className="glass-panel p-4 flex flex-col items-center justify-center">
            {showTitle && <h3 className="text-lg font-bold mb-2 header-accent">{player.name}</h3>}
            <Plot
                data={[
                    {
                        type: 'scatterpolar',
                        r: plotValues,
                        theta: plotLabels,
                        fill: 'toself',
                        name: player.name,
                        line: { color: '#3b82f6' },
                        fillcolor: 'rgba(59, 130, 246, 0.3)'
                    },
                ]}
                layout={{
                    width: 320,
                    height: 320,
                    paper_bgcolor: 'rgba(0,0,0,0)',
                    plot_bgcolor: 'rgba(0,0,0,0)',
                    font: { color: '#cbd5e1' },
                    polar: {
                        radialaxis: {
                            visible: true,
                            range: [0, 100],
                            showticklabels: false,
                            gridcolor: '#475569'
                        },
                        angularaxis: {
                            gridcolor: '#475569',
                            linecolor: '#475569'
                        },
                        bgcolor: 'rgba(0,0,0,0)'
                    },
                    margin: { l: 30, r: 30, t: 30, b: 30 },
                    showlegend: false
                }}
                config={{ displayModeBar: false }}
            />
        </div>
    );
};

export const PlotlyComparisonRadar = ({ data, player1Name, player2Name }) => {
    if (!data || data.length === 0) return null;

    // Extract labels and values from data
    const labels = data.map(d => d.subject);
    const plotLabels = [...labels, labels[0]]; // Close the loop

    const player1Values = data.map(d => d.A);
    const player2Values = data.map(d => d.B);

    const plotData = [];

    // Add player 1 trace
    if (player1Values.some(v => v > 0)) {
        plotData.push({
            type: 'scatterpolar',
            r: [...player1Values, player1Values[0]],
            theta: plotLabels,
            fill: 'toself',
            name: player1Name,
            line: { color: '#3b82f6', width: 2 },
            fillcolor: 'rgba(59, 130, 246, 0.3)'
        });
    }

    // Add player 2 trace
    if (player2Values.some(v => v > 0)) {
        plotData.push({
            type: 'scatterpolar',
            r: [...player2Values, player2Values[0]],
            theta: plotLabels,
            fill: 'toself',
            name: player2Name,
            line: { color: '#ef4444', width: 2 },
            fillcolor: 'rgba(239, 68, 68, 0.3)'
        });
    }

    return (
        <div className="flex justify-center">
            <Plot
                data={plotData}
                layout={{
                    width: 500,
                    height: 450,
                    paper_bgcolor: 'rgba(0,0,0,0)',
                    plot_bgcolor: 'rgba(0,0,0,0)',
                    font: { color: '#cbd5e1', size: 12 },
                    polar: {
                        radialaxis: {
                            visible: true,
                            range: [0, 100],
                            showticklabels: false,
                            gridcolor: '#475569'
                        },
                        angularaxis: {
                            gridcolor: '#475569',
                            linecolor: '#475569'
                        },
                        bgcolor: 'rgba(0,0,0,0)'
                    },
                    margin: { l: 80, r: 80, t: 40, b: 40 },
                    legend: {
                        orientation: 'h',
                        y: -0.15,
                        x: 0.5,
                        xanchor: 'center',
                        font: { color: '#cbd5e1', size: 12 }
                    }
                }}
                config={{ displayModeBar: false }}
            />
        </div>
    );
};
