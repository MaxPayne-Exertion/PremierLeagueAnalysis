import React, { useState } from 'react';
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Users } from 'lucide-react';

const PlayerImage = ({ player, size = 'medium' }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-12 h-12'
  };

  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  const imageUrl = player?.image_url || (player?.player_id 
    ? `https://img.sofascore.com/api/v1/player/${player.player_id}/image`
    : null);

  return (
    <div className={`${sizeClasses[size]} flex-shrink-0 relative`}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={player?.name}
          className="w-full h-full object-cover rounded-full border-2 border-slate-600 shadow-md"
          loading="lazy"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      <div 
        className={`${imageUrl ? 'hidden' : 'flex'} w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 rounded-full items-center justify-center text-white font-bold shadow-md border-2 border-slate-600 ${textSizeClasses[size]}`}
        style={{ display: imageUrl ? 'none' : 'flex' }}
      >
        {((player?.name || 'U')[0]).toUpperCase()}
      </div>
    </div>
  );
};

const PlayerTable = ({ players }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'goals', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const playersPerPage = 15;

  const filteredPlayers = players.filter(
    (p) =>
      (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.team_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    if (typeof aVal === 'string') {
      return sortConfig.direction === 'desc' ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
    }
    return sortConfig.direction === 'desc' ? (bVal || 0) - (aVal || 0) : (aVal || 0) - (bVal || 0);
  });

  const totalPages = Math.ceil(sortedPlayers.length / playersPerPage);
  const startIndex = (currentPage - 1) * playersPerPage;
  const currentPlayers = sortedPlayers.slice(startIndex, startIndex + playersPerPage);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'desc' ? (
      <ChevronDown size={14} className="inline ml-1 text-blue-400" />
    ) : (
      <ChevronUp size={14} className="inline ml-1 text-blue-400" />
    );
  };

  const getPositionColor = (position) => {
    const colors = {
      'FW': 'bg-red-500/20 text-red-400 border-red-500/30',
      'MF': 'bg-green-500/20 text-green-400 border-green-500/30',
      'DF': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'GK': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    };
    return colors[position] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl shadow-2xl border border-slate-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/20 rounded-lg">
            <Users size={28} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Premier League Player Stats
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Showing {sortedPlayers.length} of {players.length} players
            </p>
          </div>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute top-3 left-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search players or teams..."
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg shadow-2xl bg-slate-800/50 border border-slate-700">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-gradient-to-r from-slate-800 to-slate-700 text-white sticky top-0">
            <tr>
              <th className="px-4 py-4 text-left cursor-pointer hover:bg-slate-600 transition-colors" onClick={() => handleSort('name')}>
                <span className="font-semibold text-sm uppercase tracking-wide">Player <SortIcon columnKey="name" /></span>
              </th>
              <th className="px-4 py-4 text-left cursor-pointer hover:bg-slate-600 transition-colors" onClick={() => handleSort('team_name')}>
                <span className="font-semibold text-sm uppercase tracking-wide">Team <SortIcon columnKey="team_name" /></span>
              </th>
              <th className="px-4 py-4 text-left cursor-pointer hover:bg-slate-600 transition-colors" onClick={() => handleSort('position')}>
                <span className="font-semibold text-sm uppercase tracking-wide">Pos <SortIcon columnKey="position" /></span>
              </th>
              <th className="px-4 py-4 text-right cursor-pointer hover:bg-slate-600 transition-colors" onClick={() => handleSort('appearances')}>
                <span className="font-semibold text-sm uppercase tracking-wide">Apps <SortIcon columnKey="appearances" /></span>
              </th>
              <th className="px-4 py-4 text-right cursor-pointer hover:bg-slate-600 transition-colors" onClick={() => handleSort('minutesPlayed')}>
                <span className="font-semibold text-sm uppercase tracking-wide">Mins <SortIcon columnKey="minutesPlayed" /></span>
              </th>
              <th className="px-4 py-4 text-right cursor-pointer hover:bg-slate-600 transition-colors" onClick={() => handleSort('goals')}>
                <span className="font-semibold text-sm uppercase tracking-wide">Goals <SortIcon columnKey="goals" /></span>
              </th>
              <th className="px-4 py-4 text-right cursor-pointer hover:bg-slate-600 transition-colors" onClick={() => handleSort('assists')}>
                <span className="font-semibold text-sm uppercase tracking-wide">Assists <SortIcon columnKey="assists" /></span>
              </th>
              <th className="px-4 py-4 text-right cursor-pointer hover:bg-slate-600 transition-colors" onClick={() => handleSort('expectedGoals')}>
                <span className="font-semibold text-sm uppercase tracking-wide">xG <SortIcon columnKey="expectedGoals" /></span>
              </th>
              <th className="px-4 py-4 text-right cursor-pointer hover:bg-slate-600 transition-colors" onClick={() => handleSort('keyPasses')}>
                <span className="font-semibold text-sm uppercase tracking-wide">Key P <SortIcon columnKey="keyPasses" /></span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {currentPlayers.map((player, index) => (
              <tr 
                key={player.id || player.player_id} 
                className="hover:bg-slate-700/50 transition-all duration-200 hover:shadow-lg group"
                style={{ animationDelay: `${index * 0.02}s` }}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3 font-semibold text-white group-hover:text-blue-400 transition-colors">
                    <PlayerImage player={player} size="medium" />
                    <span className="truncate max-w-[200px]">{player.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-300">{player.team_name}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold border ${getPositionColor(player.position)}`}>
                    {player.position}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-slate-300">{player.appearances || 0}</td>
                <td className="px-4 py-3 text-right text-slate-400 text-sm">{player.minutesPlayed || 0}</td>
                <td className="px-4 py-3 text-right font-bold text-yellow-400 text-lg">{player.goals || 0}</td>
                <td className="px-4 py-3 text-right font-bold text-blue-400 text-lg">{player.assists || 0}</td>
                <td className="px-4 py-3 text-right text-slate-300">{(player.expectedGoals || 0).toFixed(2)}</td>
                
                <td className="px-4 py-3 text-right text-green-400 font-semibold">{player.keyPasses || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {sortedPlayers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-500 text-lg">No players found</div>
            <p className="text-slate-600 text-sm mt-2">Try adjusting your search terms</p>
          </div>
        )}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 px-2">
          <div className="text-slate-400 text-sm">
            Showing {startIndex + 1}-{Math.min(startIndex + playersPerPage, sortedPlayers.length)} of {sortedPlayers.length} players
          </div>
          <div className="flex items-center gap-3">
            <button
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700 transition-all hover:shadow-lg"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              <ChevronLeft size={20} className="text-slate-300" />
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      currentPage === pageNum
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700 transition-all hover:shadow-lg"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              <ChevronRight size={20} className="text-slate-300" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerTable;