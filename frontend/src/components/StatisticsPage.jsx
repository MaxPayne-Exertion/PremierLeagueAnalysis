import React, { useState, useEffect } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, 
    LineChart, Line, ScatterChart, Scatter, AreaChart, Area, ComposedChart 
} from 'recharts';
import { TrendingUp, TrendingDown, Award, Target, Shield, Activity, Zap, ChevronDown } from 'lucide-react';

const StatisticsPage = ({ players = [], teams = [] }) => {
  const [activeView, setActiveView] = useState('player');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statCategory, setStatCategory] = useState('overview');
  const [showPlayerList, setShowPlayerList] = useState(false);

  const filteredPlayers = players.filter(p =>
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.team_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTeams = teams.filter(t =>
    (t.team_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Player image component
  const PlayerImage = ({ player, size = 'large', className = '' }) => {
    const [imageError, setImageError] = useState(false);
    
    const sizeClasses = {
      small: 'w-10 h-10',
      medium: 'w-16 h-16',
      large: 'w-24 h-24'
    };

    const textSizes = {
      small: 'text-sm',
      medium: 'text-xl',
      large: 'text-3xl'
    };

    const imageUrl = player.image_url || (player.player_id 
      ? `https://img.sofascore.com/api/v1/player/${player.player_id}/image`
      : null);

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
            className="w-full h-full object-cover rounded-full"
            onError={() => setImageError(true)}
          />
        ) : (
          <div 
            className={`w-full h-full bg-slate-600 rounded-full flex items-center justify-center text-white font-semibold ${textSizes[size]}`}
          >
            {((player.name || 'U')[0]).toUpperCase()}
          </div>
        )}
      </div>
    );
  };

  // Stat card component - simpler, cleaner
  const StatCard = ({ label, value, subtext, color = 'slate' }) => {
    const colorClasses = {
      slate: 'text-slate-200',
      green: 'text-green-400',
      blue: 'text-blue-400',
      yellow: 'text-yellow-400',
      red: 'text-red-400',
      purple: 'text-purple-400'
    };

    return (
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">{label}</div>
        <div className={`text-2xl font-bold ${colorClasses[color]}`}>{value}</div>
        {subtext && <div className="text-slate-500 text-xs mt-1">{subtext}</div>}
      </div>
    );
  };

  const PlayerDetailView = ({ player }) => {
    if (!player) {
      return (
        <div className="bg-slate-800 rounded-lg p-12 text-center border border-slate-700">
          <p className="text-slate-400">Select a player to view statistics</p>
        </div>
      );
    }

    const appearances = player.appearances || 0;
    const minutesPlayed = player.minutesPlayed || 0;

    const per90 = (stat) => minutesPlayed > 0 ? ((stat / minutesPlayed) * 90).toFixed(2) : '0.00';
    const perGame = (stat) => appearances > 0 ? (stat / appearances).toFixed(2) : '0.00';

    // Overview stats
    const overviewStats = [
      { label: 'Appearances', value: appearances, color: 'slate', subtext: "Played" },
      { label: 'Goals', value: player.goals || 0, subtext: `${perGame(player.goals || 0)} per game`, color: 'green' },
      { label: 'Assists', value: player.assists || 0, subtext: `${perGame(player.assists || 0)} per game`, color: 'blue' },
      { label: 'Minutes', value: minutesPlayed, subtext: `${appearances > 0 ? Math.round(minutesPlayed / appearances) : 0} per game`, color: 'slate' },
    ];

    // Attack stats - ALL original stats included
    const attackStats = [
      { label: 'Goals', value: player.goals || 0, subtext: `${per90(player.goals || 0)} per 90`, color: 'green' },
      { label: 'Assists', value: player.assists || 0, subtext: `${per90(player.assists || 0)} per 90`, color: 'blue' },
      { label: 'Pass to Assist', value: player.passToAssist || 0, subtext: `${per90(player.passToAssist || 0)} per 90`, color: 'purple' },
      { label: 'Total Shots', value: player.totalShots || 0, subtext: `${per90(player.totalShots || 0)} per 90`, color: 'slate' },
      { label: 'Shots on Target', value: player.shotsOnTarget || 0, subtext: `${player.totalShots > 0 ? ((player.shotsOnTarget / player.totalShots) * 100).toFixed(0) : 0}% accuracy`, color: 'yellow' },
      { label: 'Goal Conversion', value: `${(player.goalConversionPercentage || 0).toFixed(1)}%`, subtext: 'Shot to goal', color: 'purple' },
      { label: 'Big Chances Missed', value: player.bigChancesMissed || 0, subtext: `${perGame(player.bigChancesMissed || 0)} per game`, color: 'red' },
      { label: 'Offsides', value: player.offsides || 0, subtext: `${perGame(player.offsides || 0)} per game`, color: 'slate' },
      { label: 'Hit Woodwork', value: player.hitWoodwork || 0, subtext: 'Unlucky shots', color: 'yellow' },
      { label: 'Successful Dribbles', value: player.successfulDribbles || 0, subtext: `${(player.successfulDribblesPercentage || 0).toFixed(1)}% success`, color: 'blue' },
      { label: 'Key Passes', value: player.keyPasses || 0, subtext: `${per90(player.keyPasses || 0)} per 90`, color: 'blue' },
    ];

    // Defense stats - ALL original stats
    const defenseStats = [
      { label: 'Tackles', value: player.tackles || 0, subtext: `${per90(player.tackles || 0)} per 90`, color: 'blue' },
      { label: 'Interceptions', value: player.interceptions || 0, subtext: `${per90(player.interceptions || 0)} per 90`, color: 'green' },
      { label: 'Clearances', value: player.clearances || 0, subtext: `${per90(player.clearances || 0)} per 90`, color: 'purple' },
      { label: 'Total Duels Won', value: player.totalDuelsWon || 0, subtext: `${(player.totalDuelsWonPercentage || 0).toFixed(1)}% win rate`, color: 'yellow' },
      { label: 'Aerial Duels Won', value: player.aerialDuelsWon || 0, subtext: `${(player.aerialDuelsWonPercentage || 0).toFixed(1)}% win rate`, color: 'yellow' },
      { label: 'Ground Duels Won', value: player.groundDuelsWon || 0, subtext: `${(player.groundDuelsWonPercentage || 0).toFixed(1)}% win rate`, color: 'slate' },
      { label: 'Dribbled Past', value: player.dribbledPast || 0, subtext: `${perGame(player.dribbledPast || 0)} per game`, color: 'red' },
      { label: 'Yellow Cards', value: player.yellowCards || 0, subtext: 'Discipline', color: 'yellow' },
      { label: 'Red Cards', value: player.redCards || 0, subtext: 'Sent off', color: 'red' },
      { label: 'Fouls Committed', value: player.fouls || 0, subtext: `${per90(player.fouls || 0)} per 90`, color: 'red' },
      { label: 'Was Fouled', value: player.wasFouled || 0, subtext: `${per90(player.wasFouled || 0)} per 90`, color: 'blue' },
      { label: 'Dispossessed', value: player.dispossessed || 0, subtext: `${per90(player.dispossessed || 0)} per 90`, color: 'red' },
    ];

    // Passing stats - ALL original stats
    const passingStats = [
      { label: 'Accurate Passes', value: player.accuratePasses || 0, subtext: `${(player.accuratePassesPercentage || 0).toFixed(1)}% accuracy`, color: 'green' },
      { label: 'Key Passes', value: player.keyPasses || 0, subtext: `${per90(player.keyPasses || 0)} per 90`, color: 'blue' },
      { label: 'Final Third Passes', value: player.accurateFinalThirdPasses || 0, subtext: `${per90(player.accurateFinalThirdPasses || 0)} per 90`, color: 'purple' },
      { label: 'Accurate Crosses', value: player.accurateCrosses || 0, subtext: `${(player.accurateCrossesPercentage || 0).toFixed(1)}% accuracy`, color: 'yellow' },
      { label: 'Accurate Long Balls', value: player.accurateLongBalls || 0, subtext: `${(player.accurateLongBallsPercentage || 0).toFixed(1)}% accuracy`, color: 'slate' },
    ];

    // Goalkeeper stats - ALL original stats
    const goalkeeperStats = [
      { label: 'Saves', value: player.saves || 0, subtext: `${perGame(player.saves || 0)} per game`, color: 'green' },
      { label: 'Saves (Inside Box)', value: player.savedShotsFromInsideTheBox || 0, subtext: 'Close range', color: 'blue' },
      { label: 'Saves (Outside Box)', value: player.savedShotsFromOutsideTheBox || 0, subtext: 'Long range', color: 'blue' },
      { label: 'Goals Conceded', value: player.goalsConceded || 0, subtext: `${perGame(player.goalsConceded || 0)} per game`, color: 'red' },
      { label: 'Conceded (Inside Box)', value: player.goalsConcededInsideTheBox || 0, subtext: 'Close range', color: 'red' },
      { label: 'Conceded (Outside Box)', value: player.goalsConcededOutsideTheBox || 0, subtext: 'Long range', color: 'red' },
      { label: 'High Claims', value: player.highClaims || 0, subtext: `${perGame(player.highClaims || 0)} per game`, color: 'yellow' },
      { label: 'Runs Out', value: player.runsOut || 0, subtext: 'Sweeper keeper', color: 'purple' },
      { label: 'Successful Runs Out', value: player.successfulRunsOut || 0, subtext: `${player.runsOut > 0 ? ((player.successfulRunsOut / player.runsOut) * 100).toFixed(0) : 0}% success`, color: 'green' },
      { label: 'Punches', value: player.punches || 0, subtext: `${perGame(player.punches || 0)} per game`, color: 'slate' },
      { label: 'Errors → Goal', value: player.errorLeadToGoal || 0, subtext: 'Mistakes', color: 'red' },
      { label: 'Errors → Shot', value: player.errorLeadToShot || 0, subtext: 'Close calls', color: 'yellow' },
    ];

    const getCurrentStats = () => {
      switch (statCategory) {
        case 'attack': return attackStats;
        case 'defense': return defenseStats;
        case 'passing': return passingStats;
        case 'goalkeeper': return goalkeeperStats;
        default: return overviewStats;
      }
    };

    return (
      <div className="space-y-4">
        {/* Player header */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-start gap-4">
            <PlayerImage player={player} size="large" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">{player.name || 'Unknown Player'}</h2>
              <p className="text-slate-400 mb-2">{player.team_name || 'No Team'}</p>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-slate-300">{player.position || 'N/A'}</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">{appearances} appearances</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-yellow-400">{(player.goals || 0) + (player.assists || 0)}</div>
              <div className="text-slate-400 text-sm">G+A</div>
            </div>
          </div>
        </div>

        {/* Category tabs */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-1 flex gap-1 overflow-x-auto">
          {['overview', 'attack', 'defense', 'passing', 'goalkeeper'].map((cat) => (
            <button
              key={cat}
              onClick={() => setStatCategory(cat)}
              className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors whitespace-nowrap ${
                statCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {getCurrentStats().map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>

        {/* Radar Charts */}
        {statCategory === 'attack' && (
          <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
            <h3 className="text-white font-semibold mb-4 text-sm">Attacking Performance Radar</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={[
                { category: 'Goals', value: player.goals || 0, fullMark: Math.max(...players.map(p => p.goals || 0), 1) },
                { category: 'Assists', value: player.assists || 0, fullMark: Math.max(...players.map(p => p.assists || 0), 1) },
                { category: 'Shots on Target', value: player.shotsOnTarget || 0, fullMark: Math.max(...players.map(p => p.shotsOnTarget || 0), 1) },
                { category: 'Key Passes', value: player.keyPasses || 0, fullMark: Math.max(...players.map(p => p.keyPasses || 0), 1) },
                { category: 'Dribbles', value: player.successfulDribbles || 0, fullMark: Math.max(...players.map(p => p.successfulDribbles || 0), 1) },
              ]}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="category" stroke="#94a3b8" style={{ fontSize: '11px' }} />
                <PolarRadiusAxis stroke="#334155" />
                <Radar name={player.name} dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '6px'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {statCategory === 'defense' && (
          <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
            <h3 className="text-white font-semibold mb-4 text-sm">Defensive Performance Radar</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={[
                { category: 'Tackles', value: player.tackles || 0, fullMark: Math.max(...players.map(p => p.tackles || 0), 1) },
                { category: 'Interceptions', value: player.interceptions || 0, fullMark: Math.max(...players.map(p => p.interceptions || 0), 1) },
                { category: 'Clearances', value: player.clearances || 0, fullMark: Math.max(...players.map(p => p.clearances || 0), 1) },
                { category: 'Duels Won', value: player.totalDuelsWon || 0, fullMark: Math.max(...players.map(p => p.totalDuelsWon || 0), 1) },
                { category: 'Aerial Duels', value: player.aerialDuelsWon || 0, fullMark: Math.max(...players.map(p => p.aerialDuelsWon || 0), 1) },
              ]}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="category" stroke="#94a3b8" style={{ fontSize: '11px' }} />
                <PolarRadiusAxis stroke="#334155" />
                <Radar name={player.name} dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '6px'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {statCategory === 'passing' && (
          <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
            <h3 className="text-white font-semibold mb-4 text-sm">Passing Performance Radar</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={[
                { category: 'Accurate Passes', value: player.accuratePasses || 0, fullMark: Math.max(...players.map(p => p.accuratePasses || 0), 1) },
                { category: 'Key Passes', value: player.keyPasses || 0, fullMark: Math.max(...players.map(p => p.keyPasses || 0), 1) },
                { category: 'Final 3rd Passes', value: player.accurateFinalThirdPasses || 0, fullMark: Math.max(...players.map(p => p.accurateFinalThirdPasses || 0), 1) },
                { category: 'Long Balls', value: player.accurateLongBalls || 0, fullMark: Math.max(...players.map(p => p.accurateLongBalls || 0), 1) },
                { category: 'Crosses', value: player.accurateCrosses || 0, fullMark: Math.max(...players.map(p => p.accurateCrosses || 0), 1) },
              ]}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="category" stroke="#94a3b8" style={{ fontSize: '11px' }} />
                <PolarRadiusAxis stroke="#334155" />
                <Radar name={player.name} dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '6px'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {statCategory === 'goalkeeper' && (
          <>
            <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
              <h3 className="text-white font-semibold mb-4 text-sm">Goalkeeper Performance Radar</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={[
                  { category: 'Saves', value: player.saves || 0, fullMark: Math.max(...players.map(p => p.saves || 0), 1) },
                  { category: 'High Claims', value: player.highClaims || 0, fullMark: Math.max(...players.map(p => p.highClaims || 0), 1) },
                  { category: 'Punches', value: player.punches || 0, fullMark: Math.max(...players.map(p => p.punches || 0), 1) },
                  { category: 'Runs Out', value: player.runsOut || 0, fullMark: Math.max(...players.map(p => p.runsOut || 0), 1) },
                  { category: 'Successful Runs', value: player.successfulRunsOut || 0, fullMark: Math.max(...players.map(p => p.successfulRunsOut || 0), 1) },
                ]}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="category" stroke="#94a3b8" style={{ fontSize: '11px' }} />
                  <PolarRadiusAxis stroke="#334155" />
                  <Radar name={player.name} dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '6px'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* GK specific charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
                <h3 className="text-white font-semibold mb-4 text-sm">Save Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Inside Box', value: player.savedShotsFromInsideTheBox || 0, color: '#3b82f6' },
                        { name: 'Outside Box', value: player.savedShotsFromOutsideTheBox || 0, color: '#22c55e' },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="value"
                    >
                      {[{ color: '#3b82f6' }, { color: '#22c55e' }].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #334155',
                        borderRadius: '6px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
                <h3 className="text-white font-semibold mb-4 text-sm">Goals Conceded Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Inside Box', value: player.goalsConcededInsideTheBox || 0, color: '#ef4444' },
                        { name: 'Outside Box', value: player.goalsConcededOutsideTheBox || 0, color: '#f59e0b' },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="value"
                    >
                      {[{ color: '#ef4444' }, { color: '#f59e0b' }].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #334155',
                        borderRadius: '6px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* Additional charts for attack view */}
        {statCategory === 'attack' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
              <h3 className="text-white font-semibold mb-4 text-sm">Shot Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'On Target', value: player.shotsOnTarget || 0, color: '#22c55e' },
                      { name: 'Blocked', value: player.blockedShots || 0, color: '#f59e0b' },
                      { name: 'Off Target', value: Math.max(0, (player.totalShots || 0) - (player.shotsOnTarget || 0) - (player.blockedShots || 0)), color: '#ef4444' }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                  >
                    {[{ color: '#22c55e' }, { color: '#f59e0b' }, { color: '#ef4444' }].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '6px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
              <h3 className="text-white font-semibold mb-4 text-sm">Goals & Assists</h3>
              <div className="h-[250px] flex items-center justify-center">
                <div className="space-y-4 w-full max-w-xs">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-400 text-sm">Goals</span>
                      <span className="text-white font-semibold">{player.goals || 0}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all" 
                        style={{ width: `${Math.min(((player.goals || 0) / Math.max(...players.map(p => p.goals || 0), 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-400 text-sm">Assists</span>
                      <span className="text-white font-semibold">{player.assists || 0}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all" 
                        style={{ width: `${Math.min(((player.assists || 0) / Math.max(...players.map(p => p.assists || 0), 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-400 text-sm">Shots on Target</span>
                      <span className="text-white font-semibold">{player.shotsOnTarget || 0}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full transition-all" 
                        style={{ width: `${Math.min(((player.shotsOnTarget || 0) / Math.max(...players.map(p => p.shotsOnTarget || 0), 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Defense charts */}
        {statCategory === 'defense' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
              <h3 className="text-white font-semibold mb-4 text-sm">Duel Success Rates</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={[
                  { name: 'Aerial', percentage: player.aerialDuelsWonPercentage || 0, won: player.aerialDuelsWon || 0 },
                  { name: 'Ground', percentage: player.groundDuelsWonPercentage || 0, won: player.groundDuelsWon || 0 },
                ]} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" stroke="#94a3b8" domain={[0, 100]} style={{ fontSize: '12px' }} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" width={80} style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '6px'
                    }}
                  />
                  <Bar dataKey="percentage" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
              <h3 className="text-white font-semibold mb-4 text-sm">Defensive Actions per 90</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={[
                  { name: 'Tackles', value: parseFloat(per90(player.tackles || 0)) },
                  { name: 'Interceptions', value: parseFloat(per90(player.interceptions || 0)) },
                  { name: 'Clearances', value: parseFloat(per90(player.clearances || 0)) },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '6px'
                    }}
                  />
                  <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Passing chart */}
        {statCategory === 'passing' && (
          <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
            <h3 className="text-white font-semibold mb-4 text-sm">Passing Accuracy</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={[
                { name: 'Overall', accuracy: player.accuratePassesPercentage || 0 },
                { name: 'Crosses', accuracy: player.accurateCrossesPercentage || 0 },
                { name: 'Long Balls', accuracy: player.accurateLongBallsPercentage || 0 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <YAxis stroke="#94a3b8" domain={[0, 100]} style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '6px'
                  }}
                  formatter={(value) => `${value.toFixed(1)}%`}
                />
                <Bar dataKey="accuracy" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  };

  const TeamDetailView = ({ team }) => {
    if (!team) {
      return (
        <div className="bg-slate-800 rounded-lg p-12 text-center border border-slate-700">
          <p className="text-slate-400">Select a team to view statistics</p>
        </div>
      );
    }

    const teamPlayers = players.filter(p => p.team_name === team.team_name);
    const matchesPlayed = team.matches_played || 0;
    const goalDiff = (team.goals_for || 0) - (team.goals_against || 0);
    const winRate = matchesPlayed > 0 ? (((team.wins || 0) / matchesPlayed) * 100).toFixed(0) : 0;

    const formData = [
      { name: 'Wins', value: team.wins || 0, color: '#22c55e' },
      { name: 'Draws', value: team.draws || 0, color: '#f59e0b' },
      { name: 'Losses', value: team.losses || 0, color: '#ef4444' }
    ];

    return (
      <div className="space-y-4">
        {/* Team header */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-start gap-4">
            {team.logo_url ? (
              <img src={team.logo_url} alt={team.team_name} className="w-20 h-20 object-contain" />
            ) : (
              <div className="w-20 h-20 bg-slate-700 rounded-lg flex items-center justify-center text-3xl font-bold text-white">
                {(team.team_name || 'T')[0]}
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">{team.team_name || 'Unknown Team'}</h2>
              <p className="text-slate-400 mb-2">Premier League</p>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-slate-300">Position: #{team.rank || '?'}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-yellow-400">{team.points || 0}</div>
              <div className="text-slate-400 text-sm">Points</div>
            </div>
          </div>
        </div>

        {/* Match stats */}
        <div className="grid grid-cols-4 gap-3">
          <StatCard label="Played" value={matchesPlayed} color="slate" />
          <StatCard label="Won" value={team.wins || 0} color="green" />
          <StatCard label="Draw" value={team.draws || 0} color="yellow" />
          <StatCard label="Lost" value={team.losses || 0} color="red" />
        </div>

        {/* Goals */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard 
            label="Goals For" 
            value={team.goals_for || 0} 
            subtext={`${matchesPlayed > 0 ? ((team.goals_for || 0) / matchesPlayed).toFixed(1) : 0} per game`}
            color="green" 
          />
          <StatCard 
            label="Goals Against" 
            value={team.goals_against || 0} 
            subtext={`${matchesPlayed > 0 ? ((team.goals_against || 0) / matchesPlayed).toFixed(1) : 0} per game`}
            color="red" 
          />
          <StatCard 
            label="Goal Diff" 
            value={goalDiff > 0 ? `+${goalDiff}` : goalDiff} 
            subtext={`${winRate}% win rate`}
            color={goalDiff > 0 ? 'green' : 'red'} 
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
            <h3 className="text-white font-semibold mb-4 text-sm">Team Performance Radar</h3>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={[
                { category: 'Attack', value: matchesPlayed > 0 ? ((team.goals_for || 0) / matchesPlayed) * 10 : 0, fullMark: 30 },
                { category: 'Defense', value: matchesPlayed > 0 ? ((matchesPlayed - (team.goals_against || 0)) / matchesPlayed) * 10 : 0, fullMark: 30 },
                { category: 'Wins', value: team.wins || 0, fullMark: matchesPlayed || 1 },
                { category: 'Points', value: team.points || 0, fullMark: matchesPlayed * 3 || 1 },
              ]}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="category" stroke="#94a3b8" style={{ fontSize: '11px' }} />
                <PolarRadiusAxis stroke="#334155" />
                <Radar name={team.team_name} dataKey="value" stroke="#22c55e" fill="#22c55e" fillOpacity={0.5} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '6px'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
            <h3 className="text-white font-semibold mb-4 text-sm">Form</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={formData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                >
                  {formData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '6px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Goals chart */}
        <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
          <h3 className="text-white font-semibold mb-4 text-sm">Goals</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[
              { name: 'For', value: team.goals_for || 0 },
              { name: 'Against', value: team.goals_against || 0 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '6px'
                }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Team info and trophies */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
            <h3 className="text-white font-semibold mb-4">Team Information</h3>
            <div className="space-y-3">
              <div>
                <div className="text-slate-400 text-xs mb-1">Manager</div>
                <div className="text-white text-sm font-medium">{team.manager || 'N/A'}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs mb-1">Stadium</div>
                <div className="text-white text-sm font-medium">{team.stadium || 'N/A'}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs mb-1">Captain</div>
                <div className="text-white text-sm font-medium">{team.captain || 'N/A'}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs mb-1">Top Scorer (Season)</div>
                <div className="text-white text-sm font-medium">
                  {teamPlayers.length > 0 
                    ? `${teamPlayers.sort((a, b) => (b.goals || 0) - (a.goals || 0))[0].name} (${teamPlayers.sort((a, b) => (b.goals || 0) - (a.goals || 0))[0].goals || 0})`
                    : 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-slate-400 text-xs mb-1">Top Scorer (All Time)</div>
                <div className="text-white text-sm font-medium">{team.top_scorer_all_time || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
            <h3 className="text-white font-semibold mb-4">Trophy Cabinet</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                <div>
                  <div className="text-white text-sm font-medium">Premier League</div>
                  <div className="text-xs text-slate-400">Top tier titles</div>
                </div>
                <div className="text-2xl font-bold text-yellow-400">{team.premier_league_titles || 0}</div>
              </div>

              <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                <div>
                  <div className="text-white text-sm font-medium">FA Cup</div>
                  <div className="text-xs text-slate-400">Cup wins</div>
                </div>
                <div className="text-2xl font-bold text-blue-400">{team.fa_cup_titles || 0}</div>
              </div>

              <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                <div>
                  <div className="text-white text-sm font-medium">League Cup</div>
                  <div className="text-xs text-slate-400">EFL Cup victories</div>
                </div>
                <div className="text-2xl font-bold text-green-400">{team.league_cup_titles || 0}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Squad */}
        {teamPlayers.length > 0 && (
          <div className="bg-slate-800 rounded-lg border border-slate-700">
            <div className="p-5 border-b border-slate-700">
              <h3 className="text-white font-semibold">Squad ({teamPlayers.length})</h3>
            </div>
            <div className="divide-y divide-slate-700 max-h-[600px] overflow-y-auto">
              {teamPlayers
                .sort((a, b) => ((b.goals || 0) + (b.assists || 0)) - ((a.goals || 0) + (a.assists || 0)))
                .map((p, idx) => (
                  <div
                    key={idx}
                    className="p-4 hover:bg-slate-700/50 cursor-pointer transition-colors flex items-center gap-3"
                    onClick={() => {
                      setSelectedPlayer(p);
                      setActiveView('player');
                    }}
                  >
                    <PlayerImage player={p} size="small" />
                    <div className="flex-1">
                      <div className="text-white font-medium text-sm">{p.name}</div>
                      <div className="text-slate-400 text-xs">{p.position || 'N/A'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white text-sm font-semibold">{(p.goals || 0) + (p.assists || 0)}</div>
                      <div className="text-slate-400 text-xs">G+A</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (players.length === 0 && teams.length === 0) {
    return (
      <div className="w-full min-h-screen bg-slate-900 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-slate-800 rounded-lg p-12 text-center border border-slate-700">
            <p className="text-slate-400">No data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-900 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-yellow-400 mb-1">Stats Hub</h1>
          <p className="text-slate-400 text-sm">Player and Team Stats Hub</p>
        </div>

        {/* View toggle */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-1 flex gap-1 mb-4">
          <button
            onClick={() => {
              setActiveView('player');
              if (!selectedPlayer && players.length > 0) {
                setSelectedPlayer(players[0]);
              }
            }}
            className={`flex-1 py-2.5 px-4 rounded text-sm font-medium transition-colors ${
              activeView === 'player'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            Players
          </button>
          <button
            onClick={() => {
              setActiveView('team');
              if (!selectedTeam && teams.length > 0) {
                setSelectedTeam(teams[0]);
              }
            }}
            className={`flex-1 py-2.5 px-4 rounded text-sm font-medium transition-colors ${
              activeView === 'team'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            Teams
          </button>
        </div>

        {/* Search & Select */}
        {activeView === 'player' && (
          <div className="mb-4 relative">
            <button
              onClick={() => setShowPlayerList(!showPlayerList)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-left text-white hover:bg-slate-700 transition-colors flex items-center justify-between"
            >
              <span>{selectedPlayer ? selectedPlayer.name : 'Select a player'}</span>
              <ChevronDown size={20} className="text-slate-400" />
            </button>
            
            {showPlayerList && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-80 overflow-y-auto z-10">
                <div className="sticky top-0 bg-slate-800 p-2 border-b border-slate-700">
                  <input
                    type="text"
                    placeholder="Search players..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500"
                    autoFocus
                  />
                </div>
                <div className="divide-y divide-slate-700">
                  {filteredPlayers.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedPlayer(p);
                        setShowPlayerList(false);
                        setSearchTerm('');
                      }}
                      className="w-full p-3 hover:bg-slate-700 transition-colors flex items-center gap-3 text-left"
                    >
                      <PlayerImage player={p} size="small" />
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium">{p.name}</div>
                        <div className="text-slate-400 text-xs">{p.team_name}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeView === 'team' && (
          <div className="mb-4 relative">
            <button
              onClick={() => setShowPlayerList(!showPlayerList)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-left text-white hover:bg-slate-700 transition-colors flex items-center justify-between"
            >
              <span>{selectedTeam ? selectedTeam.team_name : 'Select a team'}</span>
              <ChevronDown size={20} className="text-slate-400" />
            </button>
            
            {showPlayerList && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-80 overflow-y-auto z-10">
                <div className="sticky top-0 bg-slate-800 p-2 border-b border-slate-700">
                  <input
                    type="text"
                    placeholder="Search teams..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500"
                    autoFocus
                  />
                </div>
                <div className="divide-y divide-slate-700">
                  {filteredTeams.map((t, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedTeam(t);
                        setShowPlayerList(false);
                        setSearchTerm('');
                      }}
                      className="w-full p-3 hover:bg-slate-700 transition-colors flex items-center gap-3 text-left"
                    >
                      {t.logo_url ? (
                        <img src={t.logo_url} alt={t.team_name} className="w-10 h-10 object-contain" />
                      ) : (
                        <div className="w-10 h-10 bg-slate-700 rounded flex items-center justify-center text-white font-semibold">
                          {(t.team_name || 'T')[0]}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium">{t.team_name}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        {activeView === 'player' && <PlayerDetailView player={selectedPlayer} />}
        {activeView === 'team' && <TeamDetailView team={selectedTeam} />}
      </div>
    </div>
  );
};

export default StatisticsPage;
