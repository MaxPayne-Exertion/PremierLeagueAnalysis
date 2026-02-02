import React, { useState, useEffect } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, 
    LineChart, Line, ScatterChart, Scatter, AreaChart, Area, ComposedChart 
} from 'recharts';
import { TrendingUp, TrendingDown, Award, Target, Shield, Activity, Zap } from 'lucide-react';
import plTrophy from './assets/pltrophy.png';
import faCupTrophy from './assets/facuptrophy.png';
import leagueCupTrophy from './assets/leaguecuptrophy.png';

const StatisticsPage = ({ players = [], teams = [] }) => {
  const [activeView, setActiveView] = useState('player');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statCategory, setStatCategory] = useState('attacking');

  // Safe calculation of league statistics
  const leagueStats = {
    totalGoals: teams.reduce((sum, team) => sum + (team.goals_for || 0), 0),
    totalMatches: teams.reduce((sum, team) => sum + (team.matches_played || 0), 0) / 2,
    avgGoalsPerMatch: teams.length > 0 ?
      (teams.reduce((sum, team) => sum + (team.goals_for || 0), 0) /
        Math.max(teams.reduce((sum, team) => sum + (team.matches_played || 0), 0) / 2, 1)).toFixed(2) : 0,
    totalTeams: teams.length,
    totalPlayers: players.length,
  };

  const filteredPlayers = players.filter(p =>
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.team_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTeams = teams.filter(t =>
    (t.team_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const PlayerImage = ({ player, size = 'large', className = '' }) => {
    const [imageError, setImageError] = useState(false);
    
    const sizeClasses = {
      small: 'w-10 h-10',
      medium: 'w-16 h-16',
      large: 'w-32 h-32'
    };

    const textSizes = {
      small: 'text-sm',
      medium: 'text-xl',
      large: 'text-4xl'
    };

    const imageUrl = player.image_url || (player.player_id 
      ? `https://img.sofascore.com/api/v1/player/${player.player_id}/image`
      : null);

    // Reset error state when player changes
    useEffect(() => {
      setImageError(false);
    }, [player.player_id, player.image_url]);

    const showImage = imageUrl && !imageError;

    return (
      <div className={`${sizeClasses[size]} flex-shrink-0 ${className} relative`}>
        {showImage ? (
          <img
            src={imageUrl}
            alt={player.name || 'Player'}
            className="w-full h-full object-cover rounded-full border-2 border-blue-500"
            onError={() => setImageError(true)}
          />
        ) : (
          <div 
            className={`w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold ${textSizes[size]}`}
          >
            {((player.name || 'U')[0]).toUpperCase()}
          </div>
        )}
      </div>
    );
  };

  const PlayerDetailView = ({ player }) => {
    if (!player) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
          <p className="text-slate-400">Please select a player to view details</p>
        </div>
      );
    }

    const appearances = player.appearances || 0;
    const minutesPlayed = player.minutesPlayed || 0;

    // Calculate per 90 stats
    const per90 = (stat) => minutesPlayed > 0 ? ((stat / minutesPlayed) * 90).toFixed(2) : '0.00';
    const perGame = (stat) => appearances > 0 ? (stat / appearances).toFixed(2) : '0.00';

    // Attacking stats for radar
    const attackingRadar = [
      { category: 'Goals', value: player.goals || 0, fullMark: Math.max(...players.map(p => p.goals || 0), 1) },
      { category: 'Assists', value: player.assists || 0, fullMark: Math.max(...players.map(p => p.assists || 0), 1) },
      { category: 'xG', value: player.expectedGoals || 0, fullMark: Math.max(...players.map(p => p.expectedGoals || 0), 1) },
      { category: 'Shots on Target', value: player.shotsOnTarget || 0, fullMark: Math.max(...players.map(p => p.shotsOnTarget || 0), 1) },
      { category: 'Key Passes', value: player.keyPasses || 0, fullMark: Math.max(...players.map(p => p.keyPasses || 0), 1) },
      { category: 'Dribbles', value: player.successfulDribbles || 0, fullMark: Math.max(...players.map(p => p.successfulDribbles || 0), 1) },
    ];

    // Defensive stats for radar
    const defensiveRadar = [
      { category: 'Tackles', value: player.tackles || 0, fullMark: Math.max(...players.map(p => p.tackles || 0), 1) },
      { category: 'Interceptions', value: player.interceptions || 0, fullMark: Math.max(...players.map(p => p.interceptions || 0), 1) },
      { category: 'Clearances', value: player.clearances || 0, fullMark: Math.max(...players.map(p => p.clearances || 0), 1) },
      { category: 'Duels Won', value: player.totalDuelsWon || 0, fullMark: Math.max(...players.map(p => p.totalDuelsWon || 0), 1) },
      { category: 'Aerial Duels', value: player.aerialDuelsWon || 0, fullMark: Math.max(...players.map(p => p.aerialDuelsWon || 0), 1) },
    ];

    // Passing stats for radar
    const passingRadar = [
      { category: 'Accurate Passes', value: player.accuratePasses || 0, fullMark: Math.max(...players.map(p => p.accuratePasses || 0), 1) },
      { category: 'Key Passes', value: player.keyPasses || 0, fullMark: Math.max(...players.map(p => p.keyPasses || 0), 1) },
      { category: 'Final 3rd Passes', value: player.accurateFinalThirdPasses || 0, fullMark: Math.max(...players.map(p => p.accurateFinalThirdPasses || 0), 1) },
      { category: 'Long Balls', value: player.accurateLongBalls || 0, fullMark: Math.max(...players.map(p => p.accurateLongBalls || 0), 1) },
      { category: 'Crosses', value: player.accurateCrosses || 0, fullMark: Math.max(...players.map(p => p.accurateCrosses || 0), 1) },
    ];

    // Goalkeeper stats for radar
    const gkRadar = [
      { category: 'Saves', value: player.saves || 0, fullMark: Math.max(...players.map(p => p.saves || 0), 1) },
      { category: 'High Claims', value: player.highClaims || 0, fullMark: Math.max(...players.map(p => p.highClaims || 0), 1) },
      { category: 'Punches', value: player.punches || 0, fullMark: Math.max(...players.map(p => p.punches || 0), 1) },
      { category: 'Runs Out', value: player.runsOut || 0, fullMark: Math.max(...players.map(p => p.runsOut || 0), 1) },
      { category: 'Successful Runs', value: player.successfulRunsOut || 0, fullMark: Math.max(...players.map(p => p.successfulRunsOut || 0), 1) },
    ];

    const currentRadar = statCategory === 'attacking' ? attackingRadar : 
                        statCategory === 'defensive' ? defensiveRadar :
                        statCategory === 'passing' ? passingRadar : gkRadar;

    // Performance timeline data (simulated - you can replace with actual match data)
    const performanceTimeline = Array.from({ length: Math.min(appearances, 10) }, (_, i) => ({
      match: `M${i + 1}`,
      goals: Math.random() * 2,
      assists: Math.random() * 1.5,
      rating: 6 + Math.random() * 3
    }));

    // Shot accuracy breakdown
    const shotBreakdown = [
      { name: 'On Target', value: player.shotsOnTarget || 0, color: '#10b981' },
      { name: 'Blocked', value: player.blockedShots || 0, color: '#f59e0b' },
      { name: 'Off Target', value: Math.max(0, (player.totalShots || 0) - (player.shotsOnTarget || 0) - (player.blockedShots || 0)), color: '#ef4444' }
    ];

    // Duel statistics
    const duelStats = [
      { name: 'Aerial', won: player.aerialDuelsWon || 0, percentage: player.aerialDuelsWonPercentage || 0 },
      { name: 'Ground', won: player.groundDuelsWon || 0, percentage: player.groundDuelsWonPercentage || 0 },
    ];

    return (
      <div className="space-y-6">
        {/* Player Header */}
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 border border-blue-700 rounded-xl p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10"></div>
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <PlayerImage player={player} size="large" />
              <div>
                <h2 className="text-4xl font-bold text-white mb-2">{player.name || 'Unknown Player'}</h2>
                <p className="text-xl text-blue-300">{player.team_name || 'N/A'}</p>
                <p className="text-slate-300 mt-2">{player.position || 'Position N/A'}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-300">Total Contributions</div>
              <div className="text-5xl font-bold text-yellow-400">{(player.goals || 0) + (player.assists || 0)}</div>
              <div className="text-sm text-slate-400 mt-1">{appearances} Apps • {minutesPlayed}' Mins</div>
            </div>
          </div>
        </div>

        {/* Category Selector */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setStatCategory('attacking')}
            className={`px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
              statCategory === 'attacking' 
                ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            ⚽ Attacking
          </button>
          <button
            onClick={() => setStatCategory('defensive')}
            className={`px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
              statCategory === 'defensive' 
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            🛡️ Defensive
          </button>
          <button
            onClick={() => setStatCategory('passing')}
            className={`px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
              statCategory === 'passing' 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            🎯 Passing
          </button>
          <button
            onClick={() => setStatCategory('goalkeeper')}
            className={`px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
              statCategory === 'goalkeeper' 
                ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            🧤 Goalkeeper
          </button>
        </div>

        {/* Attacking Stats */}
        {statCategory === 'attacking' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="bg-gradient-to-br from-yellow-900/30 to-slate-800 border border-yellow-500/30 rounded-lg p-4">
                <div className="text-slate-400 text-xs mb-1">Goals</div>
                <div className="text-3xl font-bold text-yellow-400">{player.goals || 0}</div>
                <div className="text-xs text-slate-500 mt-1">{perGame(player.goals || 0)} per game</div>
              </div>
              <div className="bg-gradient-to-br from-blue-900/30 to-slate-800 border border-blue-500/30 rounded-lg p-4">
                <div className="text-slate-400 text-xs mb-1">Assists</div>
                <div className="text-3xl font-bold text-blue-400">{player.assists || 0}</div>
                <div className="text-xs text-slate-500 mt-1">{perGame(player.assists || 0)} per game</div>
              </div>
              <div className="bg-gradient-to-br from-green-900/30 to-slate-800 border border-green-500/30 rounded-lg p-4">
                <div className="text-slate-400 text-xs mb-1">Expected Goals (xG)</div>
                <div className="text-3xl font-bold text-green-400">{(player.expectedGoals || 0).toFixed(2)}</div>
                <div className="text-xs text-slate-500 mt-1">{per90(player.expectedGoals || 0)} per 90</div>
              </div>
              <div className="bg-gradient-to-br from-purple-900/30 to-slate-800 border border-purple-500/30 rounded-lg p-4">
                <div className="text-slate-400 text-xs mb-1">Pass to Assist</div>
                <div className="text-3xl font-bold text-purple-400">{(player.passToAssist || 0)}</div>
                <div className="text-xs text-slate-500 mt-1">{per90(player.passToAssist || 0)} per 90</div>
              </div>
              <div className="bg-gradient-to-br from-orange-900/30 to-slate-800 border border-orange-500/30 rounded-lg p-4">
                <div className="text-slate-400 text-xs mb-1">Total Shots</div>
                <div className="text-3xl font-bold text-orange-400">{player.totalShots || 0}</div>
                <div className="text-xs text-slate-500 mt-1">{per90(player.totalShots || 0)} per 90</div>
              </div>
              <div className="bg-gradient-to-br from-pink-900/30 to-slate-800 border border-pink-500/30 rounded-lg p-4">
                <div className="text-slate-400 text-xs mb-1">Shots on Target</div>
                <div className="text-3xl font-bold text-pink-400">{player.shotsOnTarget || 0}</div>
                <div className="text-xs text-slate-500 mt-1">{((player.shotsOnTarget || 0) / Math.max(player.totalShots || 1, 1) * 100).toFixed(0)}% accuracy</div>
              </div>
              <div className="bg-gradient-to-br from-teal-900/30 to-slate-800 border border-teal-500/30 rounded-lg p-4">
                <div className="text-slate-400 text-xs mb-1">Goal Conversion</div>
                <div className="text-3xl font-bold text-teal-400">{(player.goalConversionPercentage || 0).toFixed(1)}%</div>
                <div className="text-xs text-slate-500 mt-1">Shot to goal</div>
              </div>
              <div className="bg-gradient-to-br from-red-900/30 to-slate-800 border border-red-500/30 rounded-lg p-4">
                <div className="text-slate-400 text-xs mb-1">Big Chances Missed</div>
                <div className="text-3xl font-bold text-red-400">{player.bigChancesMissed || 0}</div>
                <div className="text-xs text-slate-500 mt-1">{perGame(player.bigChancesMissed || 0)} per game</div>
              </div>
              <div className="bg-gradient-to-br from-gray-900/30 to-slate-800 border border-gray-500/30 rounded-lg p-4">
                <div className="text-slate-400 text-xs mb-1">Offsides</div>
                <div className="text-3xl font-bold text-gray-400">{player.offsides || 0}</div>
                <div className="text-xs text-slate-500 mt-1">{perGame(player.offsides || 0)} per game</div>
              </div>
              <div className="bg-gradient-to-br from-amber-900/30 to-slate-800 border border-amber-500/30 rounded-lg p-4">
                <div className="text-slate-400 text-xs mb-1">Hit Woodwork</div>
                <div className="text-3xl font-bold text-amber-400">{player.hitWoodwork || 0}</div>
                <div className="text-xs text-slate-500 mt-1">Unlucky shots</div>
              </div>
              <div className="bg-gradient-to-br from-indigo-900/30 to-slate-800 border border-indigo-500/30 rounded-lg p-4">
                <div className="text-slate-400 text-xs mb-1">Successful Dribbles</div>
                <div className="text-3xl font-bold text-indigo-400">{player.successfulDribbles || 0}</div>
                <div className="text-xs text-slate-500 mt-1">{(player.successfulDribblesPercentage || 0).toFixed(1)}% success</div>
              </div>
              <div className="bg-gradient-to-br from-cyan-900/30 to-slate-800 border border-cyan-500/30 rounded-lg p-4">
                <div className="text-slate-400 text-xs mb-1">Key Passes</div>
                <div className="text-3xl font-bold text-cyan-400">{player.keyPasses || 0}</div>
                <div className="text-xs text-slate-500 mt-1">{per90(player.keyPasses || 0)} per 90</div>
              </div>
            </div>

            {/* New: Shot Breakdown Pie Chart & Performance Over Time */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Target className="text-green-400" size={24} />
                  Shot Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={shotBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {shotBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Activity className="text-blue-400" size={24} />
                  Recent Performance Trend
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={performanceTimeline}>
                    <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                    <XAxis dataKey="match" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        borderColor: '#475569',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="rating" fill="#8b5cf6" stroke="#8b5cf6" fillOpacity={0.3} name="Rating" />
                    <Bar dataKey="goals" fill="#fbbf24" name="Goals" />
                    <Bar dataKey="assists" fill="#3b82f6" name="Assists" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* Defensive Stats */}
        {statCategory === 'defensive' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="bg-gradient-to-br from-blue-900/30 to-slate-800 border border-blue-500/30 rounded-lg p-4">
                <div className="text-slate-400 text-xs mb-1">Tackles</div>
                <div className="text-3xl font-bold text-blue-400">{player.tackles || 0}</div>
                <div className="text-xs text-slate-500 mt-1">{per90(player.tackles || 0)} per 90</div>
              </div>
              <div className="bg-gradient-to-br from-green-900/30 to-slate-800 border border-green-500/30 rounded-lg p-4">
                <div className="text-slate-400 text-xs mb-1">Interceptions</div>
                <div className="text-3xl font-bold text-green-400">{player.interceptions || 0}</div>
                <div className="text-xs text-slate-500 mt-1">{per90(player.interceptions || 0)} per 90</div>
              </div>
              <div className="bg-gradient-to-br from-purple-900/30 to-slate-800 border border-purple-500/30 rounded-lg p-4">
                <div className="text-slate-400 text-xs mb-1">Clearances</div>
                <div className="text-3xl font-bold text-purple-400">{player.clearances || 0}</div>
                <div className="text-xs text-slate-500 mt-1">{per90(player.clearances || 0)} per 90</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-900/30 to-slate-800 border border-yellow-500/30 rounded-lg p-4">
                <div className="text-slate-400 text-xs mb-1">Total Duels Won</div>
                <div className="text-3xl font-bold text-yellow-400">{player.totalDuelsWon || 0}</div>
                <div className="text-xs text-slate-500 mt-1">{(player.totalDuelsWonPercentage || 0).toFixed(1)}% win rate</div>
              </div>
              <div className="bg-gradient-to-br from-orange-900/30 to-slate-800 border border-orange-500/30 rounded-lg p-4">
                <div className="text-slate-400 text-xs mb-1">Aerial Duels Won</div>
                <div className="text-3xl font-bold text-orange-400">{player.aerialDuelsWon || 0}</div>
                <div className="text-xs text-slate-500 mt-1">{(player.aerialDuelsWonPercentage || 0).toFixed(1)}% win rate</div>
              </div>
              <div className="bg-gradient-to-br from-teal-900/30 to-slate-800 border border-teal-500/30 rounded-lg p-4">
                <div className="text-slate-400 text-xs mb-1">Ground Duels Won</div>
                <div className="text-3xl font-bold text-teal-400">{player.groundDuelsWon || 0}</div>
                <div className="text-xs text-slate-500 mt-1">{(player.groundDuelsWonPercentage || 0).toFixed(1)}% win rate</div>
              </div>
              <div className="bg-gradient-to-br from-red-900/30 to-slate-800 border border-red-500/30 rounded-lg p-4">
                <div className="text-slate-400 text-xs mb-1">Dribbled Past</div>
                <div className="text-3xl font-bold text-red-400">{player.dribbledPast || 0}</div>
                <div className="text-xs text-slate-500 mt-1">{perGame(player.dribbledPast || 0)} per game</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-900/30 to-slate-800 border border-yellow-500/30 rounded-lg p-4">
                <div className="text-slate-400 text-xs mb-1">Yellow Cards</div>
                <div className="text-3xl font-bold text-yellow-300">{player.yellowCards || 0}</div>
                <div className="text-xs text-slate-500 mt-1">Discipline</div>
              </div>
              <div className="bg-gradient-to-br from-red-900/30 to-slate-800 border border-red-500/30 rounded-lg p-4">
                <div className="text-slate-400 text-xs mb-1">Red Cards</div>
                <div className="text-3xl font-bold text-red-500">{player.redCards || 0}</div>
                <div className="text-xs text-slate-500 mt-1">Sent off</div>
              </div>
              <div className="bg-gradient-to-br from-pink-900/30 to-slate-800 border border-pink-500/30 rounded-lg p-4">
                <div className="text-slate-400 text-xs mb-1">Fouls Committed</div>
                <div className="text-3xl font-bold text-pink-400">{player.fouls || 0}</div>
                <div className="text-xs text-slate-500 mt-1">{per90(player.fouls || 0)} per 90</div>
              </div>
              <div className="bg-gradient-to-br from-cyan-900/30 to-slate-800 border border-cyan-500/30 rounded-lg p-4">
                <div className="text-slate-400 text-xs mb-1">Was Fouled</div>
                <div className="text-3xl font-bold text-cyan-400">{player.wasFouled || 0}</div>
                <div className="text-xs text-slate-500 mt-1">{per90(player.wasFouled || 0)} per 90</div>
              </div>
              <div className="bg-gradient-to-br from-gray-900/30 to-slate-800 border border-gray-500/30 rounded-lg p-4">
                <div className="text-slate-400 text-xs mb-1">Dispossessed</div>
                <div className="text-3xl font-bold text-gray-400">{player.dispossessed || 0}</div>
                <div className="text-xs text-slate-500 mt-1">{per90(player.dispossessed || 0)} per 90</div>
              </div>
            </div>

            {/* New: Duel Success Rate Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Shield className="text-blue-400" size={24} />
                  Duel Success Rates
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={duelStats} layout="vertical">
                    <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                    <XAxis type="number" stroke="#94a3b8" domain={[0, 100]} />
                    <YAxis type="category" dataKey="name" stroke="#94a3b8" width={80} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        borderColor: '#475569',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="percentage" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Zap className="text-yellow-400" size={24} />
                  Defensive Actions per 90
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: 'Tackles', value: parseFloat(per90(player.tackles || 0)) },
                    { name: 'Interceptions', value: parseFloat(per90(player.interceptions || 0)) },
                    { name: 'Clearances', value: parseFloat(per90(player.clearances || 0)) },
                  ]}>
                    <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        borderColor: '#475569',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* Passing Stats */}
        {statCategory === 'passing' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-gradient-to-br from-green-900/30 to-slate-800 border border-green-500/30 rounded-lg p-4">
                <div className="text-slate-400 text-xs mb-1">Accurate Passes</div>
                <div className="text-3xl font-bold text-green-400">{player.accuratePasses || 0}</div>
                <div className="text-xs text-slate-500 mt-1">{(player.accuratePassesPercentage || 0).toFixed(1)}% accuracy</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-900/30 to-slate-800 border border-yellow-500/30 rounded-lg p-4">
                <div className="text-slate-400 text-xs mb-1">Key Passes</div>
                <div className="text-3xl font-bold text-yellow-400">{player.keyPasses || 0}</div>
                <div className="text-xs text-slate-500 mt-1">{per90(player.keyPasses || 0)} per 90</div>
              </div>
              <div className="bg-gradient-to-br from-purple-900/30 to-slate-800 border border-purple-500/30 rounded-lg p-4">
                <div className="text-slate-400 text-xs mb-1">Final Third Passes</div>
                <div className="text-3xl font-bold text-purple-400">{player.accurateFinalThirdPasses || 0}</div>
                <div className="text-xs text-slate-500 mt-1">{per90(player.accurateFinalThirdPasses || 0)} per 90</div>
              </div>
              <div className="bg-gradient-to-br from-blue-900/30 to-slate-800 border border-blue-500/30 rounded-lg p-4">
                <div className="text-slate-400 text-xs mb-1">Accurate Crosses</div>
                <div className="text-3xl font-bold text-blue-400">{player.accurateCrosses || 0}</div>
                <div className="text-xs text-slate-500 mt-1">{(player.accurateCrossesPercentage || 0).toFixed(1)}% accuracy</div>
              </div>
              <div className="bg-gradient-to-br from-orange-900/30 to-slate-800 border border-orange-500/30 rounded-lg p-4">
                <div className="text-slate-400 text-xs mb-1">Accurate Long Balls</div>
                <div className="text-3xl font-bold text-orange-400">{player.accurateLongBalls || 0}</div>
                <div className="text-xs text-slate-500 mt-1">{(player.accurateLongBallsPercentage || 0).toFixed(1)}% accuracy</div>
              </div>
            </div>

            {/* New: Passing Accuracy Visualization */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mt-6">
              <h3 className="text-xl font-bold text-white mb-4">Passing Accuracy Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { name: 'Overall', accuracy: player.accuratePassesPercentage || 0 },
                  { name: 'Crosses', accuracy: player.accurateCrossesPercentage || 0 },
                  { name: 'Long Balls', accuracy: player.accurateLongBallsPercentage || 0 },
                ]}>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      borderColor: '#475569',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => `${value.toFixed(1)}%`}
                  />
                  <Bar dataKey="accuracy" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* Goalkeeper Stats */}
        {statCategory === 'goalkeeper' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="bg-gradient-to-br from-green-900/30 to-slate-800 border border-green-500/30 rounded-lg p-4">
                <div className="text-slate-400 text-xs mb-1">Saves</div>
                <div className="text-3xl font-bold text-green-400">{player.saves || 0}</div>
                <div className="text-xs text-slate-500 mt-1">{perGame(player.saves || 0)} per game</div>
              </div>
              <div className="bg-gradient-to-br from-blue-900/30 to-slate-800 border border-blue-500/30 rounded-lg p-4">
                <div className="text-slate-400 text-xs mb-1">Saves (Inside Box)</div>
                <div className="text-3xl font-bold text-blue-400">{player.savedShotsFromInsideTheBox || 0}</div>
                <div className="text-xs text-slate-500 mt-1">Close range</div>
              </div>
              <div className="bg-gradient-to-br from-cyan-900/30 to-slate-800 border border-cyan-500/30 rounded-lg p-4">
                <div className="text-slate-400 text-xs mb-1">Saves (Outside Box)</div>
                <div className="text-3xl font-bold text-cyan-400">{player.savedShotsFromOutsideTheBox || 0}</div>
                <div className="text-xs text-slate-500 mt-1">Long range</div>
              </div>
              <div className="bg-gradient-to-br from-red-900/30 to-slate-800 border border-red-500/30 rounded-lg p-4">
                <div className="text-slate-400 text-xs mb-1">Goals Conceded</div>
                <div className="text-3xl font-bold text-red-400">{player.goalsConceded || 0}</div>
                <div className="text-xs text-slate-500 mt-1">{perGame(player.goalsConceded || 0)} per game</div>
              </div>
              <div className="bg-gradient-to-br from-orange-900/30 to-slate-800 border border-orange-500/30 rounded-lg p-4">
                <div className="text-slate-400 text-xs mb-1">Conceded (Inside Box)</div>
                <div className="text-3xl font-bold text-orange-400">{player.goalsConcededInsideTheBox || 0}</div>
                <div className="text-xs text-slate-500 mt-1">Close range</div>
              </div>
              <div className="bg-gradient-to-br from-purple-900/30 to-slate-800 border border-purple-500/30 rounded-lg p-4">
                <div className="text-slate-400 text-xs mb-1">Conceded (Outside Box)</div>
                <div className="text-3xl font-bold text-purple-400">{player.goalsConcededOutsideTheBox || 0}</div>
                <div className="text-xs text-slate-500 mt-1">Long range</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-900/30 to-slate-800 border border-yellow-500/30 rounded-lg p-4">
                <div className="text-slate-400 text-xs mb-1">High Claims</div>
                <div className="text-3xl font-bold text-yellow-400">{player.highClaims || 0}</div>
                <div className="text-xs text-slate-500 mt-1">{perGame(player.highClaims || 0)} per game</div>
              </div>
              <div className="bg-gradient-to-br from-teal-900/30 to-slate-800 border border-teal-500/30 rounded-lg p-4">
                <div className="text-slate-400 text-xs mb-1">Runs Out</div>
                <div className="text-3xl font-bold text-teal-400">{player.runsOut || 0}</div>
                <div className="text-xs text-slate-500 mt-1">Sweeper keeper</div>
              </div>
              <div className="bg-gradient-to-br from-green-900/30 to-slate-800 border border-green-500/30 rounded-lg p-4">
                <div className="text-slate-400 text-xs mb-1">Successful Runs Out</div>
                <div className="text-3xl font-bold text-green-500">{player.successfulRunsOut || 0}</div>
                <div className="text-xs text-slate-500 mt-1">{((player.successfulRunsOut || 0) / Math.max(player.runsOut || 1, 1) * 100).toFixed(0)}% success</div>
              </div>
              <div className="bg-gradient-to-br from-pink-900/30 to-slate-800 border border-pink-500/30 rounded-lg p-4">
                <div className="text-slate-400 text-xs mb-1">Punches</div>
                <div className="text-3xl font-bold text-pink-400">{player.punches || 0}</div>
                <div className="text-xs text-slate-500 mt-1">{perGame(player.punches || 0)} per game</div>
              </div>
              <div className="bg-gradient-to-br from-red-900/30 to-slate-800 border border-red-500/30 rounded-lg p-4">
                <div className="text-slate-400 text-xs mb-1">Errors → Goal</div>
                <div className="text-3xl font-bold text-red-500">{player.errorLeadToGoal || 0}</div>
                <div className="text-xs text-slate-500 mt-1">Mistakes</div>
              </div>
              <div className="bg-gradient-to-br from-orange-900/30 to-slate-800 border border-orange-500/30 rounded-lg p-4">
                <div className="text-slate-400 text-xs mb-1">Errors → Shot</div>
                <div className="text-3xl font-bold text-orange-500">{player.errorLeadToShot || 0}</div>
                <div className="text-xs text-slate-500 mt-1">Close calls</div>
              </div>
            </div>

            {/* New: GK Save Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Save Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Inside Box', value: player.savedShotsFromInsideTheBox || 0, color: '#3b82f6' },
                        { name: 'Outside Box', value: player.savedShotsFromOutsideTheBox || 0, color: '#10b981' },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {[
                        { color: '#3b82f6' },
                        { color: '#10b981' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Goals Conceded Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Inside Box', value: player.goalsConcededInsideTheBox || 0, color: '#ef4444' },
                        { name: 'Outside Box', value: player.goalsConcededOutsideTheBox || 0, color: '#f59e0b' },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {[
                        { color: '#ef4444' },
                        { color: '#f59e0b' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* Radar Chart */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Performance Radar</h3>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={currentRadar}>
              <PolarGrid stroke="#475569" />
              <PolarAngleAxis dataKey="category" stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <PolarRadiusAxis stroke="#475569" />
              <Radar name={player.name} dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const TeamDetailView = ({ team }) => {
    if (!team) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
          <p className="text-slate-400">Please select a team to view details</p>
        </div>
      );
    }

    const teamPlayers = players.filter(p => p.team_name === team.team_name);
    const matchesPlayed = team.matches_played || 0;

    const teamRadarData = [
      { category: 'Attack', value: matchesPlayed > 0 ? ((team.goals_for || 0) / matchesPlayed) * 10 : 0, fullMark: 30 },
      { category: 'Defense', value: matchesPlayed > 0 ? ((matchesPlayed - (team.goals_against || 0)) / matchesPlayed) * 10 : 0, fullMark: 30 },
      { category: 'Wins', value: team.wins || 0, fullMark: matchesPlayed || 1 },
      { category: 'Points', value: team.points || 0, fullMark: matchesPlayed * 3 || 1 },
    ];

    const formData = [
      { name: 'Wins', value: team.wins || 0, color: '#10b981' },
      { name: 'Draws', value: team.draws || 0, color: '#f59e0b' },
      { name: 'Losses', value: team.losses || 0, color: '#ef4444' }
    ];

    const goalDiff = (team.goals_for || 0) - (team.goals_against || 0);
    const winRate = matchesPlayed > 0 ? (((team.wins || 0) / matchesPlayed) * 100).toFixed(0) : 0;

    // New: xG comparison
    const xgComparison = [
      { name: 'Goals For', actual: team.goals_for || 0, expected: team.xg_for || 0 },
      { name: 'Goals Against', actual: team.goals_against || 0, expected: team.xg_against || 0 },
    ];

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-900 to-blue-900 border border-green-700 rounded-xl p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-blue-600/10"></div>
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {team.logo_url ? (
                <img src={team.logo_url} alt={team.team_name} className="w-20 h-20" />
              ) : (
                <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center text-4xl font-bold">
                  {(team.team_name || 'T')[0]}
                </div>
              )}
              <div>
                <h2 className="text-4xl font-bold text-white mb-2">{team.team_name || 'Unknown Team'}</h2>
                <p className="text-xl text-green-300">
                  League Position: #{team.rank || [...teams].sort((a, b) => (b.points || 0) - (a.points || 0)).findIndex(t => t.id === team.id) + 1}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-300">Points</div>
              <div className="text-5xl font-bold text-yellow-400">{team.points || 0}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-2">Matches Played</div>
            <div className="text-3xl font-bold text-white">{team.matches_played || 0}</div>
          </div>
          <div className="bg-gradient-to-br from-green-900/30 to-slate-800 border border-green-500/30 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-2">Wins</div>
            <div className="text-3xl font-bold text-green-400">{team.wins || 0}</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-900/30 to-slate-800 border border-yellow-500/30 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-2">Draws</div>
            <div className="text-3xl font-bold text-yellow-400">{team.draws || 0}</div>
          </div>
          <div className="bg-gradient-to-br from-red-900/30 to-slate-800 border border-red-500/30 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-2">Losses</div>
            <div className="text-3xl font-bold text-red-400">{team.losses || 0}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-900/30 to-slate-800 border border-green-500/30 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-2">Goals For</div>
            <div className="text-4xl font-bold text-green-400">{team.goals_for || 0}</div>
            <div className="text-sm text-slate-500 mt-1">
              {matchesPlayed > 0 ? ((team.goals_for || 0) / matchesPlayed).toFixed(2) : 0} per game
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-900/30 to-slate-800 border border-red-500/30 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-2">Goals Against</div>
            <div className="text-4xl font-bold text-red-400">{team.goals_against || 0}</div>
            <div className="text-sm text-slate-500 mt-1">
              {matchesPlayed > 0 ? ((team.goals_against || 0) / matchesPlayed).toFixed(2) : 0} per game
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-900/30 to-slate-800 border border-blue-500/30 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-2">Goal Difference</div>
            <div className={`text-4xl font-bold ${goalDiff > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {goalDiff > 0 ? '+' : ''}{goalDiff}
            </div>
            <div className="text-sm text-slate-500 mt-1">Win rate: {winRate}%</div>
          </div>
        </div>

        {/* New: xG Comparison Chart */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Expected Goals (xG) vs Actual</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={xgComparison}>
              <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  borderColor: '#475569',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="actual" name="Actual" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expected" name="Expected (xG)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Team Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={teamRadarData}>
                <PolarGrid stroke="#475569" />
                <PolarAngleAxis dataKey="category" stroke="#94a3b8" />
                <PolarRadiusAxis stroke="#475569" />
                <Radar name={team.team_name} dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Match Results</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={formData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {formData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">🏆 Trophy Cabinet</h3>
            <div className="space-y-4">
              {/* Premier League */}
              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded">
                <div className="flex items-center gap-3">
                  <img 
                    src="./assets/pltrophy.png" 
                    alt="Premier League" 
                    className="w-12 h-12 object-contain" 
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div>
                    <div className="text-white font-medium">Premier League Titles</div>
                    <div className="text-xs text-slate-400">Top tier championships</div>
                  </div>
                </div>
                <div className="text-3xl font-bold text-yellow-400">{team.premier_league_titles || 0}</div>
              </div>

              {/* FA Cup */}
              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded">
                <div className="flex items-center gap-3">
                  <img 
                    src="./assets/facuptrophy.png" 
                    alt="FA Cup" 
                    className="w-12 h-12 object-contain" 
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div>
                    <div className="text-white font-medium">FA Cup Wins</div>
                    <div className="text-xs text-slate-400">Oldest football competition</div>
                  </div>
                </div>
                <div className="text-3xl font-bold text-blue-400">{team.fa_cup_titles || 0}</div>
              </div>

              {/* League Cup */}
              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded">
                <div className="flex items-center gap-3">
                  <img 
                    src="./assets/leaguecuptrophy.png" 
                    alt="League Cup" 
                    className="w-12 h-12 object-contain" 
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div>
                    <div className="text-white font-medium">League Cup Wins</div>
                    <div className="text-xs text-slate-400">EFL Cup victories</div>
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-400">{team.league_cup_titles || 0}</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Club Information</h3>
            <div className="space-y-4">
              <div className="p-3 bg-slate-900/50 rounded">
                <div className="text-sm text-slate-400 mb-1">Manager</div>
                <div className="text-lg font-bold text-white">{team.manager || 'N/A'}</div>
              </div>
              <div className="p-3 bg-slate-900/50 rounded">
                <div className="text-sm text-slate-400 mb-1">Captain</div>
                <div className="text-lg font-bold text-white">{team.captain || 'N/A'}</div>
              </div>
              <div className="p-3 bg-slate-900/50 rounded">
                <div className="text-sm text-slate-400 mb-1">Stadium</div>
                <div className="text-lg font-bold text-white">{team.stadium || 'N/A'}</div>
              </div>
              <div className="p-3 bg-slate-900/50 rounded">
                <div className="text-sm text-slate-400 mb-1">Top Scorer (Season)</div>
                <div className="text-lg font-bold text-white">
                  {teamPlayers.length > 0 ? (
                    <>
                      {teamPlayers.sort((a, b) => (b.goals || 0) - (a.goals || 0))[0].name}
                      <span className="text-green-400 ml-2">
                        ({teamPlayers.sort((a, b) => (b.goals || 0) - (a.goals || 0))[0].goals || 0} goals)
                      </span>
                    </>
                  ) : (
                    'N/A'
                  )}
                </div>
              </div>
              <div className="p-3 bg-slate-900/50 rounded">
                <div className="text-sm text-slate-400 mb-1">Top Scorer (All time)</div>
                <div className="text-lg font-bold text-white">{team.top_scorer_all_time || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>

        {teamPlayers.length > 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Squad Players ({teamPlayers.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-700">
                    <th className="text-left py-3 px-2">Photo</th>
                    <th className="text-left py-3">Player</th>
                    <th className="text-center py-3">Position</th>
                    <th className="text-center py-3">Goals</th>
                    <th className="text-center py-3">Assists</th>
                    <th className="text-center py-3">Apps</th>
                  </tr>
                </thead>
                <tbody>
                  {teamPlayers.sort((a, b) => ((b.goals || 0) + (b.assists || 0)) - ((a.goals || 0) + (a.assists || 0))).map((player, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedPlayer(player);
                        setActiveView('player');
                      }}
                    >
                      <td className="py-3 px-2">
                        <PlayerImage player={player} size="small" />
                      </td>
                      <td className="py-3 text-white font-medium">{player.name || 'Unknown'}</td>
                      <td className="py-3 text-center text-slate-300">{player.position || 'N/A'}</td>
                      <td className="py-3 text-center text-green-400 font-bold">{player.goals || 0}</td>
                      <td className="py-3 text-center text-blue-400 font-bold">{player.assists || 0}</td>
                      <td className="py-3 text-center text-slate-300">{player.appearances || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (players.length === 0 && teams.length === 0) {
    return (
      <div className="w-full min-h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 rounded-lg">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
            <p className="text-slate-400 text-lg">No data available. Please ensure your backend is providing player and team data.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 rounded-lg">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            Statistics Dashboard
          </h1>
          <p className="text-slate-400">Comprehensive player and team performance analysis</p>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => {
              setActiveView('player');
              if (!selectedPlayer && players.length > 0) {
                setSelectedPlayer(players[0]);
              }
            }}
            className={`px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 ${activeView === 'player'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
          >
            Player Stats
          </button>
          <button
            onClick={() => {
              setActiveView('team');
              if (!selectedTeam && teams.length > 0) {
                setSelectedTeam(teams[0]);
              }
            }}
            className={`px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 ${activeView === 'team'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
          >
            Team Stats
          </button>
        </div>

        {(activeView === 'player' || activeView === 'team') && (
          <div className="mb-6">
            <input
              type="text"
              placeholder={`Search ${activeView === 'player' ? 'players' : 'teams'}...`}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (activeView === 'player' && filteredPlayers.length > 0) {
                  setSelectedPlayer(filteredPlayers[0]);
                } else if (activeView === 'team' && filteredTeams.length > 0) {
                  setSelectedTeam(filteredTeams[0]);
                }
              }}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {activeView === 'player' && <PlayerDetailView player={selectedPlayer} />}
        {activeView === 'team' && <TeamDetailView team={selectedTeam} />}
      </div>
    </div>
  );
};

export default StatisticsPage;