import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { Trophy, TrendingUp, Award } from 'lucide-react';

const LeagueOverview = ({ players = [], teams = [] }) => {
  const leagueStats = {
    totalGoals: teams.reduce((sum, team) => sum + (team.goals_for || 0), 0),
    totalMatches: teams.reduce((sum, team) => sum + (team.matches_played || 0), 0) / 2,
    avgGoalsPerMatch: teams.length > 0 ? 
      (teams.reduce((sum, team) => sum + (team.goals_for || 0), 0) / 
      Math.max(teams.reduce((sum, team) => sum + (team.matches_played || 0), 0) / 2, 1)).toFixed(2) : 0,
    totalTeams: teams.length,
    totalPlayers: players.length,
  };

  const topScorers = [...players]
    .sort((a, b) => (b.goals || 0) - (a.goals || 0))
    .slice(0, 10);

  const topAssisters = [...players]
    .sort((a, b) => (b.assists || 0) - (a.assists || 0))
    .slice(0, 10);

  const resultsDistribution = teams.reduce((acc, team) => {
    acc.wins += team.wins || 0;
    acc.draws += team.draws || 0;
    acc.losses += team.losses || 0;
    return acc;
  }, { wins: 0, draws: 0, losses: 0 });

  const pieData = [
    { name: 'Wins', value: resultsDistribution.wins, color: '#22c55e' },
    { name: 'Draws', value: resultsDistribution.draws, color: '#f59e0b' },
    { name: 'Losses', value: resultsDistribution.losses, color: '#ef4444' }
  ];

  const sortedTeams = [...teams].sort((a, b) => {
    if ((b.points || 0) !== (a.points || 0)) {
      return (b.points || 0) - (a.points || 0);
    }
    const gdA = (a.goals_for || 0) - (a.goals_against || 0);
    const gdB = (b.goals_for || 0) - (b.goals_against || 0);
    return gdB - gdA;
  });

  const topContributors = [...players]
    .map(p => ({
      ...p,
      contributions: (p.goals || 0) + (p.assists || 0)
    }))
    .sort((a, b) => b.contributions - a.contributions)
    .slice(0, 8);

  const contributorsChartData = topContributors.map(p => ({
    name: p.name?.split(' ').pop() || 'Unknown',
    goals: p.goals || 0,
    assists: p.assists || 0,
  }));

  const topTeamsRadar = sortedTeams.slice(0, 5).map(team => ({
    team: team.team_name?.substring(0, 15) || 'Unknown',
    attack: team.goals_for || 0,
    defense: Math.max(0, 50 - (team.goals_against || 0)),
    wins: team.wins || 0,
  }));

  const PlayerImage = ({ player, size = 'medium' }) => {
    const [imageError, setImageError] = React.useState(false);
    
    const sizeClasses = {
      small: 'w-10 h-10',
      medium: 'w-14 h-14',
      large: 'w-16 h-16'
    };

    const textSizes = {
      small: 'text-sm',
      medium: 'text-lg',
      large: 'text-xl'
    };

    const imageUrl = player.image_url || (player.player_id 
      ? `https://img.sofascore.com/api/v1/player/${player.player_id}/image`
      : null);

    const showImage = imageUrl && !imageError;

    return (
      <div className={`${sizeClasses[size]} flex-shrink-0 relative`}>
        {showImage ? (
          <img
            src={imageUrl}
            alt={player.name}
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

  return (
    <div className="w-full min-h-screen bg-slate-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">League Overview</h1>
          <p className="text-slate-400 text-sm">Season statistics and standings</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
            <div className="text-slate-400 text-xs uppercase tracking-wide mb-2">Total Goals</div>
            <div className="text-3xl font-bold text-yellow-300">{leagueStats.totalGoals}</div>
            <div className="text-xs text-slate-500 mt-1">This season</div>
          </div>

          <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
            <div className="text-slate-400 text-xs uppercase tracking-wide mb-2">Matches</div>
            <div className="text-3xl font-bold text-blue-400">{leagueStats.totalMatches}</div>
            <div className="text-xs text-slate-500 mt-1">Played</div>
          </div>

          <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
            <div className="text-slate-400 text-xs uppercase tracking-wide mb-2">Goals/Match</div>
            <div className="text-3xl font-bold text-green-500">{leagueStats.avgGoalsPerMatch}</div>
            <div className="text-xs text-slate-500 mt-1">Average</div>
          </div>

          <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
            <div className="text-slate-400 text-xs uppercase tracking-wide mb-2">Teams</div>
            <div className="text-3xl font-bold text-white">{leagueStats.totalTeams}</div>
            <div className="text-xs text-slate-500 mt-1">Competing</div>
          </div>
        </div>

        {sortedTeams.length > 0 && (
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            <div className="p-5 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-slate-200">League Standings</h2>
              </div>
            </div>
            
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-900 z-10">
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Rank</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Team</th>
                    <th className="text-center py-3 px-3 text-slate-400 font-medium">MP</th>
                    <th className="text-center py-3 px-3 text-slate-400 font-medium">W</th>
                    <th className="text-center py-3 px-3 text-slate-400 font-medium">D</th>
                    <th className="text-center py-3 px-3 text-slate-400 font-medium">L</th>
                    <th className="text-center py-3 px-3 text-slate-400 font-medium">GF</th>
                    <th className="text-center py-3 px-3 text-slate-400 font-medium">GA</th>
                    <th className="text-center py-3 px-3 text-slate-400 font-medium">GD</th>
                    <th className="text-center py-3 px-3 text-slate-400 font-medium">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {sortedTeams.map((team, idx) => {
                    const goalDiff = (team.goals_for || 0) - (team.goals_against || 0);
                    const isTop = idx < 1;
                    const isTop4 = idx>=1 && idx < 4;
                    const isRelegation = idx >= sortedTeams.length - 3;
                    
                    return (
                      <tr 
                        key={idx} 
                        className={`hover:bg-slate-700/50 transition-colors ${
                          isTop ? 'bg-blue-500/5' : isTop4 ? 'bg-blue-500/5' : isRelegation ? 'bg-red-500/5' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {isTop && <div className="w-1 h-6 bg-yellow-400 rounded"></div>}
                            {isTop4 && <div className="w-1 h-6 bg-blue-500 rounded"></div>}
                            {isRelegation && <div className="w-1 h-6 bg-red-500 rounded"></div>}
                            <span className={`font-semibold ${isTop ? 'text-yellow-400' : 'text-slate-400'}`}>
                              {idx + 1}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {team.logo_url ? (
                              <img src={team.logo_url} alt={team.team_name} className="w-8 h-8 rounded" />
                            ) : (
                              <div className="w-8 h-8 bg-slate-700 rounded flex items-center justify-center text-xs font-semibold text-white">
                                {(team.team_name || 'T')[0]}
                              </div>
                            )}
                            <span className="text-white font-medium">{team.team_name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center text-slate-300">{team.matches_played || 0}</td>
                        <td className="py-3 px-3 text-center text-slate-300">{team.wins || 0}</td>
                        <td className="py-3 px-3 text-center text-slate-300">{team.draws || 0}</td>
                        <td className="py-3 px-3 text-center text-slate-300">{team.losses || 0}</td>
                        <td className="py-3 px-3 text-center text-slate-300">{team.goals_for || 0}</td>
                        <td className="py-3 px-3 text-center text-slate-300">{team.goals_against || 0}</td>
                        <td className={`py-3 px-3 text-center font-semibold ${
                          goalDiff > 0 ? 'text-green-400' : goalDiff < 0 ? 'text-red-400' : 'text-slate-400'
                        }`}>
                          {goalDiff > 0 ? '+' : ''}{goalDiff}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="font-bold text-white">{team.points || 0}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {topScorers.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-x-auto max-h-[600px] overflow-y-auto">
            <div className="bg-slate-800 rounded-lg border border-slate-700">
              <div className="p-5 border-b border-slate-700">
                <div className="flex items-center gap-3">
                  <Award className="text-yellow-400" size={20} />
                  <h2 className="text-lg font-bold text-white">Top Scorers</h2>
                </div>
              </div>
              <div className="p-4 space-y-2">
                {topScorers.map((player, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700/50 transition-colors"
                  >
                    <div className={`w-8 text-center font-bold text-lg ${
                      idx === 0 ? 'text-yellow-400' : 
                      idx === 1 ? 'text-slate-300' : 
                      idx === 2 ? 'text-orange-400' : 
                      'text-slate-500'
                    }`}>
                      {idx + 1}
                    </div>
                    
                    <PlayerImage player={player} size="medium" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white truncate">
                        {player.player_name || player.name || 'Unknown'}
                      </div>
                      <div className="text-xs text-slate-400 truncate">
                        {player.team_name || player.team?.team_name || 'N/A'}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-400">{player.goals || 0}</div>
                      <div className="text-xs text-slate-500">goals</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg border border-slate-700">
              <div className="p-5 border-b border-slate-700">
                <div className="flex items-center gap-3">
                  <TrendingUp className="text-yellow-400" size={20} />
                  <h2 className="text-lg font-bold text-white">Top Assisters</h2>
                </div>
              </div>
              <div className="p-4 space-y-2">
                {topAssisters.map((player, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700/50 transition-colors"
                  >
                    <div className={`w-8 text-center font-bold text-lg ${
                      idx === 0 ? 'text-yellow-400' : 
                      idx === 1 ? 'text-slate-300' : 
                      idx === 2 ? 'text-orange-400' : 
                      'text-slate-500'
                    }`}>
                      {idx + 1}
                    </div>
                    
                    <PlayerImage player={player} size="medium" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white truncate">
                        {player.player_name || player.name || 'Unknown'}
                      </div>
                      <div className="text-xs text-slate-400 truncate">
                        {player.team_name || player.team?.team_name || 'N/A'}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xl font-bold text-blue-400">{player.assists || 0}</div>
                      <div className="text-xs text-slate-500">assists</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-5">
            <h3 className="text-white font-semibold mb-4 text-sm">Top Contributors (Goals + Assists)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={contributorsChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  angle={-20}
                  textAnchor="end"
                  height={70}
                  style={{ fontSize: '11px' }}
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
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="goals" name="Goals" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="assists" name="Assists" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top 5 Teams Analysis */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-5">
            <h3 className="text-white font-semibold mb-4 text-sm">Top 5 Teams Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={topTeamsRadar}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis 
                  dataKey="team" 
                  stroke="#94a3b8" 
                  style={{ fontSize: '11px' }}
                />
                <PolarRadiusAxis stroke="#334155" />
                <Radar 
                  name="Attack" 
                  dataKey="attack" 
                  stroke="#ef4444" 
                  fill="#ef4444" 
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
                <Radar 
                  name="Defense" 
                  dataKey="defense" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
                <Radar 
                  name="Wins" 
                  dataKey="wins" 
                  stroke="#22c55e" 
                  fill="#22c55e" 
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Match Results Distribution */}
        {teams.length > 0 && (
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-5">
            <h3 className="text-white font-semibold mb-4 text-sm">Match Results Distribution</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-green-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-white font-medium">Wins</span>
                  </div>
                  <span className="text-green-400 font-bold text-2xl">{resultsDistribution.wins}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-yellow-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-white font-medium">Draws</span>
                  </div>
                  <span className="text-yellow-400 font-bold text-2xl">{resultsDistribution.draws}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-red-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-white font-medium">Losses</span>
                  </div>
                  <span className="text-red-400 font-bold text-2xl">{resultsDistribution.losses}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeagueOverview;