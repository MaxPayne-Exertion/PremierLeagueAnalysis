import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { PlotlyComparisonRadar } from './PlotlyRadar';

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
            p.team_name.toLowerCase().includes(player1Search.toLowerCase())
        ).slice(0, 50);
    }, [players, player1Search]);

    const filteredPlayers2 = useMemo(() => {
        if (!player2Search) return players.slice(0, 50);
        return players.filter(p =>
            p.name.toLowerCase().includes(player2Search.toLowerCase()) ||
            p.team_name.toLowerCase().includes(player2Search.toLowerCase())
        ).slice(0, 50);
    }, [players, player2Search]);

    // Define metrics for each comparison type
    const metricsByType = {
        offensive: [
            { label: 'Goals', key: 'goals' },
            { label: 'Assists', key: 'assists' },
            { label: 'xG', key: 'xg' },
            { label: 'xAG', key: 'xag' },
            { label: 'Key Passes', key: 'key_passes' },
            { label: 'Prg. Carries', key: 'progressive_carries' },
        ],
        defensive: [
            { label: 'Tackles Won', key: 'tackles_won' },
            { label: 'Interceptions', key: 'interceptions' },
            { label: 'Clearances', key: 'clearances' },
            { label: 'Blocks', key: 'blocks' },
            { label: 'Prg. Passes', key: 'progressive_passes' },
        ],
        goalkeeping: [
            { label: 'Saves', key: 'saves' },
            { label: 'Clean Sheets', key: 'clean_sheets' },
            { label: 'Save %', key: 'save_percentage' },
            { label: 'Penalties Saved', key: 'penalties_saved' },
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
                A: p1 ? normalizeValue(parseFloat(p1[metric.key]) || 0) : 0,
                B: p2 ? normalizeValue(parseFloat(p2[metric.key]) || 0) : 0,
                valA: p1 ? (parseFloat(p1[metric.key]) || 0) : 0,
                valB: p2 ? (parseFloat(p2[metric.key]) || 0) : 0,
            };
        });
    }, [p1, p2, players, comparisonType]);

    // Calculate per-game stats for display
    const getPlayerStats = (player) => {
        if (!player) return null;
        const matches = player.matches_played || 1;
        
        return {
            offensive: [
                { label: 'Goals', value: player.goals || 0, perGame: ((player.goals || 0) / matches).toFixed(2) },
                { label: 'Assists', value: player.assists || 0, perGame: ((player.assists || 0) / matches).toFixed(2) },
                { label: 'xG', value: parseFloat(player.xg || 0).toFixed(1), perGame: ((player.xg || 0) / matches).toFixed(2) },
                { label: 'xAG', value: parseFloat(player.xag || 0).toFixed(1), perGame: ((player.xag || 0) / matches).toFixed(2) },
                { label: 'Key Passes', value: player.key_passes || 0, perGame: ((player.key_passes || 0) / matches).toFixed(1) },
                { label: 'Progressive Carries', value: player.progressive_carries || 0, perGame: ((player.progressive_carries || 0) / matches).toFixed(1) },
            ],
            defensive: [
                { label: 'Tackles Won', value: player.tackles_won || 0, perGame: ((player.tackles_won || 0) / matches).toFixed(1) },
                { label: 'Interceptions', value: player.interceptions || 0, perGame: ((player.interceptions || 0) / matches).toFixed(1) },
                { label: 'Clearances', value: player.clearances || 0, perGame: ((player.clearances || 0) / matches).toFixed(1) },
                { label: 'Blocks', value: player.blocks || 0, perGame: ((player.blocks || 0) / matches).toFixed(1) },
                { label: 'Progressive Passes', value: player.progressive_passes || 0, perGame: ((player.progressive_passes || 0) / matches).toFixed(1) },
            ],
            goalkeeping: [
                { label: 'Saves', value: player.saves || 0, perGame: ((player.saves || 0) / matches).toFixed(1) },
                { label: 'Clean Sheets', value: player.clean_sheets || 0, percentage: matches > 0 ? (((player.clean_sheets || 0) / matches) * 100).toFixed(0) + '%' : '0%' },
                { label: 'Save %', value: parseFloat(player.save_percentage || 0).toFixed(1) + '%', perGame: '-' },
                { label: 'Penalties Saved', value: player.penalties_saved || 0, perGame: '-' },
                { label: 'Goals Conceded', value: player.goals_conceded || 0, perGame: ((player.goals_conceded || 0) / matches).toFixed(1) },
            ]
        };
    };

    const player1Stats = getPlayerStats(p1);
    const player2Stats = getPlayerStats(p2);

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

    return (
        <div className="animate-fade-in">
            <h2 className="section-title mb-6">
                <span className="accent-bar"></span>
                Player Comparison
            </h2>

            {/* Comparison Type Selector */}
            <div className="flex gap-2 mb-6 flex-wrap">
                <button
                    onClick={() => setComparisonType('offensive')}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${
                        comparisonType === 'offensive'
                            ? 'bg-green-500 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                >
                    ⚽ Offensive
                </button>
                <button
                    onClick={() => setComparisonType('defensive')}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${
                        comparisonType === 'defensive'
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                >
                    🛡️ Defensive
                </button>
                <button
                    onClick={() => setComparisonType('goalkeeping')}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${
                        comparisonType === 'goalkeeping'
                            ? 'bg-yellow-500 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                >
                    🧤 Goalkeeping
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Side - Player Selectors Stacked */}
                <div className="space-y-4">
                    {/* Player 1 Selector */}
                    <div className="p-4 bg-slate-800 border border-slate-700 rounded-lg">
                        <h3 className="text-sm uppercase text-blue-400 font-semibold mb-3">Player 1</h3>
                        <div className="relative">
                            <div className="search-wrapper">
                                <Search className="search-icon" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search player..."
                                    className="search-input w-full"
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
                                <div className="player-dropdown">
                                    {filteredPlayers1.map(player => (
                                        <div
                                            key={player.id || player.player_id}
                                            className="player-dropdown-item"
                                            onClick={() => selectPlayer1(player)}
                                        >
                                            <div className="font-semibold">{player.name}</div>
                                            <div className="text-xs text-slate-400">{player.team_name} • {player.position}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Player 1 Info Card */}
                        {p1 && (
                            <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-blue-500/30">
                                <div className="flex items-center gap-3 mb-3">
                                    {p1.photo_url && (
                                        <img 
                                            src={p1.photo_url} 
                                            alt={p1.name} 
                                            className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
                                        />
                                    )}
                                    <div>
                                        <h4 className="text-lg font-bold text-white">{p1.name}</h4>
                                        <p className="text-sm text-slate-400">{p1.team_name} • {p1.position}</p>
                                        <div className="flex items-center gap-1 mt-1">
                                            {p1.flag_url && (
                                                <img src={p1.flag_url} alt={p1.nationality} className="w-4 h-3 object-cover rounded" />
                                            )}
                                            <span className="text-xs text-slate-500">{p1.nationality}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Player 2 Selector */}
                    <div className="p-4 bg-slate-800 border border-slate-700 rounded-lg">
                        <h3 className="text-sm uppercase text-red-400 font-semibold mb-3">Player 2</h3>
                        <div className="relative">
                            <div className="search-wrapper">
                                <Search className="search-icon" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search player..."
                                    className="search-input w-full"
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
                                <div className="player-dropdown">
                                    {filteredPlayers2.map(player => (
                                        <div
                                            key={player.id || player.player_id}
                                            className="player-dropdown-item"
                                            onClick={() => selectPlayer2(player)}
                                        >
                                            <div className="font-semibold">{player.name}</div>
                                            <div className="text-xs text-slate-400">{player.team_name} • {player.position}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Player 2 Info Card */}
                        {p2 && (
                            <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-red-500/30">
                                <div className="flex items-center gap-3 mb-3">
                                    {p2.photo_url && (
                                        <img 
                                            src={p2.photo_url} 
                                            alt={p2.name} 
                                            className="w-16 h-16 rounded-full object-cover border-2 border-red-500"
                                        />
                                    )}
                                    <div>
                                        <h4 className="text-lg font-bold text-white">{p2.name}</h4>
                                        <p className="text-sm text-slate-400">{p2.team_name} • {p2.position}</p>
                                        <div className="flex items-center gap-1 mt-1">
                                            {p2.flag_url && (
                                                <img src={p2.flag_url} alt={p2.nationality} className="w-4 h-3 object-cover rounded" />
                                            )}
                                            <span className="text-xs text-slate-500">{p2.nationality}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side - Radar Chart */}
                <div>
                    {(p1 || p2) ? (
                        <PlotlyComparisonRadar
                            data={radarData}
                            player1Name={p1?.name || 'Player 1'}
                            player2Name={p2?.name || 'Player 2'}
                        />
                    ) : (
                        <div className="glass-panel p-6 text-center text-slate-400 py-20">
                            Select players to compare their attributes
                        </div>
                    )}
                </div>
            </div>

            {/* Detailed Stats Comparison Table */}
            {(p1 || p2) && (
                <div className="mt-8 bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                    <div className="p-4 bg-slate-900/50 border-b border-slate-700">
                        <h3 className="text-lg font-bold text-white">
                            {comparisonType === 'offensive' ? '⚽ Offensive' : 
                             comparisonType === 'defensive' ? '🛡️ Defensive' : 
                             '🧤 Goalkeeping'} Stats Breakdown
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-slate-400 border-b border-slate-700">
                                    <th className="text-left py-3 px-4">Stat</th>
                                    <th className="text-center py-3 px-4 text-blue-400">{p1?.name || 'Player 1'}</th>
                                    <th className="text-center py-3 px-4 text-red-400">{p2?.name || 'Player 2'}</th>
                                    <th className="text-center py-3 px-4">Difference</th>
                                </tr>
                            </thead>
                            <tbody>
                                {player1Stats && player1Stats[comparisonType].map((stat, idx) => {
                                    const stat2 = player2Stats ? player2Stats[comparisonType][idx] : null;
                                    const val1 = parseFloat(stat.value) || 0;
                                    const val2 = stat2 ? (parseFloat(stat2.value) || 0) : 0;
                                    const diff = val1 - val2;
                                    
                                    return (
                                        <tr key={idx} className="border-b border-slate-800 hover:bg-slate-700/30 transition-colors">
                                            <td className="py-3 px-4 text-white font-medium">{stat.label}</td>
                                            <td className="py-3 px-4 text-center">
                                                <div className="text-blue-400 font-bold">{stat.value}</div>
                                                {stat.perGame && stat.perGame !== '-' && (
                                                    <div className="text-xs text-slate-500">{stat.perGame} per game</div>
                                                )}
                                                {stat.percentage && (
                                                    <div className="text-xs text-slate-500">{stat.percentage}</div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <div className="text-red-400 font-bold">{stat2?.value || 0}</div>
                                                {stat2?.perGame && stat2.perGame !== '-' && (
                                                    <div className="text-xs text-slate-500">{stat2.perGame} per game</div>
                                                )}
                                                {stat2?.percentage && (
                                                    <div className="text-xs text-slate-500">{stat2.percentage}</div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className={`font-bold ${diff > 0 ? 'text-blue-400' : diff < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                                                    {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComparisonView;