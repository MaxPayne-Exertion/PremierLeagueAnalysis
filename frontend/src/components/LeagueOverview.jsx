import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { Trophy, TrendingUp, Award } from 'lucide-react';

const LeagueOverview = ({ players = [], teams = [], season }) => {
  const [hoveredTeam, setHoveredTeam] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
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
    { name: 'Wins', value: resultsDistribution.wins, color: '#D4AF37' },
    { name: 'Draws', value: resultsDistribution.draws, color: '#E0A96D' },
    { name: 'Losses', value: resultsDistribution.losses, color: '#D2691E' }
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

  const getTopScorerSeason = (teamName) => {
    const teamPlayers = players.filter(p => p.team_name === teamName);
    if (teamPlayers.length === 0) return null;
    const topPlayer = teamPlayers.sort((a, b) => (b.goals || 0) - (a.goals || 0))[0];
    return topPlayer ? `${topPlayer.name} (${topPlayer.goals || 0})` : null;
  };

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
            className={`w-full h-full bg-navy-600 rounded-full flex items-center justify-center text-white font-semibold ${textSizes[size]}`}
          >
            {((player.name || 'U')[0]).toUpperCase()}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-navy-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gold-600 mb-1">League Overview</h1>
          <p className="text-gold-100 text-sm">Season statistics and standings</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-navy-800 rounded-lg p-5 border border-navy-600">
            <div className="text-gold-100 text-xs uppercase tracking-wide mb-2">Total Goals</div>
            <div className="text-3xl font-bold text-bronze-400">{leagueStats.totalGoals}</div>
            <div className="text-xs text-bronze-300 mt-1">This season</div>
          </div>

          <div className="bg-navy-800 rounded-lg p-5 border border-navy-600">
            <div className="text-gold-100 text-xs uppercase tracking-wide mb-2">Matches</div>
            <div className="text-3xl font-bold text-gold-400">{leagueStats.totalMatches}</div>
            <div className="text-xs text-bronze-300 mt-1">Played</div>
          </div>

          <div className="bg-navy-800 rounded-lg p-5 border border-navy-600">
            <div className="text-gold-100 text-xs uppercase tracking-wide mb-2">Goals/Match</div>
            <div className="text-3xl font-bold text-gold-400">{leagueStats.avgGoalsPerMatch}</div>
            <div className="text-xs text-bronze-300 mt-1">Average</div>
          </div>

          <div className="bg-navy-800 rounded-lg p-5 border border-navy-600">
            <div className="text-gold-100 text-xs uppercase tracking-wide mb-2">Teams</div>
            <div className="text-3xl font-bold text-white">{leagueStats.totalTeams}</div>
            <div className="text-xs text-bronze-300 mt-1">Competing</div>
          </div>
        </div>

        {sortedTeams.length > 0 && (
          <div className="bg-navy-800 rounded-lg border border-navy-600 overflow-hidden">
            <div className="p-5 border-b border-navy-600 bg-navy-900">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-gold-600">League Standings</h2>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[600px] overflow-y-auto relative">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-navy-900 z-10">
                  <tr className="border-b border-navy-600">
                    <th className="text-left py-3 px-4 text-gold-100 font-medium">Rank</th>
                    <th className="text-left py-3 px-4 text-gold-100 font-medium">Team</th>
                    <th className="text-center py-3 px-3 text-gold-100 font-medium">MP</th>
                    <th className="text-center py-3 px-3 text-gold-100 font-medium">W</th>
                    <th className="text-center py-3 px-3 text-gold-100 font-medium">D</th>
                    <th className="text-center py-3 px-3 text-gold-100 font-medium">L</th>
                    <th className="text-center py-3 px-3 text-gold-100 font-medium">GF</th>
                    <th className="text-center py-3 px-3 text-gold-100 font-medium">GA</th>
                    <th className="text-center py-3 px-3 text-gold-100 font-medium">GD</th>
                    <th className="text-center py-3 px-3 text-gold-100 font-medium">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-700">

                  {sortedTeams.map((team, idx) => {
                    const goalDiff = (team.goals_for || 0) - (team.goals_against || 0);
                    const isTop = idx < 1;
                    const isTop4 = idx >= 1 && idx < (season === '2024-25' ? 5 : 4);
                    const isRelegation = idx >= sortedTeams.length - 3;

                    return (
                      <tr
                        key={idx}
                        onMouseEnter={(e) => {
                          setHoveredTeam(team);
                          setHoverPosition({ x: e.clientX, y: e.clientY });
                        }}
                        onMouseMove={(e) => {
                          if (hoveredTeam) {
                            setHoverPosition({ x: e.clientX, y: e.clientY });
                          }
                        }}
                        onMouseLeave={() => setHoveredTeam(null)}
                        className={`hover:bg-navy-700/50 transition-colors ${isTop ? 'bg-gold-500/5' : isTop4 ? 'bg-gold-500/5' : isRelegation ? 'bg-bronze-500/5' : ''
                          }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {isTop && <div className="w-1 h-6 bg-gold-600 rounded"></div>}
                            {isTop4 && <div className="w-1 h-6 bg-gold-500/60 rounded"></div>}
                            {isRelegation && <div className="w-1 h-6 bg-bronze-500 rounded"></div>}
                            <span className={`font-semibold ${isTop ? 'text-gold-400' : 'text-gold-100'}`}>
                              {idx + 1}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {team.logo_url ? (
                              <img src={team.logo_url} alt={team.team_name} className="w-8 h-8 rounded" />
                            ) : (
                              <div className="w-8 h-8 bg-navy-600 rounded flex items-center justify-center text-xs font-semibold text-white">
                                {(team.team_name || 'T')[0]}
                              </div>
                            )}
                            <span className="text-white font-medium">{team.team_name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center text-gold-100">{team.matches_played || 0}</td>
                        <td className="py-3 px-3 text-center text-gold-100">{team.wins || 0}</td>
                        <td className="py-3 px-3 text-center text-gold-100">{team.draws || 0}</td>
                        <td className="py-3 px-3 text-center text-gold-100">{team.losses || 0}</td>
                        <td className="py-3 px-3 text-center text-gold-100">{team.goals_for || 0}</td>
                        <td className="py-3 px-3 text-center text-gold-100">{team.goals_against || 0}</td>
                        <td className={`py-3 px-3 text-center font-semibold ${goalDiff > 0 ? 'text-gold-400' : goalDiff < 0 ? 'text-bronze-400' : 'text-gold-100'
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

              {hoveredTeam && (
                <div
                  className="fixed z-50 w-72 bg-navy-800 border border-navy-600 rounded-lg shadow-xl p-4 pointer-events-none"
                  style={{
                    left: hoverPosition.x + 16,
                    top: hoverPosition.y + 16,
                  }}
                >
                  <div className="text-sm font-semibold text-white mb-2">{hoveredTeam.team_name || 'Unknown Team'}</div>
                  <div className="space-y-2">
                    <div>
                      <div className="text-gold-100 text-xs mb-1">Manager</div>
                      <div className="text-white text-sm font-medium">{hoveredTeam.manager || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-gold-100 text-xs mb-1">Stadium</div>
                      <div className="text-white text-sm font-medium">{hoveredTeam.stadium || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-gold-100 text-xs mb-1">Captain</div>
                      <div className="text-white text-sm font-medium">{hoveredTeam.captain || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-gold-100 text-xs mb-1">Top Scorer (Season)</div>
                      <div className="text-white text-sm font-medium">
                        {getTopScorerSeason(hoveredTeam.team_name) || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-gold-100 text-xs mb-1">Top Scorer (All Time)</div>
                      <div className="text-white text-sm font-medium">{hoveredTeam.top_scorer_all_time || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {topScorers.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-x-auto max-h-[600px] overflow-y-auto">
            <div className="bg-navy-800 rounded-lg border border-navy-700">
              <div className="p-5 border-b border-navy-700">
                <div className="flex items-center gap-3">
                  <Award className="text-gold-600" size={20} />
                  <h2 className="text-lg font-bold text-gold-600">Top Goalscorers</h2>
                </div>
              </div>
              <div className="p-4 space-y-2">
                {topScorers.map((player, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-navy-700/50 transition-colors"
                  >
                    <div className={`w-8 text-center font-bold text-lg ${idx === 0 ? 'text-gold-600' :
                      idx === 1 ? 'text-gold-300' :
                        idx === 2 ? 'text-bronze-600' :
                          'text-gold-100'
                      }`}>
                      {idx + 1}
                    </div>

                    <PlayerImage player={player} size="medium" />

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white truncate">
                        {player.player_name || player.name || 'Unknown'}
                      </div>
                      <div className="text-xs text-gold-100 truncate">
                        {player.team_name || player.team?.team_name || 'N/A'}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-bold text-gold-400">{player.goals || 0}</div>
                      <div className="text-xs text-bronze-300">goals</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-navy-800 rounded-lg border border-navy-700">
              <div className="p-5 border-b border-navy-700">
                <div className="flex items-center gap-3">
                  <TrendingUp className="text-gold-600" size={20} />
                  <h2 className="text-lg font-bold text-gold-600">Top Assisters</h2>
                </div>
              </div>
              <div className="p-4 space-y-2">
                {topAssisters.map((player, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-navy-700/50 transition-colors"
                  >
                    <div className={`w-8 text-center font-bold text-lg ${idx === 0 ? 'text-gold-400' :
                      idx === 1 ? 'text-gold-300' :
                        idx === 2 ? 'text-bronze-400' :
                          'text-gold-100'
                      }`}>
                      {idx + 1}
                    </div>

                    <PlayerImage player={player} size="medium" />

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white truncate">
                        {player.player_name || player.name || 'Unknown'}
                      </div>
                      <div className="text-xs text-gold-100 truncate">
                        {player.team_name || player.team?.team_name || 'N/A'}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-bold text-gold-400">{player.assists || 0}</div>
                      <div className="text-xs text-bronze-300">assists</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-navy-800 rounded-lg border border-navy-600 p-5">
            <h3 className="text-gold-600 font-semibold mb-4 text-sm">Top Contributors (Goals + Assists)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={contributorsChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3A506B" />
                <XAxis
                  dataKey="name"
                  stroke="#F3E5AB"
                  angle={-20}
                  textAnchor="end"
                  height={70}
                  style={{ fontSize: '11px' }}
                />
                <YAxis stroke="#F3E5AB" style={{ fontSize: '11px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1C2541',
                    border: '1px solid #3A506B',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="goals" name="Goals" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                <Bar dataKey="assists" name="Assists" fill="#C5A065" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top 5 Teams Analysis */}
          <div className="bg-navy-800 rounded-lg border border-navy-600 p-5">
            <h3 className="text-gold-600 font-semibold mb-4 text-sm">Top 5 Teams Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={topTeamsRadar}>
                <PolarGrid stroke="#3A506B" />
                <PolarAngleAxis
                  dataKey="team"
                  stroke="#F3E5AB"
                  style={{ fontSize: '11px' }}
                />
                <PolarRadiusAxis stroke="#3A506B" />
                <Radar
                  name="Attack"
                  dataKey="attack"
                  stroke="#D2691E"
                  fill="#D2691E"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
                <Radar
                  name="Defense"
                  dataKey="defense"
                  stroke="#C5A065"
                  fill="#C5A065"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
                <Radar
                  name="Wins"
                  dataKey="wins"
                  stroke="#D4AF37"
                  fill="#D4AF37"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1C2541',
                    border: '1px solid #3A506B',
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
          <div className="bg-navy-800 rounded-lg border border-navy-600 p-5">
            <h3 className="text-gold-600 font-semibold mb-4 text-sm">Match Results Distribution</h3>
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
                      backgroundColor: '#1C2541',
                      border: '1px solid #3A506B',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-navy-600/50 rounded-lg border border-gold-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gold-500 rounded-full"></div>
                    <span className="text-white font-medium">Wins</span>
                  </div>
                  <span className="text-gold-400 font-bold text-2xl">{resultsDistribution.wins}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-navy-600/50 rounded-lg border border-bronze-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-bronze-400 rounded-full"></div>
                    <span className="text-white font-medium">Draws</span>
                  </div>
                  <span className="text-bronze-400 font-bold text-2xl">{resultsDistribution.draws}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-navy-600/50 rounded-lg border border-bronze-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-bronze-500 rounded-full"></div>
                    <span className="text-white font-medium">Losses</span>
                  </div>
                  <span className="text-bronze-400 font-bold text-2xl">{resultsDistribution.losses}</span>
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