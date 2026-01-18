import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from 'recharts';


const StatisticsPage = ({ players = [], teams = [] }) => {
  const [activeView, setActiveView] = useState('player');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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
    ((p.player_name || p.name || '')).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.team_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTeams = teams.filter(t => 
    (t.team_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const topScorers = [...players]
    .sort((a, b) => (b.goals || 0) - (a.goals || 0))
    .slice(0, 5);

  const topAssisters = [...players]
    .sort((a, b) => (b.assists || 0) - (a.assists || 0))
    .slice(0, 5);

  const PlayerDetailView = ({ player }) => {
    if (!player) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
          <p className="text-slate-400">Please select a player to view details</p>
        </div>
      );
    }

    const safeMax = (arr, key) => {
      const values = arr.map(p => p[key] || 0).filter(v => v > 0);
      return values.length > 0 ? Math.max(...values) : 1;
    };

    const matchesPlayed = player.matches_played || player.appearances || 0;
    
    const playerStats = [
      { category: 'Goals', value: player.goals || 0, fullMark: safeMax(players, 'goals') },
      { category: 'Assists', value: player.assists || 0, fullMark: safeMax(players, 'assists') },
      { category: 'Appearances', value: matchesPlayed, fullMark: Math.max(safeMax(players, 'matches_played'), safeMax(players, 'appearances')) },
    ];

    const goalsPerGame = matchesPlayed > 0 ? ((player.goals || 0) / matchesPlayed).toFixed(2) : '0.00';
    const assistsPerGame = matchesPlayed > 0 ? ((player.assists || 0) / matchesPlayed).toFixed(2) : '0.00';
    const contributionsPerGame = matchesPlayed > 0 ? (((player.goals || 0) + (player.assists || 0)) / matchesPlayed).toFixed(2) : '0.00';

    const avgGoals = players.length > 0 ? (players.reduce((sum, p) => sum + (p.goals || 0), 0) / players.length).toFixed(1) : '0';
    const avgAssists = players.length > 0 ? (players.reduce((sum, p) => sum + (p.assists || 0), 0) / players.length).toFixed(1) : '0';

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 border border-blue-700 rounded-lg p-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-4xl font-bold text-white mb-2">{player.player_name || player.name || 'Unknown Player'}</h2>
              <p className="text-xl text-blue-300">{player.team_name || 'N/A'}</p>
              <p className="text-slate-300 mt-2">{player.position || 'Position N/A'}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-300">Total Contributions</div>
              <div className="text-5xl font-bold text-yellow-400">{(player.goals || 0) + (player.assists || 0)}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-2">⚽ Goals</div>
            <div className="text-4xl font-bold text-green-400">{player.goals || 0}</div>
            <div className="text-sm text-slate-500 mt-1">{goalsPerGame} per game</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-2">🎯 Assists</div>
            <div className="text-4xl font-bold text-blue-400">{player.assists || 0}</div>
            <div className="text-sm text-slate-500 mt-1">{assistsPerGame} per game</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-2">📊 Appearances</div>
            <div className="text-4xl font-bold text-purple-400">{matchesPlayed}</div>
            <div className="text-sm text-slate-500 mt-1">{contributionsPerGame} G+A/game</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Performance Radar</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={playerStats}>
                <PolarGrid stroke="#475569" />
                <PolarAngleAxis dataKey="category" stroke="#94a3b8" />
                <PolarRadiusAxis stroke="#475569" />
                <Radar name={player.player_name || player.name} dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Contribution Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Goals', value: player.goals || 0, color: '#10b981' },
                    { name: 'Assists', value: player.assists || 0, color: '#3b82f6' }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#3b82f6" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Comparison with League Average</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-900/50 rounded">
              <div className="text-sm text-slate-400 mb-2">Goals vs Average</div>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-green-400">{player.goals || 0}</div>
                <div className="text-sm text-slate-500">vs {avgGoals}</div>
              </div>
            </div>
            <div className="p-4 bg-slate-900/50 rounded">
              <div className="text-sm text-slate-400 mb-2">Assists vs Average</div>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-blue-400">{player.assists || 0}</div>
                <div className="text-sm text-slate-500">vs {avgAssists}</div>
              </div>
            </div>
            <div className="p-4 bg-slate-900/50 rounded">
              <div className="text-sm text-slate-400 mb-2">Contribution Rate</div>
              <div className="text-2xl font-bold text-purple-400">{contributionsPerGame}</div>
            </div>
          </div>
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

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-900 to-blue-900 border border-green-700 rounded-lg p-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
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
                  League Position: #{[...teams].sort((a, b) => (b.points || 0) - (a.points || 0)).findIndex(t => t.id === team.id) + 1}
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
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-2">Matches Played</div>
            <div className="text-3xl font-bold text-white">{team.matches_played || 0}</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-2">Wins</div>
            <div className="text-3xl font-bold text-green-400">{team.wins || 0}</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-2">Draws</div>
            <div className="text-3xl font-bold text-yellow-400">{team.draws || 0}</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-2">Losses</div>
            <div className="text-3xl font-bold text-red-400">{team.losses || 0}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-2">⚽ Goals For</div>
            <div className="text-4xl font-bold text-green-400">{team.goals_for || 0}</div>
            <div className="text-sm text-slate-500 mt-1">
              {matchesPlayed > 0 ? ((team.goals_for || 0) / matchesPlayed).toFixed(2) : 0} per game
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-2">🛡️ Goals Against</div>
            <div className="text-4xl font-bold text-red-400">{team.goals_against || 0}</div>
            <div className="text-sm text-slate-500 mt-1">
              {matchesPlayed > 0 ? ((team.goals_against || 0) / matchesPlayed).toFixed(2) : 0} per game
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-2">📊 Goal Difference</div>
            <div className={`text-4xl font-bold ${goalDiff > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {goalDiff > 0 ? '+' : ''}{goalDiff}
            </div>
            <div className="text-sm text-slate-500 mt-1">Win rate: {winRate}%</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
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

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
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

        {/* Team Facts & Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">🏆 Trophy Cabinet</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🏆</div>
                  <div>
                    <div className="text-white font-medium">Premier League Titles</div>
                    <div className="text-xs text-slate-400">Top tier championships</div>
                  </div>
                </div>
                <div className="text-3xl font-bold text-yellow-400">{team.premier_league_titles || 0}</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🏅</div>
                  <div>
                    <div className="text-white font-medium">FA Cup Wins</div>
                    <div className="text-xs text-slate-400">Oldest football competition</div>
                  </div>
                </div>
                <div className="text-3xl font-bold text-blue-400">{team.fa_cup_titles || 0}</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🥇</div>
                  <div>
                    <div className="text-white font-medium">League Cup Wins</div>
                    <div className="text-xs text-slate-400">EFL Cup victories</div>
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-400">{team.league_cup_titles || 0}</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">ℹ️ Club Information</h3>
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
                      {teamPlayers.sort((a, b) => (b.goals || 0) - (a.goals || 0))[0].player_name || teamPlayers.sort((a, b) => (b.goals || 0) - (a.goals || 0))[0].name}
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
                <div className="text-lg font-bold text-white">{team.manager || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>

        {teamPlayers.length > 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Squad Players ({teamPlayers.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-700">
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
                      <td className="py-3 text-white font-medium">{player.player_name || player.name || 'Unknown'}</td>
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
          <p className="text-slate-400">Analyze player, and team performance</p>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => {
              setActiveView('player');
              if (!selectedPlayer && players.length > 0) {
                setSelectedPlayer(players[0]);
              }
            }}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeView === 'player'
                ? 'bg-green-500 text-white'
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
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeView === 'team'
                ? 'bg-purple-500 text-white'
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
                // Auto-select first result when searching
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