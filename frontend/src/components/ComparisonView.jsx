import React, { useState, useMemo } from 'react';
import { Search, TrendingUp, TrendingDown, Award, Activity, ChevronDown } from 'lucide-react';
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

    const barChartData = useMemo(() => {
        if (!p1 || !p2) return [];
        
        const metrics = comparisonType === 'offensive' 
            ? [
                { name: 'Goals', p1: p1.goals || 0, p2: p2.goals || 0 },
                { name: 'Assists', p1: p1.assists || 0, p2: p2.assists || 0 },
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

    const PlayerImage = ({ player, size = 'medium', className = '' }) => {
        const [imageError, setImageError] = useState(false);
        
        const sizeClasses = {
            small: 'w-10 h-10',
            medium: 'w-16 h-16',
            large: 'w-20 h-20'
        };

        const textSizes = {
            small: 'text-sm',
            medium: 'text-xl',
            large: 'text-2xl'
        };

        const imageUrl = player?.image_url || (player?.player_id 
            ? `https://img.sofascore.com/api/v1/player/${player.player_id}/image`
            : null);

        const showImage = imageUrl && !imageError;

        return (
            <div className={`${sizeClasses[size]} flex-shrink-0 ${className} relative`}>
                {showImage ? (
                    <img
                        src={imageUrl}
                        alt={player?.name}
                        className="w-full h-full object-cover rounded-full"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div 
                        className={`w-full h-full bg-slate-600 rounded-full flex items-center justify-center text-white font-semibold ${textSizes[size]}`}
                    >
                        {((player?.name || 'U')[0]).toUpperCase()}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="w-full min-h-screen bg-slate-900 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-yellow-300 mb-1">Comparison Arena</h1>
                    <p className="text-slate-400 text-sm">Which of the two is better?</p>
                </div>

                {/* Category tabs */}
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-1 flex gap-1 mb-6 overflow-x-auto">
                    <button
                        onClick={() => setComparisonType('offensive')}
                        className={`flex-1 py-2.5 px-4 rounded text-sm font-medium transition-colors whitespace-nowrap ${
                            comparisonType === 'offensive'
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-400 hover:text-white hover:bg-slate-700'
                        }`}
                    >
                        Attack
                    </button>
                    <button
                        onClick={() => setComparisonType('defensive')}
                        className={`flex-1 py-2.5 px-4 rounded text-sm font-medium transition-colors whitespace-nowrap ${
                            comparisonType === 'defensive'
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-400 hover:text-white hover:bg-slate-700'
                        }`}
                    >
                        Defense
                    </button>
                    <button
                        onClick={() => setComparisonType('goalkeeping')}
                        className={`flex-1 py-2.5 px-4 rounded text-sm font-medium transition-colors whitespace-nowrap ${
                            comparisonType === 'goalkeeping'
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-400 hover:text-white hover:bg-slate-700'
                        }`}
                    >
                        Goalkeeping
                    </button>
                </div>

                {/* Player Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Player 1 */}
                    <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Player 1</h3>
                        </div>
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-3 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search player"
                                className="w-full pl-9 pr-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                                value={player1Search}
                                onChange={(e) => {
                                    setPlayer1Search(e.target.value);
                                    setShowPlayer1Dropdown(true);
                                }}
                                onFocus={() => setShowPlayer1Dropdown(true)}
                            />
                            {showPlayer1Dropdown && filteredPlayers1.length > 0 && (
                                <div className="absolute z-50 w-full mt-1 max-h-64 overflow-y-auto bg-slate-800 border border-slate-700 rounded-lg shadow-xl">
                                    {filteredPlayers1.map(player => (
                                        <div
                                            key={player.id || player.player_id}
                                            className="p-3 hover:bg-slate-700 cursor-pointer transition-colors border-b border-slate-700 last:border-b-0"
                                            onClick={() => selectPlayer1(player)}
                                        >
                                            <div className="font-medium text-white text-sm">{player.name}</div>
                                            <div className="text-xs text-slate-400 mt-0.5">
                                                {player.team_name || 'Unknown Team'} • {player.position}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {p1 && (
                            <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg">
                                <PlayerImage player={p1} size="large" />
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-semibold truncate">{p1.name}</h4>
                                    <p className="text-sm text-slate-400 truncate">{p1.team_name || 'Unknown Team'}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-slate-500">{p1.position}</span>
                                        <span className="text-xs text-slate-600">•</span>
                                        <span className="text-xs text-slate-500">{p1.appearances || 0} apps</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Player 2 */}
                    <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Player 2</h3>
                        </div>
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-3 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search player"
                                className="w-full pl-9 pr-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:border-red-500 transition-colors"
                                value={player2Search}
                                onChange={(e) => {
                                    setPlayer2Search(e.target.value);
                                    setShowPlayer2Dropdown(true);
                                }}
                                onFocus={() => setShowPlayer2Dropdown(true)}
                            />
                            {showPlayer2Dropdown && filteredPlayers2.length > 0 && (
                                <div className="absolute z-50 w-full mt-1 max-h-64 overflow-y-auto bg-slate-800 border border-slate-700 rounded-lg shadow-xl">
                                    {filteredPlayers2.map(player => (
                                        <div
                                            key={player.id || player.player_id}
                                            className="p-3 hover:bg-slate-700 cursor-pointer transition-colors border-b border-slate-700 last:border-b-0"
                                            onClick={() => selectPlayer2(player)}
                                        >
                                            <div className="font-medium text-white text-sm">{player.name}</div>
                                            <div className="text-xs text-slate-400 mt-0.5">
                                                {player.team_name || 'Unknown Team'} • {player.position}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {p2 && (
                            <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg">
                                <PlayerImage player={p2} size="large" />
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-semibold truncate">{p2.name}</h4>
                                    <p className="text-sm text-slate-400 truncate">{p2.team_name || 'Unknown Team'}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-slate-500">{p2.position}</span>
                                        <span className="text-xs text-slate-600">•</span>
                                        <span className="text-xs text-slate-500">{p2.appearances || 0} apps</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Comparison Content */}
                {(p1 || p2) ? (
                    <div className="space-y-4">
                        {/* Quick Stats Comparison */}
                        {p1 && p2 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                                    <div className="text-xs text-slate-400 mb-2">Goals + Assists</div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-center">
                                            <div className="text-xl font-bold text-blue-400">{(p1.goals || 0) + (p1.assists || 0)}</div>
                                        </div>
                                        <div className="text-slate-600 text-lg">vs</div>
                                        <div className="text-center">
                                            <div className="text-xl font-bold text-red-400">{(p2.goals || 0) + (p2.assists || 0)}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                                    <div className="text-xs text-slate-400 mb-2">Pass Accuracy</div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-center">
                                            <div className="text-xl font-bold text-blue-400">{(p1.accuratePassesPercentage || 0).toFixed(0)}%</div>
                                        </div>
                                        <div className="text-slate-600 text-lg">vs</div>
                                        <div className="text-center">
                                            <div className="text-xl font-bold text-red-400">{(p2.accuratePassesPercentage || 0).toFixed(0)}%</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                                    <div className="text-xs text-slate-400 mb-2">Duels Won %</div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-center">
                                            <div className="text-xl font-bold text-blue-400">{(p1.totalDuelsWonPercentage || 0).toFixed(0)}%</div>
                                        </div>
                                        <div className="text-slate-600 text-lg">vs</div>
                                        <div className="text-center">
                                            <div className="text-xl font-bold text-red-400">{(p2.totalDuelsWonPercentage || 0).toFixed(0)}%</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                                    <div className="text-xs text-slate-400 mb-2">Minutes Played</div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-center">
                                            <div className="text-xl font-bold text-blue-400">{p1.minutesPlayed || 0}</div>
                                        </div>
                                        <div className="text-slate-600 text-lg">vs</div>
                                        <div className="text-center">
                                            <div className="text-xl font-bold text-red-400">{p2.minutesPlayed || 0}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Radar Chart */}
                        <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
                            <h3 className="text-white font-semibold mb-4 text-sm">Performance Comparison</h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <RadarChart data={radarData}>
                                    <PolarGrid stroke="#334155" />
                                    <PolarAngleAxis 
                                        dataKey="subject" 
                                        stroke="#94a3b8" 
                                        style={{ fontSize: '11px' }}
                                    />
                                    <PolarRadiusAxis stroke="#334155" domain={[0, 100]} />
                                    {p1 && (
                                        <Radar
                                            name={p1.name}
                                            dataKey="player1"
                                            stroke="#3b82f6"
                                            strokeWidth={2}
                                            fill="#3b82f6"
                                            fillOpacity={0.25}
                                        />
                                    )}
                                    {p2 && (
                                        <Radar
                                            name={p2.name}
                                            dataKey="player2"
                                            stroke="#ef4444"
                                            strokeWidth={2}
                                            fill="#ef4444"
                                            fillOpacity={0.25}
                                        />
                                    )}
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: '#1e293b', 
                                            border: '1px solid #334155',
                                            borderRadius: '6px',
                                            fontSize: '12px'
                                        }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Bar Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
                                <h3 className="text-white font-semibold mb-4 text-sm">Total Stats</h3>
                                <ResponsiveContainer width="100%" height={350}>
                                    <BarChart data={barChartData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis type="number" stroke="#94a3b8" style={{ fontSize: '11px' }} />
                                        <YAxis 
                                            type="category" 
                                            dataKey="name" 
                                            stroke="#94a3b8" 
                                            width={100}
                                            style={{ fontSize: '11px' }}
                                        />
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: '#1e293b', 
                                                border: '1px solid #334155',
                                                borderRadius: '6px',
                                                fontSize: '12px'
                                            }}
                                        />
                                        <Bar dataKey="p1" name={p1?.name || 'Player 1'} fill="#3b82f6" radius={[0, 4, 4, 0]} />
                                        <Bar dataKey="p2" name={p2?.name || 'Player 2'} fill="#ef4444" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
                                <h3 className="text-white font-semibold mb-4 text-sm">Per 90 Minutes</h3>
                                <ResponsiveContainer width="100%" height={350}>
                                    <BarChart data={per90Data}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis 
                                            dataKey="stat" 
                                            stroke="#94a3b8"
                                            angle={-20}
                                            textAnchor="end"
                                            height={70}
                                            style={{ fontSize: '10px' }}
                                        />
                                        <YAxis stroke="#94a3b8" style={{ fontSize: '11px' }} />
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: '#1e293b', 
                                                border: '1px solid #334155',
                                                borderRadius: '6px',
                                                fontSize: '12px'
                                            }}
                                        />
                                        <Bar dataKey="player1" name={p1?.name || 'Player 1'} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="player2" name={p2?.name || 'Player 2'} fill="#ef4444" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Efficiency Chart */}
                        <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
                            <h3 className="text-white font-semibold mb-4 text-sm">Efficiency Metrics (%)</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={efficiencyData}>
                                    <defs>
                                        <linearGradient id="colorP1" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorP2" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis 
                                        dataKey="name" 
                                        stroke="#94a3b8"
                                        style={{ fontSize: '11px' }}
                                    />
                                    <YAxis stroke="#94a3b8" domain={[0, 100]} style={{ fontSize: '11px' }} />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: '#1e293b', 
                                            border: '1px solid #334155',
                                            borderRadius: '6px',
                                            fontSize: '12px'
                                        }}
                                        formatter={(value) => `${value.toFixed(1)}%`}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                                    <Area 
                                        type="monotone" 
                                        dataKey="player1" 
                                        name={p1?.name || 'Player 1'}
                                        stroke="#3b82f6" 
                                        strokeWidth={2}
                                        fillOpacity={1} 
                                        fill="url(#colorP1)" 
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="player2" 
                                        name={p2?.name || 'Player 2'}
                                        stroke="#ef4444" 
                                        strokeWidth={2}
                                        fillOpacity={1} 
                                        fill="url(#colorP2)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Detailed Stats Table */}
                        {p1 && p2 && (
                            <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                                <div className="p-5 border-b border-slate-700">
                                    <h3 className="text-white font-semibold text-sm">Detailed Statistics</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-slate-900/50 border-b border-slate-700">
                                                <th className="text-left py-3 px-4 text-slate-400 font-medium">Statistic</th>
                                                <th className="text-center py-3 px-4 text-blue-400 font-medium">{p1.name.split(' ').slice(-1)[0]}</th>
                                                <th className="text-center py-3 px-4 text-red-400 font-medium">{p2.name.split(' ').slice(-1)[0]}</th>
                                                <th className="text-center py-3 px-4 text-slate-400 font-medium">Winner</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-700">
                                            {comparisonType === 'offensive' && (
                                                <>
                                                    <tr className="hover:bg-slate-700/30 transition-colors">
                                                        <td className="py-3 px-4 text-slate-300">Goals</td>
                                                        <td className="py-3 px-4 text-center text-blue-300 font-semibold">{p1.goals || 0}</td>
                                                        <td className="py-3 px-4 text-center text-red-300 font-semibold">{p2.goals || 0}</td>
                                                        <td className="py-3 px-4 text-center">
                                                            {(p1.goals || 0) > (p2.goals || 0) ? (
                                                                <span className="text-blue-400">◀</span>
                                                            ) : (p1.goals || 0) < (p2.goals || 0) ? (
                                                                <span className="text-red-400">▶</span>
                                                            ) : (
                                                                <span className="text-slate-500">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                    <tr className="hover:bg-slate-700/30 transition-colors">
                                                        <td className="py-3 px-4 text-slate-300">Assists</td>
                                                        <td className="py-3 px-4 text-center text-blue-300 font-semibold">{p1.assists || 0}</td>
                                                        <td className="py-3 px-4 text-center text-red-300 font-semibold">{p2.assists || 0}</td>
                                                        <td className="py-3 px-4 text-center">
                                                            {(p1.assists || 0) > (p2.assists || 0) ? (
                                                                <span className="text-blue-400">◀</span>
                                                            ) : (p1.assists || 0) < (p2.assists || 0) ? (
                                                                <span className="text-red-400">▶</span>
                                                            ) : (
                                                                <span className="text-slate-500">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                    <tr className="hover:bg-slate-700/30 transition-colors">
                                                    </tr>
                                                    <tr className="hover:bg-slate-700/30 transition-colors">
                                                        <td className="py-3 px-4 text-slate-300">Total Shots</td>
                                                        <td className="py-3 px-4 text-center text-blue-300 font-semibold">{p1.totalShots || 0}</td>
                                                        <td className="py-3 px-4 text-center text-red-300 font-semibold">{p2.totalShots || 0}</td>
                                                        <td className="py-3 px-4 text-center">
                                                            {(p1.totalShots || 0) > (p2.totalShots || 0) ? (
                                                                <span className="text-blue-400">◀</span>
                                                            ) : (p1.totalShots || 0) < (p2.totalShots || 0) ? (
                                                                <span className="text-red-400">▶</span>
                                                            ) : (
                                                                <span className="text-slate-500">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                    <tr className="hover:bg-slate-700/30 transition-colors">
                                                        <td className="py-3 px-4 text-slate-300">Shots on Target</td>
                                                        <td className="py-3 px-4 text-center text-blue-300 font-semibold">{p1.shotsOnTarget || 0}</td>
                                                        <td className="py-3 px-4 text-center text-red-300 font-semibold">{p2.shotsOnTarget || 0}</td>
                                                        <td className="py-3 px-4 text-center">
                                                            {(p1.shotsOnTarget || 0) > (p2.shotsOnTarget || 0) ? (
                                                                <span className="text-blue-400">◀</span>
                                                            ) : (p1.shotsOnTarget || 0) < (p2.shotsOnTarget || 0) ? (
                                                                <span className="text-red-400">▶</span>
                                                            ) : (
                                                                <span className="text-slate-500">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                    <tr className="hover:bg-slate-700/30 transition-colors">
                                                        <td className="py-3 px-4 text-slate-300">Shot Accuracy %</td>
                                                        <td className="py-3 px-4 text-center text-blue-300 font-semibold">
                                                            {p1.totalShots ? ((p1.shotsOnTarget / p1.totalShots) * 100).toFixed(1) : 0}%
                                                        </td>
                                                        <td className="py-3 px-4 text-center text-red-300 font-semibold">
                                                            {p2.totalShots ? ((p2.shotsOnTarget / p2.totalShots) * 100).toFixed(1) : 0}%
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            {(p1.totalShots ? ((p1.shotsOnTarget / p1.totalShots) * 100) : 0) > (p2.totalShots ? ((p2.shotsOnTarget / p2.totalShots) * 100) : 0) ? (
                                                                <span className="text-blue-400">◀</span>
                                                            ) : (p1.totalShots ? ((p1.shotsOnTarget / p1.totalShots) * 100) : 0) < (p2.totalShots ? ((p2.shotsOnTarget / p2.totalShots) * 100) : 0) ? (
                                                                <span className="text-red-400">▶</span>
                                                            ) : (
                                                                <span className="text-slate-500">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                    <tr className="hover:bg-slate-700/30 transition-colors">
                                                        <td className="py-3 px-4 text-slate-300">Goal Conversion %</td>
                                                        <td className="py-3 px-4 text-center text-blue-300 font-semibold">{parseFloat(p1.goalConversionPercentage || 0).toFixed(1)}%</td>
                                                        <td className="py-3 px-4 text-center text-red-300 font-semibold">{parseFloat(p2.goalConversionPercentage || 0).toFixed(1)}%</td>
                                                        <td className="py-3 px-4 text-center">
                                                            {parseFloat(p1.goalConversionPercentage || 0) > parseFloat(p2.goalConversionPercentage || 0) ? (
                                                                <span className="text-blue-400">◀</span>
                                                            ) : parseFloat(p1.goalConversionPercentage || 0) < parseFloat(p2.goalConversionPercentage || 0) ? (
                                                                <span className="text-red-400">▶</span>
                                                            ) : (
                                                                <span className="text-slate-500">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                    <tr className="hover:bg-slate-700/30 transition-colors">
                                                        <td className="py-3 px-4 text-slate-300">Key Passes</td>
                                                        <td className="py-3 px-4 text-center text-blue-300 font-semibold">{p1.keyPasses || 0}</td>
                                                        <td className="py-3 px-4 text-center text-red-300 font-semibold">{p2.keyPasses || 0}</td>
                                                        <td className="py-3 px-4 text-center">
                                                            {(p1.keyPasses || 0) > (p2.keyPasses || 0) ? (
                                                                <span className="text-blue-400">◀</span>
                                                            ) : (p1.keyPasses || 0) < (p2.keyPasses || 0) ? (
                                                                <span className="text-red-400">▶</span>
                                                            ) : (
                                                                <span className="text-slate-500">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                    <tr className="hover:bg-slate-700/30 transition-colors">
                                                        <td className="py-3 px-4 text-slate-300">Successful Dribbles</td>
                                                        <td className="py-3 px-4 text-center text-blue-300 font-semibold">{p1.successfulDribbles || 0}</td>
                                                        <td className="py-3 px-4 text-center text-red-300 font-semibold">{p2.successfulDribbles || 0}</td>
                                                        <td className="py-3 px-4 text-center">
                                                            {(p1.successfulDribbles || 0) > (p2.successfulDribbles || 0) ? (
                                                                <span className="text-blue-400">◀</span>
                                                            ) : (p1.successfulDribbles || 0) < (p2.successfulDribbles || 0) ? (
                                                                <span className="text-red-400">▶</span>
                                                            ) : (
                                                                <span className="text-slate-500">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                    <tr className="hover:bg-slate-700/30 transition-colors">
                                                        <td className="py-3 px-4 text-slate-300">Dribble Success %</td>
                                                        <td className="py-3 px-4 text-center text-blue-300 font-semibold">{parseFloat(p1.successfulDribblesPercentage || 0).toFixed(1)}%</td>
                                                        <td className="py-3 px-4 text-center text-red-300 font-semibold">{parseFloat(p2.successfulDribblesPercentage || 0).toFixed(1)}%</td>
                                                        <td className="py-3 px-4 text-center">
                                                            {parseFloat(p1.successfulDribblesPercentage || 0) > parseFloat(p2.successfulDribblesPercentage || 0) ? (
                                                                <span className="text-blue-400">◀</span>
                                                            ) : parseFloat(p1.successfulDribblesPercentage || 0) < parseFloat(p2.successfulDribblesPercentage || 0) ? (
                                                                <span className="text-red-400">▶</span>
                                                            ) : (
                                                                <span className="text-slate-500">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                    <tr className="hover:bg-slate-700/30 transition-colors">
                                                        <td className="py-3 px-4 text-slate-300">Big Chances Missed</td>
                                                        <td className="py-3 px-4 text-center text-blue-300 font-semibold">{p1.bigChancesMissed || 0}</td>
                                                        <td className="py-3 px-4 text-center text-red-300 font-semibold">{p2.bigChancesMissed || 0}</td>
                                                        <td className="py-3 px-4 text-center">
                                                            {(p1.bigChancesMissed || 0) < (p2.bigChancesMissed || 0) ? (
                                                                <span className="text-blue-400">◀</span>
                                                            ) : (p1.bigChancesMissed || 0) > (p2.bigChancesMissed || 0) ? (
                                                                <span className="text-red-400">▶</span>
                                                            ) : (
                                                                <span className="text-slate-500">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                </>
                                            )}
                                            {comparisonType === 'defensive' && (
                                                <>
                                                    <tr className="hover:bg-slate-700/30 transition-colors">
                                                        <td className="py-3 px-4 text-slate-300">Tackles</td>
                                                        <td className="py-3 px-4 text-center text-blue-300 font-semibold">{p1.tackles || 0}</td>
                                                        <td className="py-3 px-4 text-center text-red-300 font-semibold">{p2.tackles || 0}</td>
                                                        <td className="py-3 px-4 text-center">
                                                            {(p1.tackles || 0) > (p2.tackles || 0) ? (
                                                                <span className="text-blue-400">◀</span>
                                                            ) : (p1.tackles || 0) < (p2.tackles || 0) ? (
                                                                <span className="text-red-400">▶</span>
                                                            ) : (
                                                                <span className="text-slate-500">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                    <tr className="hover:bg-slate-700/30 transition-colors">
                                                        <td className="py-3 px-4 text-slate-300">Interceptions</td>
                                                        <td className="py-3 px-4 text-center text-blue-300 font-semibold">{p1.interceptions || 0}</td>
                                                        <td className="py-3 px-4 text-center text-red-300 font-semibold">{p2.interceptions || 0}</td>
                                                        <td className="py-3 px-4 text-center">
                                                            {(p1.interceptions || 0) > (p2.interceptions || 0) ? (
                                                                <span className="text-blue-400">◀</span>
                                                            ) : (p1.interceptions || 0) < (p2.interceptions || 0) ? (
                                                                <span className="text-red-400">▶</span>
                                                            ) : (
                                                                <span className="text-slate-500">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                    <tr className="hover:bg-slate-700/30 transition-colors">
                                                        <td className="py-3 px-4 text-slate-300">Clearances</td>
                                                        <td className="py-3 px-4 text-center text-blue-300 font-semibold">{p1.clearances || 0}</td>
                                                        <td className="py-3 px-4 text-center text-red-300 font-semibold">{p2.clearances || 0}</td>
                                                        <td className="py-3 px-4 text-center">
                                                            {(p1.clearances || 0) > (p2.clearances || 0) ? (
                                                                <span className="text-blue-400">◀</span>
                                                            ) : (p1.clearances || 0) < (p2.clearances || 0) ? (
                                                                <span className="text-red-400">▶</span>
                                                            ) : (
                                                                <span className="text-slate-500">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                    <tr className="hover:bg-slate-700/30 transition-colors">
                                                        <td className="py-3 px-4 text-slate-300">Total Duels Won</td>
                                                        <td className="py-3 px-4 text-center text-blue-300 font-semibold">{p1.totalDuelsWon || 0}</td>
                                                        <td className="py-3 px-4 text-center text-red-300 font-semibold">{p2.totalDuelsWon || 0}</td>
                                                        <td className="py-3 px-4 text-center">
                                                            {(p1.totalDuelsWon || 0) > (p2.totalDuelsWon || 0) ? (
                                                                <span className="text-blue-400">◀</span>
                                                            ) : (p1.totalDuelsWon || 0) < (p2.totalDuelsWon || 0) ? (
                                                                <span className="text-red-400">▶</span>
                                                            ) : (
                                                                <span className="text-slate-500">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                    <tr className="hover:bg-slate-700/30 transition-colors">
                                                        <td className="py-3 px-4 text-slate-300">Duels Won %</td>
                                                        <td className="py-3 px-4 text-center text-blue-300 font-semibold">{parseFloat(p1.totalDuelsWonPercentage || 0).toFixed(1)}%</td>
                                                        <td className="py-3 px-4 text-center text-red-300 font-semibold">{parseFloat(p2.totalDuelsWonPercentage || 0).toFixed(1)}%</td>
                                                        <td className="py-3 px-4 text-center">
                                                            {parseFloat(p1.totalDuelsWonPercentage || 0) > parseFloat(p2.totalDuelsWonPercentage || 0) ? (
                                                                <span className="text-blue-400">◀</span>
                                                            ) : parseFloat(p1.totalDuelsWonPercentage || 0) < parseFloat(p2.totalDuelsWonPercentage || 0) ? (
                                                                <span className="text-red-400">▶</span>
                                                            ) : (
                                                                <span className="text-slate-500">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                    <tr className="hover:bg-slate-700/30 transition-colors">
                                                        <td className="py-3 px-4 text-slate-300">Aerial Duels Won</td>
                                                        <td className="py-3 px-4 text-center text-blue-300 font-semibold">{p1.aerialDuelsWon || 0}</td>
                                                        <td className="py-3 px-4 text-center text-red-300 font-semibold">{p2.aerialDuelsWon || 0}</td>
                                                        <td className="py-3 px-4 text-center">
                                                            {(p1.aerialDuelsWon || 0) > (p2.aerialDuelsWon || 0) ? (
                                                                <span className="text-blue-400">◀</span>
                                                            ) : (p1.aerialDuelsWon || 0) < (p2.aerialDuelsWon || 0) ? (
                                                                <span className="text-red-400">▶</span>
                                                            ) : (
                                                                <span className="text-slate-500">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                    <tr className="hover:bg-slate-700/30 transition-colors">
                                                        <td className="py-3 px-4 text-slate-300">Aerial Duels Won %</td>
                                                        <td className="py-3 px-4 text-center text-blue-300 font-semibold">{parseFloat(p1.aerialDuelsWonPercentage || 0).toFixed(1)}%</td>
                                                        <td className="py-3 px-4 text-center text-red-300 font-semibold">{parseFloat(p2.aerialDuelsWonPercentage || 0).toFixed(1)}%</td>
                                                        <td className="py-3 px-4 text-center">
                                                            {parseFloat(p1.aerialDuelsWonPercentage || 0) > parseFloat(p2.aerialDuelsWonPercentage || 0) ? (
                                                                <span className="text-blue-400">◀</span>
                                                            ) : parseFloat(p1.aerialDuelsWonPercentage || 0) < parseFloat(p2.aerialDuelsWonPercentage || 0) ? (
                                                                <span className="text-red-400">▶</span>
                                                            ) : (
                                                                <span className="text-slate-500">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                    <tr className="hover:bg-slate-700/30 transition-colors">
                                                        <td className="py-3 px-4 text-slate-300">Ground Duels Won</td>
                                                        <td className="py-3 px-4 text-center text-blue-300 font-semibold">{p1.groundDuelsWon || 0}</td>
                                                        <td className="py-3 px-4 text-center text-red-300 font-semibold">{p2.groundDuelsWon || 0}</td>
                                                        <td className="py-3 px-4 text-center">
                                                            {(p1.groundDuelsWon || 0) > (p2.groundDuelsWon || 0) ? (
                                                                <span className="text-blue-400">◀</span>
                                                            ) : (p1.groundDuelsWon || 0) < (p2.groundDuelsWon || 0) ? (
                                                                <span className="text-red-400">▶</span>
                                                            ) : (
                                                                <span className="text-slate-500">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                    <tr className="hover:bg-slate-700/30 transition-colors">
                                                        <td className="py-3 px-4 text-slate-300">Ground Duels Won %</td>
                                                        <td className="py-3 px-4 text-center text-blue-300 font-semibold">{parseFloat(p1.groundDuelsWonPercentage || 0).toFixed(1)}%</td>
                                                        <td className="py-3 px-4 text-center text-red-300 font-semibold">{parseFloat(p2.groundDuelsWonPercentage || 0).toFixed(1)}%</td>
                                                        <td className="py-3 px-4 text-center">
                                                            {parseFloat(p1.groundDuelsWonPercentage || 0) > parseFloat(p2.groundDuelsWonPercentage || 0) ? (
                                                                <span className="text-blue-400">◀</span>
                                                            ) : parseFloat(p1.groundDuelsWonPercentage || 0) < parseFloat(p2.groundDuelsWonPercentage || 0) ? (
                                                                <span className="text-red-400">▶</span>
                                                            ) : (
                                                                <span className="text-slate-500">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                    <tr className="hover:bg-slate-700/30 transition-colors">
                                                        <td className="py-3 px-4 text-slate-300">Blocks</td>
                                                        <td className="py-3 px-4 text-center text-blue-300 font-semibold">{p1.blockedShots || 0}</td>
                                                        <td className="py-3 px-4 text-center text-red-300 font-semibold">{p2.blockedShots || 0}</td>
                                                        <td className="py-3 px-4 text-center">
                                                            {(p1.blockedShots || 0) > (p2.blockedShots || 0) ? (
                                                                <span className="text-blue-400">◀</span>
                                                            ) : (p1.blockedShots || 0) < (p2.blockedShots || 0) ? (
                                                                <span className="text-red-400">▶</span>
                                                            ) : (
                                                                <span className="text-slate-500">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                    <tr className="hover:bg-slate-700/30 transition-colors">
                                                        <td className="py-3 px-4 text-slate-300">Fouls Committed</td>
                                                        <td className="py-3 px-4 text-center text-blue-300 font-semibold">{p1.fouls || 0}</td>
                                                        <td className="py-3 px-4 text-center text-red-300 font-semibold">{p2.fouls || 0}</td>
                                                        <td className="py-3 px-4 text-center">
                                                            {(p1.fouls || 0) < (p2.fouls || 0) ? (
                                                                <span className="text-blue-400">◀</span>
                                                            ) : (p1.fouls || 0) > (p2.fouls || 0) ? (
                                                                <span className="text-red-400">▶</span>
                                                            ) : (
                                                                <span className="text-slate-500">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                    <tr className="hover:bg-slate-700/30 transition-colors">
                                                        <td className="py-3 px-4 text-slate-300">Yellow Cards</td>
                                                        <td className="py-3 px-4 text-center text-blue-300 font-semibold">{p1.yellowCards || 0}</td>
                                                        <td className="py-3 px-4 text-center text-red-300 font-semibold">{p2.yellowCards || 0}</td>
                                                        <td className="py-3 px-4 text-center">
                                                            {(p1.yellowCards || 0) < (p2.yellowCards || 0) ? (
                                                                <span className="text-blue-400">◀</span>
                                                            ) : (p1.yellowCards || 0) > (p2.yellowCards || 0) ? (
                                                                <span className="text-red-400">▶</span>
                                                            ) : (
                                                                <span className="text-slate-500">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                </>
                                            )}
                                            {comparisonType === 'goalkeeping' && (
                                                <>
                                                    <tr className="hover:bg-slate-700/30 transition-colors">
                                                        <td className="py-3 px-4 text-slate-300">Saves</td>
                                                        <td className="py-3 px-4 text-center text-blue-300 font-semibold">{p1.saves || 0}</td>
                                                        <td className="py-3 px-4 text-center text-red-300 font-semibold">{p2.saves || 0}</td>
                                                        <td className="py-3 px-4 text-center">
                                                            {(p1.saves || 0) > (p2.saves || 0) ? (
                                                                <span className="text-blue-400">◀</span>
                                                            ) : (p1.saves || 0) < (p2.saves || 0) ? (
                                                                <span className="text-red-400">▶</span>
                                                            ) : (
                                                                <span className="text-slate-500">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                    <tr className="hover:bg-slate-700/30 transition-colors">
                                                        <td className="py-3 px-4 text-slate-300">Save Percentage</td>
                                                        <td className="py-3 px-4 text-center text-blue-300 font-semibold">
                                                            {(p1.saves && p1.goalsConceded) ? (((p1.saves / (p1.saves + p1.goalsConceded)) * 100).toFixed(1)) : 0}%
                                                        </td>
                                                        <td className="py-3 px-4 text-center text-red-300 font-semibold">
                                                            {(p2.saves && p2.goalsConceded) ? (((p2.saves / (p2.saves + p2.goalsConceded)) * 100).toFixed(1)) : 0}%
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            {((p1.saves && p1.goalsConceded) ? ((p1.saves / (p1.saves + p1.goalsConceded)) * 100) : 0) > ((p2.saves && p2.goalsConceded) ? ((p2.saves / (p2.saves + p2.goalsConceded)) * 100) : 0) ? (
                                                                <span className="text-blue-400">◀</span>
                                                            ) : ((p1.saves && p1.goalsConceded) ? ((p1.saves / (p1.saves + p1.goalsConceded)) * 100) : 0) < ((p2.saves && p2.goalsConceded) ? ((p2.saves / (p2.saves + p2.goalsConceded)) * 100) : 0) ? (
                                                                <span className="text-red-400">▶</span>
                                                            ) : (
                                                                <span className="text-slate-500">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                    <tr className="hover:bg-slate-700/30 transition-colors">
                                                        <td className="py-3 px-4 text-slate-300">Goals Conceded</td>
                                                        <td className="py-3 px-4 text-center text-blue-300 font-semibold">{p1.goalsConceded || 0}</td>
                                                        <td className="py-3 px-4 text-center text-red-300 font-semibold">{p2.goalsConceded || 0}</td>
                                                        <td className="py-3 px-4 text-center">
                                                            {(p1.goalsConceded || 0) < (p2.goalsConceded || 0) ? (
                                                                <span className="text-blue-400">◀</span>
                                                            ) : (p1.goalsConceded || 0) > (p2.goalsConceded || 0) ? (
                                                                <span className="text-red-400">▶</span>
                                                            ) : (
                                                                <span className="text-slate-500">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                    <tr className="hover:bg-slate-700/30 transition-colors">
                                                        <td className="py-3 px-4 text-slate-300">Clean Sheets</td>
                                                        <td className="py-3 px-4 text-center text-blue-300 font-semibold">{p1.cleanSheets || 0}</td>
                                                        <td className="py-3 px-4 text-center text-red-300 font-semibold">{p2.cleanSheets || 0}</td>
                                                        <td className="py-3 px-4 text-center">
                                                            {(p1.cleanSheets || 0) > (p2.cleanSheets || 0) ? (
                                                                <span className="text-blue-400">◀</span>
                                                            ) : (p1.cleanSheets || 0) < (p2.cleanSheets || 0) ? (
                                                                <span className="text-red-400">▶</span>
                                                            ) : (
                                                                <span className="text-slate-500">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                    <tr className="hover:bg-slate-700/30 transition-colors">
                                                        <td className="py-3 px-4 text-slate-300">High Claims</td>
                                                        <td className="py-3 px-4 text-center text-blue-300 font-semibold">{p1.highClaims || 0}</td>
                                                        <td className="py-3 px-4 text-center text-red-300 font-semibold">{p2.highClaims || 0}</td>
                                                        <td className="py-3 px-4 text-center">
                                                            {(p1.highClaims || 0) > (p2.highClaims || 0) ? (
                                                                <span className="text-blue-400">◀</span>
                                                            ) : (p1.highClaims || 0) < (p2.highClaims || 0) ? (
                                                                <span className="text-red-400">▶</span>
                                                            ) : (
                                                                <span className="text-slate-500">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                    <tr className="hover:bg-slate-700/30 transition-colors">
                                                        <td className="py-3 px-4 text-slate-300">Punches</td>
                                                        <td className="py-3 px-4 text-center text-blue-300 font-semibold">{p1.punches || 0}</td>
                                                        <td className="py-3 px-4 text-center text-red-300 font-semibold">{p2.punches || 0}</td>
                                                        <td className="py-3 px-4 text-center">
                                                            {(p1.punches || 0) > (p2.punches || 0) ? (
                                                                <span className="text-blue-400">◀</span>
                                                            ) : (p1.punches || 0) < (p2.punches || 0) ? (
                                                                <span className="text-red-400">▶</span>
                                                            ) : (
                                                                <span className="text-slate-500">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                    <tr className="hover:bg-slate-700/30 transition-colors">
                                                        <td className="py-3 px-4 text-slate-300">Runs Out</td>
                                                        <td className="py-3 px-4 text-center text-blue-300 font-semibold">{p1.runsOut || 0}</td>
                                                        <td className="py-3 px-4 text-center text-red-300 font-semibold">{p2.runsOut || 0}</td>
                                                        <td className="py-3 px-4 text-center">
                                                            {(p1.runsOut || 0) > (p2.runsOut || 0) ? (
                                                                <span className="text-blue-400">◀</span>
                                                            ) : (p1.runsOut || 0) < (p2.runsOut || 0) ? (
                                                                <span className="text-red-400">▶</span>
                                                            ) : (
                                                                <span className="text-slate-500">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                    <tr className="hover:bg-slate-700/30 transition-colors">
                                                        <td className="py-3 px-4 text-slate-300">Successful Runs Out</td>
                                                        <td className="py-3 px-4 text-center text-blue-300 font-semibold">{p1.successfulRunsOut || 0}</td>
                                                        <td className="py-3 px-4 text-center text-red-300 font-semibold">{p2.successfulRunsOut || 0}</td>
                                                        <td className="py-3 px-4 text-center">
                                                            {(p1.successfulRunsOut || 0) > (p2.successfulRunsOut || 0) ? (
                                                                <span className="text-blue-400">◀</span>
                                                            ) : (p1.successfulRunsOut || 0) < (p2.successfulRunsOut || 0) ? (
                                                                <span className="text-red-400">▶</span>
                                                            ) : (
                                                                <span className="text-slate-500">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                    <tr className="hover:bg-slate-700/30 transition-colors">
                                                        <td className="py-3 px-4 text-slate-300">Successful Runs Out %</td>
                                                        <td className="py-3 px-4 text-center text-blue-300 font-semibold">
                                                            {p1.runsOut ? ((p1.successfulRunsOut / p1.runsOut) * 100).toFixed(1) : 0}%
                                                        </td>
                                                        <td className="py-3 px-4 text-center text-red-300 font-semibold">
                                                            {p2.runsOut ? ((p2.successfulRunsOut / p2.runsOut) * 100).toFixed(1) : 0}%
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            {(p1.runsOut ? ((p1.successfulRunsOut / p1.runsOut) * 100) : 0) > (p2.runsOut ? ((p2.successfulRunsOut / p2.runsOut) * 100) : 0) ? (
                                                                <span className="text-blue-400">◀</span>
                                                            ) : (p1.runsOut ? ((p1.successfulRunsOut / p1.runsOut) * 100) : 0) < (p2.runsOut ? ((p2.successfulRunsOut / p2.runsOut) * 100) : 0) ? (
                                                                <span className="text-red-400">▶</span>
                                                            ) : (
                                                                <span className="text-slate-500">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                    <tr className="hover:bg-slate-700/30 transition-colors">
                                                        <td className="py-3 px-4 text-slate-300">Errors Leading to Goal</td>
                                                        <td className="py-3 px-4 text-center text-blue-300 font-semibold">{p1.errorLeadToGoal || 0}</td>
                                                        <td className="py-3 px-4 text-center text-red-300 font-semibold">{p2.errorLeadToGoal || 0}</td>
                                                        <td className="py-3 px-4 text-center">
                                                            {(p1.errorLeadToGoal || 0) < (p2.errorLeadToGoal || 0) ? (
                                                                <span className="text-blue-400">◀</span>
                                                            ) : (p1.errorLeadToGoal || 0) > (p2.errorLeadToGoal || 0) ? (
                                                                <span className="text-red-400">▶</span>
                                                            ) : (
                                                                <span className="text-slate-500">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                </>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-16 text-center">
                        <div className="text-slate-600 mb-3">
                            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">No Players Selected</h3>
                        <p className="text-slate-400 text-sm">Select two players above to compare their statistics</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComparisonView;