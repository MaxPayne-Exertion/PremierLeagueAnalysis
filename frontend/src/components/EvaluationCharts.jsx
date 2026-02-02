import React from 'react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from 'recharts';

export const ComparisonRadar = ({ player, maxValues }) => {
    // Normalize data for radar chart using the actual Django model fields
    // Using per 90 minutes calculations (minutesPlayed / 90)
    const matchesPlayed = player.appearances || 1;
    const minutes90 = (player.minutesPlayed / 90) || 1;

    const data = [
        { 
            subject: 'Goals/90', 
            A: player.goals / minutes90, 
            fullMark: maxValues?.goalsper90 || 1 
        },
        { 
            subject: 'Assists/90', 
            A: player.assists / minutes90, 
            fullMark: maxValues?.assistsper90 || 1 
        },
        { 
            subject: 'xG/90', 
            A: player.expectedGoals / minutes90, 
            fullMark: maxValues?.xgper90 || 1 
        },
        { 
            subject: 'Key Passes', 
            A: player.keyPasses / minutes90, 
            fullMark: maxValues?.keyPassesper90 || 10 
        },
        { 
            subject: 'Successful Dribbles', 
            A: player.successfulDribbles / minutes90, 
            fullMark: maxValues?.dribblesper90 || 10 
        },
    ];

    return (
        <div className="glass-panel p-4 h-80 flex flex-col items-center">
            <h3 className="text-lg font-bold mb-2 header-accent">{player.name} Stats</h3>
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="#475569" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                    <Radar
                        name={player.name}
                        dataKey="A"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="#3b82f6"
                        fillOpacity={0.4}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc' }}
                        itemStyle={{ color: '#60a5fa' }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};

export const ClinicalityScatter = ({ teams }) => {
    return (
        <div className="glass-panel p-4 h-96">
            <h3 className="text-lg font-bold mb-4 header-accent">Clinicality: Goals vs xG</h3>
            <ResponsiveContainer width="100%" height="90%">
                <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                    <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                    <XAxis 
                        type="number" 
                        dataKey="xg_for" 
                        name="xG" 
                        stroke="#94a3b8" 
                        label={{ value: 'Expected Goals (xG)', position: 'bottom', fill: '#94a3b8' }} 
                    />
                    <YAxis 
                        type="number" 
                        dataKey="goals_for" 
                        name="Goals" 
                        stroke="#94a3b8" 
                        label={{ value: 'Actual Goals', angle: -90, position: 'left', fill: '#94a3b8' }} 
                    />
                    <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                    <div className="bg-slate-800 p-2 border border-slate-600 rounded">
                                        <p className="font-bold text-white">{data.team_name}</p>
                                        <p className="text-slate-300">Goals: {data.goals_for}</p>
                                        <p className="text-slate-300">xG: {data.xg_for.toFixed(2)}</p>
                                        <p className="text-slate-300">Difference: {(data.goals_for - data.xg_for).toFixed(2)}</p>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Scatter name="Teams" data={teams} fill="#8884d8">
                        {teams.map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={entry.goals_for > entry.xg_for ? '#22c55e' : '#ef4444'} 
                            />
                        ))}
                    </Scatter>
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
};