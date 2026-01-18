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
    { name: 'Wins', value: resultsDistribution.wins, color: '#10b981' },
    { name: 'Draws', value: resultsDistribution.draws, color: '#f59e0b' },
    { name: 'Losses', value: resultsDistribution.losses, color: '#ef4444' }
  ];

  // Sort teams by points for league table
  const sortedTeams = [...teams].sort((a, b) => {
    if ((b.points || 0) !== (a.points || 0)) {
      return (b.points || 0) - (a.points || 0);
    }
    // If points are equal, sort by goal difference
    const gdA = (a.goals_for || 0) - (a.goals_against || 0);
    const gdB = (b.goals_for || 0) - (b.goals_against || 0);
    return gdB - gdA;
  });

  return (
    <div className="space-y-6">
      {/* League Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="text-slate-400 text-sm mb-2">Total Goals</div>
          <div className="text-3xl font-bold text-green-400">{leagueStats.totalGoals}</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="text-slate-400 text-sm mb-2">Total Matches</div>
          <div className="text-3xl font-bold text-blue-400">{leagueStats.totalMatches}</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="text-slate-400 text-sm mb-2">Avg Goals/Match</div>
          <div className="text-3xl font-bold text-purple-400">{leagueStats.avgGoalsPerMatch}</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="text-slate-400 text-sm mb-2">Total Teams</div>
          <div className="text-3xl font-bold text-orange-400">{leagueStats.totalTeams}</div>
        </div>
      </div>

      {/* League Table */}
      {sortedTeams.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">📊 League Table</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700">
                  <th className="text-left py-3 px-2">#</th>
                  <th className="text-left py-3 px-2">Team</th>
                  <th className="text-center py-3 px-2">MP</th>
                  <th className="text-center py-3 px-2">W</th>
                  <th className="text-center py-3 px-2">D</th>
                  <th className="text-center py-3 px-2">L</th>
                  <th className="text-center py-3 px-2">GF</th>
                  <th className="text-center py-3 px-2">GA</th>
                  <th className="text-center py-3 px-2">GD</th>
                  <th className="text-center py-3 px-2 font-bold">Pts</th>
                </tr>
              </thead>
              <tbody>
                {sortedTeams.map((team, idx) => {
                  const goalDiff = (team.goals_for || 0) - (team.goals_against || 0);
                  return (
                    <tr 
                      key={idx} 
                      className="border-b border-slate-800 hover:bg-slate-700 transition-colors"
                    >
                      <td className="py-3 px-2 text-slate-400 font-medium">{idx + 1}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          {team.logo_url ? (
                            <img src={team.logo_url} alt={team.team_name} className="w-8 h-8" />
                          ) : (
                            <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center text-xs font-bold">
                              {(team.team_name || 'T')[0]}
                            </div>
                          )}
                          <span className="text-white font-medium">{team.team_name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center text-slate-300">{team.matches_played || 0}</td>
                      <td className="py-3 px-2 text-center text-green-400 font-medium">{team.wins || 0}</td>
                      <td className="py-3 px-2 text-center text-yellow-400 font-medium">{team.draws || 0}</td>
                      <td className="py-3 px-2 text-center text-red-400 font-medium">{team.losses || 0}</td>
                      <td className="py-3 px-2 text-center text-slate-300">{team.goals_for || 0}</td>
                      <td className="py-3 px-2 text-center text-slate-300">{team.goals_against || 0}</td>
                      <td className={`py-3 px-2 text-center font-medium ${goalDiff > 0 ? 'text-green-400' : goalDiff < 0 ? 'text-red-400' : 'text-slate-300'}`}>
                        {goalDiff > 0 ? '+' : ''}{goalDiff}
                      </td>
                      <td className="py-3 px-2 text-center text-white font-bold">{team.points || 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top Scorers and Assisters */}
      {topScorers.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">🥇 Top Scorers</h3>
            <div className="space-y-3">
              {topScorers.map((player, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-3 bg-slate-900/50 rounded hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold text-slate-600 w-8">{idx + 1}</div>
                    <div>
                      <div className="font-bold text-white">{player.player_name || player.name || 'Unknown'}</div>
                      <div className="text-sm text-slate-400">{player.team_name || player.team?.team_name || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-green-400">{player.goals || 0}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">🎯 Top Assisters</h3>
            <div className="space-y-3">
              {topAssisters.map((player, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-3 bg-slate-900/50 rounded hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold text-slate-600 w-8">{idx + 1}</div>
                    <div>
                      <div className="font-bold text-white">{player.player_name || player.name || 'Unknown'}</div>
                      <div className="text-sm text-slate-400">{player.team_name || player.team?.team_name || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-blue-400">{player.assists || 0}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Match Results Distribution */}
      {teams.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Match Results Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default LeagueOverview;