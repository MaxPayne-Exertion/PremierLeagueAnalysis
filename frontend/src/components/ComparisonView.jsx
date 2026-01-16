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

    // Prepare normalized radar data
    const radarData = useMemo(() => {
        if (!p1 && !p2) return [];

        const metrics = [
            { label: 'Goals', key: 'goals' },
            { label: 'Assists', key: 'assists' },
            { label: 'xG', key: 'xg' },
            { label: 'xAG', key: 'xag' },
            { label: 'Prg. Carries', key: 'progressive_carries' },
            { label: 'Prg. Passes', key: 'progressive_passes' },
        ];

        return metrics.map(metric => {
            const values = players.map(p => p[metric.key] || 0);
            const min = Math.min(...values);
            const max = Math.max(...values);

            const normalizeValue = (val) => {
                if (max === min) return 50;
                return ((val - min) / (max - min)) * 100;
            };

            return {
                subject: metric.label,
                fullMark: 100,
                A: p1 ? normalizeValue(p1[metric.key] || 0) : 0,
                B: p2 ? normalizeValue(p2[metric.key] || 0) : 0,
                valA: p1 ? p1[metric.key] : 0,
                valB: p2 ? p2[metric.key] : 0,
            };
        });
    }, [p1, p2, players]);

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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Side - Player Selectors Stacked */}
                <div className="space-y-4">
                    {/* Player 1 Selector */}
                    <div className="p-4">
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
                    </div>

                    {/* Player 2 Selector */}
                    <div className="p-4">
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
        </div>
    );
};

export default ComparisonView;
