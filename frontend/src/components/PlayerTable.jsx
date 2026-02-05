import React, { useState, useEffect } from 'react';
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const PlayerImage = ({ player, size = 'medium' }) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-12 h-12'
  };

  const textSizes = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  const imageUrl = player?.image_url || (player?.player_id 
    ? `https://img.sofascore.com/api/v1/player/${player.player_id}/image`
    : null);

  useEffect(() => {
    setImageError(false);
  }, [player?.player_id, player?.image_url]);

  const showImage = imageUrl && !imageError;

  return (
    <div className={`${sizeClasses[size]} flex-shrink-0 relative`}>
      {showImage ? (
        <img
          src={imageUrl}
          alt={player?.name || 'Player'}
          className="w-full h-full object-cover rounded-full"
          loading="lazy"
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
      <ChevronDown size={12} className="inline ml-1 text-slate-400" />
    ) : (
      <ChevronUp size={12} className="inline ml-1 text-slate-400" />
    );
  };

  const getPositionColor = (position) => {
    const colors = {
      'FW': 'bg-red-50 text-red-700',
      'MF': 'bg-green-50 text-green-700',
      'DF': 'bg-blue-50 text-blue-700',
      'GK': 'bg-yellow-50 text-yellow-700'
    };
    return colors[position] || 'bg-slate-50 text-slate-700';
  };

  return (
    <div className="w-full min-h-screen bg-slate-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-yellow-400 mb-1">Premier League Player Table</h1>
          <p className="text-slate-400 text-sm">
            Learn about {sortedPlayers.length} player{sortedPlayers.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Search */}
        <div className="mb-4 relative">
          <Search className="absolute top-2.5 left-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search players"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Table */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-900">
                <tr>
                  <th 
                    className="px-4 py-3 text-left cursor-pointer hover:bg-slate-700 transition-colors" 
                    onClick={() => handleSort('name')}
                  >
                    <span className="font-semibold text-xs text-slate-400 uppercase tracking-wider">
                      Player <SortIcon columnKey="name" />
                    </span>
                  </th>
                  <th 
                    className="px-4 py-3 text-left cursor-pointer hover:bg-slate-700 transition-colors" 
                    onClick={() => handleSort('team_name')}
                  >
                    <span className="font-semibold text-xs text-slate-400 uppercase tracking-wider">
                      Team <SortIcon columnKey="team_name" />
                    </span>
                  </th>
                  <th 
                    className="px-4 py-3 text-left cursor-pointer hover:bg-slate-700 transition-colors" 
                    onClick={() => handleSort('position')}
                  >
                    <span className="font-semibold text-xs text-slate-400 uppercase tracking-wider">
                      Pos <SortIcon columnKey="position" />
                    </span>
                  </th>
                  <th 
                    className="px-4 py-3 text-right cursor-pointer hover:bg-slate-700 transition-colors" 
                    onClick={() => handleSort('appearances')}
                  >
                    <span className="font-semibold text-xs text-slate-400 uppercase tracking-wider">
                      Apps <SortIcon columnKey="appearances" />
                    </span>
                  </th>
                  <th 
                    className="px-4 py-3 text-right cursor-pointer hover:bg-slate-700 transition-colors" 
                    onClick={() => handleSort('minutesPlayed')}
                  >
                    <span className="font-semibold text-xs text-slate-400 uppercase tracking-wider">
                      Minutes <SortIcon columnKey="minutesPlayed" />
                    </span>
                  </th>
                  <th 
                    className="px-4 py-3 text-right cursor-pointer hover:bg-slate-700 transition-colors" 
                    onClick={() => handleSort('goals')}
                  >
                    <span className="font-semibold text-xs text-slate-400 uppercase tracking-wider">
                      Goals <SortIcon columnKey="goals" />
                    </span>
                  </th>
                  <th 
                    className="px-4 py-3 text-right cursor-pointer hover:bg-slate-700 transition-colors" 
                    onClick={() => handleSort('assists')}
                  >
                    <span className="font-semibold text-xs text-slate-400 uppercase tracking-wider">
                      Assists <SortIcon columnKey="assists" />
                    </span>
                  </th>
                  <th 
                    className="px-4 py-3 text-right cursor-pointer hover:bg-slate-700 transition-colors" 
                    onClick={() => handleSort('keyPasses')}
                  >
                    <span className="font-semibold text-xs text-slate-400 uppercase tracking-wider">
                      Key P <SortIcon columnKey="keyPasses" />
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-slate-800 divide-y divide-slate-700">
                {currentPlayers.map((player, index) => (
                  <tr 
                    key={player.id || player.player_id} 
                    className="hover:bg-slate-700/50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <PlayerImage player={player} size="medium" />
                        <span className="font-medium text-sm text-white truncate max-w-[200px]">
                          {player.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-slate-300">{player.team_name}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPositionColor(player.position)}`}>
                        {player.position}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-sm text-slate-200">{player.appearances || 0}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-sm text-slate-400">{player.minutesPlayed || 0}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-sm font-semibold text-slate-200">{player.goals || 0}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-sm font-semibold text-slate-200">{player.assists || 0}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-sm text-slate-200">{player.keyPasses || 0}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sortedPlayers.length === 0 && (
              <div className="text-center py-12 bg-slate-800">
                <p className="text-slate-400">No players found</p>
                <p className="text-slate-500 text-xs mt-1">Try adjusting your search</p>
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 px-1">
            <div className="text-xs text-slate-400">
              {startIndex + 1}-{Math.min(startIndex + playersPerPage, sortedPlayers.length)} of {sortedPlayers.length}
            </div>
            <div className="flex items-center gap-1">
              <button
                className="p-1.5 rounded hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                <ChevronLeft size={18} className="text-slate-300" />
              </button>
              <div className="flex items-center gap-1">
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
                      className={`min-w-[32px] px-2 py-1.5 rounded text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                className="p-1.5 rounded hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                <ChevronRight size={18} className="text-slate-300" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerTable;