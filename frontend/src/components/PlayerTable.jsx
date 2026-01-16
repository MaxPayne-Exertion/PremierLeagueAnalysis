import React, { useState } from 'react';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';

const PlayerTable = ({ players }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'goals', direction: 'desc' });

    const filteredPlayers = players.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.team_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    const sortedPlayers = [...filteredPlayers].sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (typeof aVal === 'string') {
            return sortConfig.direction === 'desc'
                ? bVal.localeCompare(aVal)
                : aVal.localeCompare(bVal);
        }

        return sortConfig.direction === 'desc' ? bVal - aVal : aVal - bVal;
    });

    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) return null;
        return sortConfig.direction === 'desc'
            ? <ChevronDown size={14} className="inline ml-1" />
            : <ChevronUp size={14} className="inline ml-1" />;
    };

    const seasons = ['2023-24', '2022-23', '2021-22', '2020-21'];

    return (
        <div className="glass-panel p-6">
            <div className="table-header">
                <h2 className="section-title header-accent">Player Stats</h2>
                <div className="search-wrapper">
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        placeholder="Search players..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('name')} className="sortable">
                                Player <SortIcon columnKey="name" />
                            </th>
                            <th onClick={() => handleSort('team_name')} className="sortable">
                                Team <SortIcon columnKey="team_name" />
                            </th>
                            <th onClick={() => handleSort('position')} className="sortable">
                                Pos <SortIcon columnKey="position" />
                            </th>
                            <th>Nationality</th>
                            <th onClick={() => handleSort('age')} className="sortable text-right">
                                Age <SortIcon columnKey="age" />
                            </th>
                            <th onClick={() => handleSort('matches_played')} className="sortable text-right">
                                MP <SortIcon columnKey="matches_played" />
                            </th>
                            <th onClick={() => handleSort('minutes_played')} className="sortable text-right">
                                Mins <SortIcon columnKey="minutes_played" />
                            </th>
                            <th onClick={() => handleSort('goals')} className="sortable text-right">
                                Goals <SortIcon columnKey="goals" />
                            </th>
                            <th onClick={() => handleSort('assists')} className="sortable text-right">
                                Assists <SortIcon columnKey="assists" />
                            </th>
                            <th onClick={() => handleSort('xg')} className="sortable text-right">
                                xG <SortIcon columnKey="xg" />
                            </th>
                            <th onClick={() => handleSort('xag')} className="sortable text-right">
                                xAG <SortIcon columnKey="xag" />
                            </th>
                            <th onClick={() => handleSort('progressive_carries')} className="sortable text-right">
                                Prg C <SortIcon columnKey="progressive_carries" />
                            </th>
                            <th onClick={() => handleSort('progressive_passes')} className="sortable text-right">
                                Prg P <SortIcon columnKey="progressive_passes" />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedPlayers.map((player) => (
                            <tr key={player.id || player.player_id} className="hover:bg-slate-800/50 transition-colors">
                                <td className="font-semibold">{player.name}</td>
                                <td className="text-secondary">{player.team_name}</td>
                                <td>
                                    <span className={`pos-badge pos-${player.position}`}>
                                        {player.position}
                                    </span>
                                </td>
                                <td className="flex items-center gap-1">
                                    {player.flag_url && player.flag_url.split(',').map((url, i) => (
                                        url.trim() && <img key={i} src={url.trim()} alt="" className="flag-icon" />
                                    ))}
                                    <span className="text-sm ml-1">{player.nationality}</span>
                                </td>
                                <td className="text-right">{player.age}</td>
                                <td className="text-right">{player.matches_played}</td>
                                <td className="text-right text-slate-400">{player.minutes_played}</td>
                                <td className="text-right font-bold text-white">{player.goals}</td>
                                <td className="text-right font-bold text-blue-400">{player.assists}</td>
                                <td className="text-right text-secondary">{player.xg?.toFixed(2) || '0.00'}</td>
                                <td className="text-right text-secondary">{player.xag?.toFixed(2) || '0.00'}</td>
                                <td className="text-right text-green-400">{player.progressive_carries || 0}</td>
                                <td className="text-right text-purple-400">{player.progressive_passes || 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {sortedPlayers.length === 0 && (
                    <div className="empty-state">No players found</div>
                )}
            </div>
        </div>
    );
};

export default PlayerTable;
