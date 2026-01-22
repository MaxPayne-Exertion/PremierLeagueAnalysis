import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const LeagueOverview = ({ players = [], teams = [] }) => {
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

  const topScorers = [...players]
    .sort((a, b) => (b.goals || 0) - (a.goals || 0))
    .slice(0, 5);

  const topAssisters = [...players]
    .sort((a, b) => (b.assists || 0) - (a.assists || 0))
    .slice(0, 5);

  const resultsDistribution = teams.reduce((acc, team) => {
    acc.wins += team.wins || 0;
    acc.draws += team.draws || 0;
    acc.losses += team.losses || 0;
    return acc;
  }, { wins: 0, draws: 0, losses: 0 });

  const pieData = [
    { name: 'Wins', value: resultsDistribution.wins, color: '#22c55e' },
    { name: 'Draws', value: resultsDistribution.draws, color: '#eab308' },
    { name: 'Losses', value: resultsDistribution.losses, color: '#ef4444' }
  ];

  // Sort teams by points for league table
  const sortedTeams = [...teams].sort((a, b) => {
    if ((b.points || 0) !== (a.points || 0)) {
      return (b.points || 0) - (a.points || 0);
    }
    const gdA = (a.goals_for || 0) - (a.goals_against || 0);
    const gdB = (b.goals_for || 0) - (b.goals_against || 0);
    return gdB - gdA;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Header */}
        <div className="text-center space-y-4 py-8">
          <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-pulse">
            League Overview
          </h1>
          <p className="text-slate-400 text-lg">Season Statistics & Performance</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500/20 via-emerald-600/10 to-transparent border border-emerald-500/30 rounded-2xl p-6 hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/20">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute top-4 right-4 text-4xl opacity-20 group-hover:opacity-40 transition-opacity">⚽</div>
            <div className="relative space-y-3">
              <div className="text-emerald-400 text-sm font-bold uppercase tracking-wider">Total Goals</div>
              <div className="text-5xl font-black text-white drop-shadow-lg">{leagueStats.totalGoals}</div>
              <div className="text-xs text-slate-400">Scored this season</div>
              <div className="h-1 w-16 bg-gradient-to-r from-emerald-500 to-transparent rounded-full"></div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500/20 via-blue-600/10 to-transparent border border-blue-500/30 rounded-2xl p-6 hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute top-4 right-4 text-4xl opacity-20 group-hover:opacity-40 transition-opacity">🏟️</div>
            <div className="relative space-y-3">
              <div className="text-blue-400 text-sm font-bold uppercase tracking-wider">Total Matches</div>
              <div className="text-5xl font-black text-white drop-shadow-lg">{leagueStats.totalMatches}</div>
              <div className="text-xs text-slate-400">Played so far</div>
              <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-transparent rounded-full"></div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500/20 via-purple-600/10 to-transparent border border-purple-500/30 rounded-2xl p-6 hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute top-4 right-4 text-4xl opacity-20 group-hover:opacity-40 transition-opacity">📊</div>
            <div className="relative space-y-3">
              <div className="text-purple-400 text-sm font-bold uppercase tracking-wider">Avg Goals/Match</div>
              <div className="text-5xl font-black text-white drop-shadow-lg">{leagueStats.avgGoalsPerMatch}</div>
              <div className="text-xs text-slate-400">Average per game</div>
              <div className="h-1 w-16 bg-gradient-to-r from-purple-500 to-transparent rounded-full"></div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-orange-500/20 via-orange-600/10 to-transparent border border-orange-500/30 rounded-2xl p-6 hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/20">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute top-4 right-4 text-4xl opacity-20 group-hover:opacity-40 transition-opacity">🏆</div>
            <div className="relative space-y-3">
              <div className="text-orange-400 text-sm font-bold uppercase tracking-wider">Total Teams</div>
              <div className="text-5xl font-black text-white drop-shadow-lg">{leagueStats.totalTeams}</div>
              <div className="text-xs text-slate-400">Competing teams</div>
              <div className="h-1 w-16 bg-gradient-to-r from-orange-500 to-transparent rounded-full"></div>
            </div>
          </div>
        </div>

        {/* League Table */}
        {sortedTeams.length > 0 && (
          <div className="relative overflow-hidden bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-2 h-12 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
              <h2 className="text-3xl font-black text-white">League Standings</h2>
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-700/50">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-300 border-b-2 border-slate-700">
                    <th className="text-left py-5 px-6 font-bold text-sm uppercase tracking-wider">Rank</th>
                    <th className="text-left py-5 px-6 font-bold text-sm uppercase tracking-wider">Team</th>
                    <th className="text-center py-5 px-4 font-bold text-sm uppercase tracking-wider">MP</th>
                    <th className="text-center py-5 px-4 font-bold text-sm uppercase tracking-wider">W</th>
                    <th className="text-center py-5 px-4 font-bold text-sm uppercase tracking-wider">D</th>
                    <th className="text-center py-5 px-4 font-bold text-sm uppercase tracking-wider">L</th>
                    <th className="text-center py-5 px-4 font-bold text-sm uppercase tracking-wider">GF</th>
                    <th className="text-center py-5 px-4 font-bold text-sm uppercase tracking-wider">GA</th>
                    <th className="text-center py-5 px-4 font-bold text-sm uppercase tracking-wider">GD</th>
                    <th className="text-center py-5 px-4 font-bold text-sm uppercase tracking-wider">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTeams.map((team, idx) => {
                    const goalDiff = (team.goals_for || 0) - (team.goals_against || 0);
                    const isChampion = idx === 0;
                    const isTopThree = idx < 3;
                    return (
                      <tr 
                        key={idx} 
                        className={`border-b border-slate-800/50 hover:bg-slate-800/50 transition-all duration-300 ${
                          isChampion ? 'bg-gradient-to-r from-yellow-500/10 via-yellow-400/5 to-transparent' : 
                          isTopThree ? 'bg-gradient-to-r from-blue-500/10 via-blue-400/5 to-transparent' : ''
                        }`}
                      >
                        <td className="py-5 px-6">
                          <div className={`font-black text-xl ${
                            isChampion ? 'text-yellow-400' : 
                            idx === 1 ? 'text-slate-300' : 
                            idx === 2 ? 'text-orange-400' : 
                            'text-slate-500'
                          }`}>
                            {isChampion && '👑 '}{idx + 1}
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-4">
                            {team.logo_url ? (
                              <img src={team.logo_url} alt={team.team_name} className="w-10 h-10 rounded-full ring-2 ring-slate-600 shadow-lg" />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full flex items-center justify-center text-sm font-black text-white ring-2 ring-slate-600 shadow-lg">
                                {(team.team_name || 'T')[0]}
                              </div>
                            )}
                            <span className="text-white font-bold text-lg">{team.team_name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="py-5 px-4 text-center text-slate-300 font-semibold">{team.matches_played || 0}</td>
                        <td className="py-5 px-4 text-center text-green-400 font-bold">{team.wins || 0}</td>
                        <td className="py-5 px-4 text-center text-yellow-400 font-bold">{team.draws || 0}</td>
                        <td className="py-5 px-4 text-center text-red-400 font-bold">{team.losses || 0}</td>
                        <td className="py-5 px-4 text-center text-slate-300 font-semibold">{team.goals_for || 0}</td>
                        <td className="py-5 px-4 text-center text-slate-300 font-semibold">{team.goals_against || 0}</td>
                        <td className={`py-5 px-4 text-center font-black text-lg ${
                          goalDiff > 0 ? 'text-green-400' : goalDiff < 0 ? 'text-red-400' : 'text-slate-400'
                        }`}>
                          {goalDiff > 0 ? '+' : ''}{goalDiff}
                        </td>
                        <td className="py-5 px-4 text-center">
                          <div className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg">
                            <span className="text-white font-black text-lg">{team.points || 0}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Top Performers */}
        {topScorers.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="relative overflow-hidden bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-500 to-orange-500"></div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-2 h-12 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-full"></div>
                <h2 className="text-3xl font-black text-white">Top Scorers</h2>
              </div>
              <div className="space-y-4">
                {topScorers.map((player, idx) => (
                  <div 
                    key={idx} 
                    className="group relative flex items-center justify-between p-5 bg-gradient-to-r from-slate-800/80 to-slate-900/50 rounded-xl border border-slate-700/30 hover:border-green-500/50 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300"
                  >
                    <div className="flex items-center gap-5">
                      <div className={`text-4xl font-black w-12 text-center ${
                        idx === 0 ? 'text-yellow-400 drop-shadow-lg' : 
                        idx === 1 ? 'text-slate-300 drop-shadow-lg' : 
                        idx === 2 ? 'text-orange-400 drop-shadow-lg' : 
                        'text-slate-600'
                      }`}>
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                      </div>
                      <div>
                        <div className="font-black text-white text-xl group-hover:text-green-400 transition-colors">
                          {player.player_name || player.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-slate-400 font-medium mt-1">
                          {player.team_name || player.team?.team_name || 'N/A'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-black text-green-400 drop-shadow-lg">{player.goals || 0}</div>
                      <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mt-1">Goals</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-2 h-12 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
                <h2 className="text-3xl font-black text-white">Top Assisters</h2>
              </div>
              <div className="space-y-4">
                {topAssisters.map((player, idx) => (
                  <div 
                    key={idx} 
                    className="group relative flex items-center justify-between p-5 bg-gradient-to-r from-slate-800/80 to-slate-900/50 rounded-xl border border-slate-700/30 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
                  >
                    <div className="flex items-center gap-5">
                      <div className={`text-4xl font-black w-12 text-center ${
                        idx === 0 ? 'text-yellow-400 drop-shadow-lg' : 
                        idx === 1 ? 'text-slate-300 drop-shadow-lg' : 
                        idx === 2 ? 'text-orange-400 drop-shadow-lg' : 
                        'text-slate-600'
                      }`}>
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                      </div>
                      <div>
                        <div className="font-black text-white text-xl group-hover:text-blue-400 transition-colors">
                          {player.player_name || player.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-slate-400 font-medium mt-1">
                          {player.team_name || player.team?.team_name || 'N/A'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-black text-blue-400 drop-shadow-lg">{player.assists || 0}</div>
                      <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mt-1">Assists</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Match Results */}
        {teams.length > 0 && (
          <div className="relative overflow-hidden bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-2 h-12 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
              <h2 className="text-3xl font-black text-white">Match Results Distribution</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    strokeWidth={3}
                    stroke="#0f172a"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '2px solid #475569',
                      borderRadius: '12px',
                      color: '#fff',
                      fontWeight: 'bold'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-500/20 to-transparent border-l-4 border-green-500 rounded-xl hover:scale-105 transition-transform duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-2xl shadow-lg">✓</div>
                    <span className="text-white font-black text-2xl">Wins</span>
                  </div>
                  <span className="text-green-400 font-black text-4xl">{resultsDistribution.wins}</span>
                </div>
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-yellow-500/20 to-transparent border-l-4 border-yellow-500 rounded-xl hover:scale-105 transition-transform duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center text-2xl shadow-lg">–</div>
                    <span className="text-white font-black text-2xl">Draws</span>
                  </div>
                  <span className="text-yellow-400 font-black text-4xl">{resultsDistribution.draws}</span>
                </div>
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-red-500/20 to-transparent border-l-4 border-red-500 rounded-xl hover:scale-105 transition-transform duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center text-2xl shadow-lg">✗</div>
                    <span className="text-white font-black text-2xl">Losses</span>
                  </div>
                  <span className="text-red-400 font-black text-4xl">{resultsDistribution.losses}</span>
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