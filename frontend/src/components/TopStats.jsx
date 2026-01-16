import React from 'react';
import { Trophy, Activity, Footprints } from 'lucide-react';

const StatCard = ({ title, player, value, label, icon: Icon, colorClass, compact }) => {
    if (!player) return null;

    if (compact) {
        return (
            <div className="glass-panel p-4 mb-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg bg-opacity-20 ${colorClass.replace('text-', 'bg-')}`}>
                        <Icon size={20} className={colorClass} />
                    </div>
                    <h3 className="text-slate-400 text-xs font-medium uppercase">{title}</h3>
                </div>
                <div className="text-lg font-bold text-white">{player.name}</div>
                <div className="text-slate-500 text-xs mb-2">{player.team_name}</div>
                <div className={`text-2xl font-bold ${colorClass}`}>
                    {value} <span className="text-xs font-normal text-slate-400">{label}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-panel p-6 flex items-center justify-between">
            <div>
                <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
                <div className="text-xl font-bold text-white mb-1">{player.name}</div>
                <div className="text-slate-500 text-xs mb-3">{player.team_name}</div>
                <div className={`text-3xl font-bold ${colorClass}`}>
                    {value} <span className="text-sm font-normal text-slate-400">{label}</span>
                </div>
            </div>
            <div className={`p-4 rounded-full bg-opacity-20 ${colorClass.replace('text-', 'bg-')}`}>
                <Icon size={32} className={colorClass} />
            </div>
        </div>
    );
};

const TopStats = ({ players, compact = false }) => {
    // Sort players
    const topScorer = [...players].sort((a, b) => b.goals - a.goals)[0];
    const topAssister = [...players].sort((a, b) => b.assists - a.assists)[0];
    const topXG = [...players].sort((a, b) => b.xg - a.xg)[0];

    return (
        <div className={compact ? "space-y-0" : "grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"}>
            <StatCard
                title="Golden Boot"
                player={topScorer}
                value={topScorer?.goals}
                label="Goals"
                icon={Trophy}
                colorClass="text-yellow-400"
                compact={compact}
            />
            <StatCard
                title="Playmaker"
                player={topAssister}
                value={topAssister?.assists}
                label="Assists"
                icon={Activity}
                colorClass="text-blue-400"
                compact={compact}
            />
            <StatCard
                title="Most Threatening"
                player={topXG}
                value={topXG?.xg?.toFixed(2)}
                label="xG"
                icon={Footprints}
                colorClass="text-green-400"
                compact={compact}
            />
        </div>
    );
};

export default TopStats;
