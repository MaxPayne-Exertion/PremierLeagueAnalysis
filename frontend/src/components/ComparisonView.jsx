import React, { useState, useMemo } from 'react';
import { Search, TrendingUp, TrendingDown, Award, Activity } from 'lucide-react';
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, AreaChart, Area, ScatterChart, Scatter, Cell,
    PieChart, Pie
} from 'recharts';

const ComparisonView = ({ players, teams }) => {
    const [player1Search, setPlayer1Search] = useState('');
    const [player2Search, setPlayer2Search] = useState('');
    const [player1Id, setPlayer1Id] = useState('');
    const [player2Id, setPlayer2Id] = useState('');
    const [showPlayer1Dropdown, setShowPlayer1Dropdown] = useState(false);
    const [showPlayer2Dropdown, setShowPlayer2Dropdown] = useState(false);
    const [comparisonType, setComparisonType] = useState('offensive');

    const p1 = players.find(p => (p.id || p.player_id) == player1Id);
    const p2 = players.find(p => (p.id || p.player_id) == player2Id);

    // Filter players based on search
    const filteredPlayers1 = useMemo(() => {
        if (!player1Search) return players.slice(0, 50);
        return players.filter(p =>
            p.name.toLowerCase().includes(player1Search.toLowerCase()) ||
            (p.team_name && p.team_name.toLowerCase().includes(player1Search.toLowerCase()))
        ).slice(0, 50);
    }, [players, player1Search]);

    const filteredPlayers2 = useMemo(() => {
        if (!player2Search) return players.slice(0, 50);
        return players.filter(p =>
            p.name.toLowerCase().includes(player2Search.toLowerCase()) ||
            (p.team_name && p.team_name.toLowerCase().includes(player2Search.toLowerCase()))
        ).slice(0, 50);
    }, [players, player2Search]);

    // Define metrics for each comparison type
    const metricsByType = {
        offensive: [
            { label: 'Goals', key: 'goals' },
            { label: 'Assists', key: 'assists' },
            { label: 'xG', key: 'expectedGoals' },
            { label: 'Shots on Target', key: 'shotsOnTarget' },
            { label: 'Key Passes', key: 'keyPasses' },
            { label: 'Dribbles', key: 'successfulDribbles' },
        ],
        defensive: [
            { label: 'Tackles', key: 'tackles' },
            { label: 'Interceptions', key: 'interceptions' },
            { label: 'Clearances', key: 'clearances' },
            { label: 'Duels Won', key: 'totalDuelsWon' },
            { label: 'Aerial Duels', key: 'aerialDuelsWon' },
        ],
        goalkeeping: [
            { label: 'Saves', key: 'saves' },
            { label: 'Goals Conceded', key: 'goalsConceded' },
            { label: 'High Claims', key: 'highClaims' },
            { label: 'Punches', key: 'punches' },
            { label: 'Runs Out', key: 'runsOut' },
        ],
    };

    // Prepare normalized radar data
    const radarData = useMemo(() => {
        if (!p1 && !p2) return [];

        const metrics = metricsByType[comparisonType];

        return metrics.map(metric => {
            const values = players.map(p => parseFloat(p[metric.key]) || 0).filter(v => v > 0);
            const min = values.length > 0 ? Math.min(...values) : 0;
            const max = values.length > 0 ? Math.max(...values) : 1;

            const normalizeValue = (val) => {
                if (max === min) return 50;
                return ((val - min) / (max - min)) * 100;
            };

            return {
                subject: metric.label,
                fullMark: 100,
                player1: p1 ? normalizeValue(parseFloat(p1[metric.key]) || 0) : 0,
                player2: p2 ? normalizeValue(parseFloat(p2[metric.key]) || 0) : 0,
                val1: p1 ? (parseFloat(p1[metric.key]) || 0) : 0,
                val2: p2 ? (parseFloat(p2[metric.key]) || 0) : 0,
            };
        });
    }, [p1, p2, players, comparisonType]);

    // Head-to-head bar chart data
    const barChartData = useMemo(() => {
        if (!p1 || !p2) return [];
        
        const metrics = comparisonType === 'offensive' 
            ? [
                { name: 'Goals', p1: p1.goals || 0, p2: p2.goals || 0 },
                { name: 'Assists', p1: p1.assists || 0, p2: p2.assists || 0 },
                { name: 'xG', p1: parseFloat(p1.expectedGoals || 0), p2: parseFloat(p2.expectedGoals || 0) },
                { name: 'Shots on Target', p1: p1.shotsOnTarget || 0, p2: p2.shotsOnTarget || 0 },
                { name: 'Key Passes', p1: p1.keyPasses || 0, p2: p2.keyPasses || 0 },
                { name: 'Dribbles', p1: p1.successfulDribbles || 0, p2: p2.successfulDribbles || 0 },
            ]
            : comparisonType === 'defensive'
            ? [
                { name: 'Tackles', p1: p1.tackles || 0, p2: p2.tackles || 0 },
                { name: 'Interceptions', p1: p1.interceptions || 0, p2: p2.interceptions || 0 },
                { name: 'Clearances', p1: p1.clearances || 0, p2: p2.clearances || 0 },
                { name: 'Duels Won', p1: p1.totalDuelsWon || 0, p2: p2.totalDuelsWon || 0 },
                { name: 'Aerial Duels', p1: p1.aerialDuelsWon || 0, p2: p2.aerialDuelsWon || 0 },
            ]
            : [
                { name: 'Saves', p1: p1.saves || 0, p2: p2.saves || 0 },
                { name: 'High Claims', p1: p1.highClaims || 0, p2: p2.highClaims || 0 },
                { name: 'Punches', p1: p1.punches || 0, p2: p2.punches || 0 },
                { name: 'Runs Out', p1: p1.runsOut || 0, p2: p2.runsOut || 0 },
            ];

        return metrics;
    }, [p1, p2, comparisonType]);

    // Per 90 minutes comparison
    const per90Data = useMemo(() => {
        if (!p1 || !p2) return [];
        
        const calc90 = (player, stat) => {
            const minutes = player.minutesPlayed || 1;
            return ((stat / minutes) * 90).toFixed(2);
        };

        if (comparisonType === 'offensive') {
            return [
                { stat: 'Goals/90', player1: parseFloat(calc90(p1, p1.goals || 0)), player2: parseFloat(calc90(p2, p2.goals || 0)) },
                { stat: 'Assists/90', player1: parseFloat(calc90(p1, p1.assists || 0)), player2: parseFloat(calc90(p2, p2.assists || 0)) },
                { stat: 'xG/90', player1: parseFloat(calc90(p1, p1.expectedGoals || 0)), player2: parseFloat(calc90(p2, p2.expectedGoals || 0)) },
                { stat: 'Shots/90', player1: parseFloat(calc90(p1, p1.totalShots || 0)), player2: parseFloat(calc90(p2, p2.totalShots || 0)) },
            ];
        } else if (comparisonType === 'defensive') {
            return [
                { stat: 'Tackles/90', player1: parseFloat(calc90(p1, p1.tackles || 0)), player2: parseFloat(calc90(p2, p2.tackles || 0)) },
                { stat: 'Interceptions/90', player1: parseFloat(calc90(p1, p1.interceptions || 0)), player2: parseFloat(calc90(p2, p2.interceptions || 0)) },
                { stat: 'Clearances/90', player1: parseFloat(calc90(p1, p1.clearances || 0)), player2: parseFloat(calc90(p2, p2.clearances || 0)) },
                { stat: 'Duels Won/90', player1: parseFloat(calc90(p1, p1.totalDuelsWon || 0)), player2: parseFloat(calc90(p2, p2.totalDuelsWon || 0)) },
            ];
        } else {
            return [
                { stat: 'Saves/90', player1: parseFloat(calc90(p1, p1.saves || 0)), player2: parseFloat(calc90(p2, p2.saves || 0)) },
                { stat: 'Claims/90', player1: parseFloat(calc90(p1, p1.highClaims || 0)), player2: parseFloat(calc90(p2, p2.highClaims || 0)) },
                { stat: 'Runs Out/90', player1: parseFloat(calc90(p1, p1.runsOut || 0)), player2: parseFloat(calc90(p2, p2.runsOut || 0)) },
            ];
        }
    }, [p1, p2, comparisonType]);

    // Efficiency metrics (percentages)
    const efficiencyData = useMemo(() => {
        if (!p1 || !p2) return [];

        if (comparisonType === 'offensive') {
            return [
                { 
                    name: 'Shot Accuracy', 
                    player1: p1.totalShots ? ((p1.shotsOnTarget / p1.totalShots) * 100) : 0,
                    player2: p2.totalShots ? ((p2.shotsOnTarget / p2.totalShots) * 100) : 0
                },
                { 
                    name: 'Goal Conversion', 
                    player1: parseFloat(p1.goalConversionPercentage || 0),
                    player2: parseFloat(p2.goalConversionPercentage || 0)
                },
                { 
                    name: 'Dribble Success', 
                    player1: parseFloat(p1.successfulDribblesPercentage || 0),
                    player2: parseFloat(p2.successfulDribblesPercentage || 0)
                },
                { 
                    name: 'Pass Accuracy', 
                    player1: parseFloat(p1.accuratePassesPercentage || 0),
                    player2: parseFloat(p2.accuratePassesPercentage || 0)
                },
            ];
        } else if (comparisonType === 'defensive') {
            return [
                { 
                    name: 'Total Duels Won %', 
                    player1: parseFloat(p1.totalDuelsWonPercentage || 0),
                    player2: parseFloat(p2.totalDuelsWonPercentage || 0)
                },
                { 
                    name: 'Aerial Duels Won %', 
                    player1: parseFloat(p1.aerialDuelsWonPercentage || 0),
                    player2: parseFloat(p2.aerialDuelsWonPercentage || 0)
                },
                { 
                    name: 'Ground Duels Won %', 
                    player1: parseFloat(p1.groundDuelsWonPercentage || 0),
                    player2: parseFloat(p2.groundDuelsWonPercentage || 0)
                },
            ];
        } else {
            const p1SavePercentage = p1.saves && p1.goalsConceded 
                ? ((p1.saves / (p1.saves + p1.goalsConceded)) * 100) 
                : 0;
            const p2SavePercentage = p2.saves && p2.goalsConceded 
                ? ((p2.saves / (p2.saves + p2.goalsConceded)) * 100) 
                : 0;
            
            return [
                { 
                    name: 'Save %', 
                    player1: p1SavePercentage,
                    player2: p2SavePercentage
                },
                { 
                    name: 'Successful Runs Out %', 
                    player1: p1.runsOut ? ((p1.successfulRunsOut / p1.runsOut) * 100) : 0,
                    player2: p2.runsOut ? ((p2.successfulRunsOut / p2.runsOut) * 100) : 0
                },
            ];
        }
    }, [p1, p2, comparisonType]);

    // Win indicators
    const getWinIndicator = (val1, val2, lowerIsBetter = false) => {
        if (val1 === val2) return 'draw';
        if (lowerIsBetter) {
            return val1 < val2 ? 'p1' : 'p2';
        }
        return val1 > val2 ? 'p1' : 'p2';
    };

    const selectPlayer1 = (player) => {
        setPlayer1Id(player.id || player.player_id);
        setPlayer1Search(player.name);
        setShowPlayer1Dropdown(false);
    };

    const selectPlayer2 = (player) => {
        setPlayer2Id(player.id || player.player_id);
        setPlayer2Search(player.name);
        setShowPlayer2Dropdown(false);
    };

    const PlayerImage = ({ player, className = '' }) => {
        const imageUrl = player?.image_url || (player?.player_id 
            ? `https://img.sofascore.com/api/v1/player/${player.player_id}/image`
            : null);

        return (
            <div className={`flex-shrink-0 ${className}`}>
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={player?.name}
                        className="w-full h-full object-cover rounded-full border-2 border-blue-500"
                        loading="lazy"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                ) : null}
                <div 
                    className={`${imageUrl ? 'hidden' : 'flex'} w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 rounded-full items-center justify-center text-white font-bold text-2xl`}
                    style={{ display: imageUrl ? 'none' : 'flex' }}
                >
                    {((player?.name || 'U')[0]).toUpperCase()}
                </div>
            </div>
        );
    };

    return (
        <div className="animate-fade-in">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-6">
                Player Comparison Arena
            </h2>

            {/* Comparison Type Selector */}
            <div className="flex gap-2 mb-8 flex-wrap">
                <button
                    onClick={() => setComparisonType('offensive')}
                    className={`px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 ${
                        comparisonType === 'offensive'
                            ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/50'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                >
                    ⚽ Offensive
                </button>
                <button
                    onClick={() => setComparisonType('defensive')}
                    className={`px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 ${
                        comparisonType === 'defensive'
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/50'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                >
                    🛡️ Defensive
                </button>
                <button
                    onClick={() => setComparisonType('goalkeeping')}
                    className={`px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 ${
                        comparisonType === 'goalkeeping'
                            ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg shadow-yellow-500/50'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                >
                    🧤 Goalkeeping
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Player 1 Selector */}
                <div className="bg-gradient-to-br from-blue-900/50 to-slate-800/50 border-2 border-blue-500/30 rounded-xl p-6 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                        <h3 className="text-lg uppercase text-blue-400 font-bold tracking-wide">Player 1</h3>
                    </div>
                    <div className="relative">
                        <div className="relative">
                            <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search player..."
                                className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                value={player1Search}
                                onChange={(e) => {
                                    setPlayer1Search(e.target.value);
                                    setShowPlayer1Dropdown(true);
                                }}
                                onFocus={() => setShowPlayer1Dropdown(true)}
                                onBlur={() => setTimeout(() => setShowPlayer1Dropdown(false), 200)}
                            />
                        </div>
                        {showPlayer1Dropdown && (
                            <div className="absolute z-50 w-full mt-2 max-h-64 overflow-y-auto bg-slate-900 border border-slate-700 rounded-lg shadow-xl">
                                {filteredPlayers1.map(player => (
                                    <div
                                        key={player.id || player.player_id}
                                        className="p-3 hover:bg-slate-800 cursor-pointer transition-colors border-b border-slate-800 last:border-b-0"
                                        onClick={() => selectPlayer1(player)}
                                    >
                                        <div className="font-semibold text-white">{player.name}</div>
                                        <div className="text-xs text-slate-400">
                                            {player.team_name || 'Unknown Team'} • {player.position}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {p1 && (
                        <div className="mt-6 p-4 bg-slate-900/70 rounded-lg border border-blue-500/30">
                            <div className="flex items-center gap-4 mb-4">
                                <PlayerImage player={p1} className="w-20 h-20" />
                                <div className="flex-1">
                                    <h4 className="text-xl font-bold text-white">{p1.name}</h4>
                                    <p className="text-sm text-blue-300">{p1.team_name || 'Unknown Team'}</p>
                                    <p className="text-xs text-slate-400 mt-1">{p1.position}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-800/50 p-3 rounded-lg">
                                    <div className="text-xs text-slate-400 mb-1">Appearances</div>
                                    <div className="text-2xl font-bold text-blue-400">{p1.appearances || 0}</div>
                                </div>
                                <div className="bg-slate-800/50 p-3 rounded-lg">
                                    <div className="text-xs text-slate-400 mb-1">Minutes</div>
                                    <div className="text-2xl font-bold text-blue-400">{p1.minutesPlayed || 0}'</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Player 2 Selector */}
                <div className="bg-gradient-to-br from-red-900/50 to-slate-800/50 border-2 border-red-500/30 rounded-xl p-6 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <h3 className="text-lg uppercase text-red-400 font-bold tracking-wide">Player 2</h3>
                    </div>
                    <div className="relative">
                        <div className="relative">
                            <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search player..."
                                className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                value={player2Search}
                                onChange={(e) => {
                                    setPlayer2Search(e.target.value);
                                    setShowPlayer2Dropdown(true);
                                }}
                                onFocus={() => setShowPlayer2Dropdown(true)}
                                onBlur={() => setTimeout(() => setShowPlayer2Dropdown(false), 200)}
                            />
                        </div>
                        {showPlayer2Dropdown && (
                            <div className="absolute z-50 w-full mt-2 max-h-64 overflow-y-auto bg-slate-900 border border-slate-700 rounded-lg shadow-xl">
                                {filteredPlayers2.map(player => (
                                    <div
                                        key={player.id || player.player_id}
                                        className="p-3 hover:bg-slate-800 cursor-pointer transition-colors border-b border-slate-800 last:border-b-0"
                                        onClick={() => selectPlayer2(player)}
                                    >
                                        <div className="font-semibold text-white">{player.name}</div>
                                        <div className="text-xs text-slate-400">
                                            {player.team_name || 'Unknown Team'} • {player.position}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {p2 && (
                        <div className="mt-6 p-4 bg-slate-900/70 rounded-lg border border-red-500/30">
                            <div className="flex items-center gap-4 mb-4">
                                <PlayerImage player={p2} className="w-20 h-20" />
                                <div className="flex-1">
                                    <h4 className="text-xl font-bold text-white">{p2.name}</h4>
                                    <p className="text-sm text-red-300">{p2.team_name || 'Unknown Team'}</p>
                                    <p className="text-xs text-slate-400 mt-1">{p2.position}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-800/50 p-3 rounded-lg">
                                    <div className="text-xs text-slate-400 mb-1">Appearances</div>
                                    <div className="text-2xl font-bold text-red-400">{p2.appearances || 0}</div>
                                </div>
                                <div className="bg-slate-800/50 p-3 rounded-lg">
                                    <div className="text-xs text-slate-400 mb-1">Minutes</div>
                                    <div className="text-2xl font-bold text-red-400">{p2.minutesPlayed || 0}'</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Charts Grid */}
            {(p1 || p2) && (
                <>
                    {/* Radar Chart */}
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Activity className="text-purple-400" size={24} />
                            Performance Comparison
                        </h3>
                        <ResponsiveContainer width="100%" height={500}>
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="#475569" strokeWidth={1.5} />
                                <PolarAngleAxis 
                                    dataKey="subject" 
                                    stroke="#94a3b8" 
                                    style={{ fontSize: '13px', fontWeight: '600' }}
                                />
                                <PolarRadiusAxis stroke="#475569" domain={[0, 100]} />
                                {p1 && (
                                    <Radar
                                        name={p1.name}
                                        dataKey="player1"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        fill="#3b82f6"
                                        fillOpacity={0.3}
                                    />
                                )}
                                {p2 && (
                                    <Radar
                                        name={p2.name}
                                        dataKey="player2"
                                        stroke="#ef4444"
                                        strokeWidth={3}
                                        fill="#ef4444"
                                        fillOpacity={0.3}
                                    />
                                )}
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#1e293b', 
                                        borderColor: '#475569', 
                                        borderRadius: '8px',
                                        padding: '12px'
                                    }}
                                    labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                                />
                                <Legend 
                                    wrapperStyle={{ paddingTop: '20px' }}
                                    iconType="circle"
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Head-to-Head Bar Chart & Per 90 Line Chart */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                            <h3 className="text-xl font-bold text-white mb-4">Head-to-Head Totals</h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={barChartData} layout="vertical">
                                    <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                                    <XAxis type="number" stroke="#94a3b8" />
                                    <YAxis 
                                        type="category" 
                                        dataKey="name" 
                                        stroke="#94a3b8" 
                                        width={120}
                                        style={{ fontSize: '12px' }}
                                    />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: '#1e293b', 
                                            borderColor: '#475569',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Legend />
                                    <Bar dataKey="p1" name={p1?.name || 'Player 1'} fill="#3b82f6" radius={[0, 4, 4, 0]} />
                                    <Bar dataKey="p2" name={p2?.name || 'Player 2'} fill="#ef4444" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                            <h3 className="text-xl font-bold text-white mb-4">Per 90 Minutes</h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={per90Data}>
                                    <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="stat" 
                                        stroke="#94a3b8"
                                        angle={-20}
                                        textAnchor="end"
                                        height={80}
                                        style={{ fontSize: '11px' }}
                                    />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: '#1e293b', 
                                            borderColor: '#475569',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Legend />
                                    <Bar dataKey="player1" name={p1?.name || 'Player 1'} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="player2" name={p2?.name || 'Player 2'} fill="#ef4444" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Efficiency Metrics */}
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Award className="text-yellow-400" size={24} />
                            Efficiency Metrics (%)
                        </h3>
                        <ResponsiveContainer width="100%" height={350}>
                            <AreaChart data={efficiencyData}>
                                <defs>
                                    <linearGradient id="colorP1" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                    </linearGradient>
                                    <linearGradient id="colorP2" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#94a3b8"
                                    style={{ fontSize: '12px' }}
                                />
                                <YAxis stroke="#94a3b8" domain={[0, 100]} />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#1e293b', 
                                        borderColor: '#475569',
                                        borderRadius: '8px'
                                    }}
                                    formatter={(value) => `${value.toFixed(1)}%`}
                                />
                                <Legend />
                                <Area 
                                    type="monotone" 
                                    dataKey="player1" 
                                    name={p1?.name || 'Player 1'}
                                    stroke="#3b82f6" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorP1)" 
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="player2" 
                                    name={p2?.name || 'Player 2'}
                                    stroke="#ef4444" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorP2)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Key Stats Comparison Cards */}
                    {p1 && p2 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-gradient-to-br from-green-900/30 to-slate-800 border border-green-500/30 rounded-xl p-4">
                                <div className="text-xs text-slate-400 mb-2">Goals + Assists</div>
                                <div className="flex items-center justify-between">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-400">{(p1.goals || 0) + (p1.assists || 0)}</div>
                                        <div className="text-xs text-slate-500">{p1.name?.split(' ')[0]}</div>
                                    </div>
                                    <div className="text-slate-600 text-2xl">vs</div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-red-400">{(p2.goals || 0) + (p2.assists || 0)}</div>
                                        <div className="text-xs text-slate-500">{p2.name?.split(' ')[0]}</div>
                                    </div>
                                </div>
                                {getWinIndicator((p1.goals || 0) + (p1.assists || 0), (p2.goals || 0) + (p2.assists || 0)) === 'p1' && (
                                    <div className="mt-2 text-center">
                                        <TrendingUp className="inline text-blue-400" size={16} />
                                    </div>
                                )}
                                {getWinIndicator((p1.goals || 0) + (p1.assists || 0), (p2.goals || 0) + (p2.assists || 0)) === 'p2' && (
                                    <div className="mt-2 text-center">
                                        <TrendingUp className="inline text-red-400" size={16} />
                                    </div>
                                )}
                            </div>

                            <div className="bg-gradient-to-br from-purple-900/30 to-slate-800 border border-purple-500/30 rounded-xl p-4">
                                <div className="text-xs text-slate-400 mb-2">Pass Accuracy</div>
                                <div className="flex items-center justify-between">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-400">{(p1.accuratePassesPercentage || 0).toFixed(0)}%</div>
                                        <div className="text-xs text-slate-500">{p1.name?.split(' ')[0]}</div>
                                    </div>
                                    <div className="text-slate-600 text-2xl">vs</div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-red-400">{(p2.accuratePassesPercentage || 0).toFixed(0)}%</div>
                                        <div className="text-xs text-slate-500">{p2.name?.split(' ')[0]}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-orange-900/30 to-slate-800 border border-orange-500/30 rounded-xl p-4">
                                <div className="text-xs text-slate-400 mb-2">Duels Won %</div>
                                <div className="flex items-center justify-between">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-400">{(p1.totalDuelsWonPercentage || 0).toFixed(0)}%</div>
                                        <div className="text-xs text-slate-500">{p1.name?.split(' ')[0]}</div>
                                    </div>
                                    <div className="text-slate-600 text-2xl">vs</div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-red-400">{(p2.totalDuelsWonPercentage || 0).toFixed(0)}%</div>
                                        <div className="text-xs text-slate-500">{p2.name?.split(' ')[0]}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-blue-900/30 to-slate-800 border border-blue-500/30 rounded-xl p-4">
                                <div className="text-xs text-slate-400 mb-2">Minutes Played</div>
                                <div className="flex items-center justify-between">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-400">{p1.minutesPlayed || 0}</div>
                                        <div className="text-xs text-slate-500">{p1.name?.split(' ')[0]}</div>
                                    </div>
                                    <div className="text-slate-600 text-2xl">vs</div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-red-400">{p2.minutesPlayed || 0}</div>
                                        <div className="text-xs text-slate-500">{p2.name?.split(' ')[0]}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Empty State */}
            {!p1 && !p2 && (
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-16 text-center">
                    <div className="text-6xl mb-4">⚡</div>
                    <h3 className="text-2xl font-bold text-white mb-2">Ready to Compare</h3>
                    <p className="text-slate-400">Select two players above to see detailed comparison charts and statistics</p>
                </div>
            )}
        </div>
    );
};

export default ComparisonView;