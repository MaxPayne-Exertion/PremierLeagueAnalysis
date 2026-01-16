import React from 'react';

const TeamTable = ({ teams }) => {
    // Sort teams by points
    const sortedTeams = [...teams].sort((a, b) => b.points - a.points);

    return (
        <div className="glass-panel p-6">
            <h2 className="section-title header-accent">League Table</h2>
            <div className="overflow-x-auto">
                <table className="data-table w-full text-sm">
                    <thead>
                        <tr className="text-slate-400 border-b border-slate-700">
                            <th className="w-12 py-3">#</th>
                            <th className="py-3 text-left">Team</th>
                            <th className="py-3 text-center w-12">P</th>
                            <th className="py-3 text-center w-12">W</th>
                            <th className="py-3 text-center w-12">D</th>
                            <th className="py-3 text-center w-12">L</th>
                            <th className="py-3 text-center w-16">DIFF</th>
                            <th className="py-3 text-right w-20">Goals</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedTeams.map((team, index) => {
                            const diff = team.goals_for - team.goals_against;
                            const diffClass = diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-slate-400';

                            // Rank Badge Logic
                            let rankBadgeClass = "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white";
                            if (index + 1 <= 4) rankBadgeClass += " bg-green-500";
                            else if (index + 1 === 5) rankBadgeClass += " bg-blue-500";
                            else rankBadgeClass += " text-slate-400"; // Plain for others

                            return (
                                <tr key={team.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                                    <td className="py-3">
                                        <div className={rankBadgeClass}>
                                            {index + 1}
                                        </div>
                                    </td>
                                    <td className="py-3">
                                        <div className="flex items-center gap-3">
                                            {team.logo_url ? (
                                                <img src={team.logo_url} alt={team.team_name} className="team-logo-small" />
                                            ) : (
                                                <div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center text-xs">
                                                    {team.team_name[0]}
                                                </div>
                                            )}
                                            <span className="font-bold text-white">{team.team_name}</span>
                                        </div>
                                    </td>
                                    <td className="text-center text-white">{team.matches_played}</td>
                                    <td className="text-center text-slate-300">{team.wins}</td>
                                    <td className="text-center text-slate-300">{team.draws}</td>
                                    <td className="text-center text-slate-300">{team.losses}</td>
                                    <td className={`text-center font-bold ${diffClass}`}>{diff > 0 ? `+${diff}` : diff}</td>
                                    <td className="text-right text-white font-mono">{team.goals_for}:{team.goals_against}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TeamTable;
