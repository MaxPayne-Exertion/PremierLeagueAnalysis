import React from 'react';
import { Trophy, Activity, Footprints } from 'lucide-react';

const PlayerImage = ({ player, size = 'medium' }) => {
  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-20 h-20'
  };

  const textSizeClasses = {
    small: 'text-lg',
    medium: 'text-2xl',
    large: 'text-3xl'
  };

  // Use player_id as sofascore_id for images
  const imageUrl = player?.image_url || (player?.player_id 
    ? `https://img.sofascore.com/api/v1/player/${player.player_id}/image`
    : null);

  return (
    <div className={`${sizeClasses[size]} flex-shrink-0 relative`}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={player?.name}
          className="w-full h-full object-cover rounded-full border-3 border-white shadow-lg"
          loading="lazy"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      <div 
        className={`${imageUrl ? 'hidden' : 'flex'} w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 rounded-full items-center justify-center text-white font-bold shadow-lg border-3 border-white ${textSizeClasses[size]}`}
        style={{ display: imageUrl ? 'none' : 'flex' }}
      >
        {((player?.name || 'U')[0]).toUpperCase()}
      </div>
    </div>
  );
};

const StatCard = ({ title, player, value, label, icon: Icon, colorClass, compact }) => {
  if (!player) return null;

  if (compact) {
    return (
      <div className="glass-panel p-5 mb-4 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-lg bg-opacity-20 ${colorClass.replace('text-', 'bg-')}`}>
            <Icon size={20} className={colorClass} />
          </div>
          <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider">{title}</h3>
        </div>
        
        <div className="flex items-center gap-3 mb-3">
          <PlayerImage player={player} size="small" />
          <div className="flex-1 min-w-0">
            <div className="text-lg font-bold text-white truncate">{player.name}</div>
            <div className="text-slate-400 text-xs truncate">{player.team_name}</div>
          </div>
        </div>
        
        <div className={`text-3xl font-bold ${colorClass}`}>
          {value} <span className="text-sm font-normal text-slate-400">{label}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
        <div className={`p-3 rounded-full bg-opacity-20 ${colorClass.replace('text-', 'bg-')}`}>
          <Icon size={24} className={colorClass} />
        </div>
      </div>
      
      <div className="flex items-center gap-4 mb-4">
        <PlayerImage player={player} size="large" />
        <div className="flex-1 min-w-0">
          <div className="text-2xl font-bold text-white mb-1 truncate">
            {player.name}
          </div>
          <div className="text-slate-400 text-sm truncate">{player.team_name}</div>
        </div>
      </div>
      
      <div className={`text-4xl font-bold ${colorClass}`}>
        {value} <span className="text-base font-normal text-slate-400">{label}</span>
      </div>
    </div>
  );
};

const TopStats = ({ players, compact = false }) => {
  // Sort players - use expectedGoals instead of xg
  const topScorer = [...players].sort((a, b) => (b.goals || 0) - (a.goals || 0))[0];
  const topAssister = [...players].sort((a, b) => (b.assists || 0) - (a.assists || 0))[0];
  const topXG = [...players].sort((a, b) => (b.expectedGoals || 0) - (a.expectedGoals || 0))[0];

  return (
    <div className={compact ? "space-y-0" : "grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"}>
      <StatCard
        title="Golden Boot"
        player={topScorer}
        value={topScorer?.goals || 0}
        label="Goals"
        icon={Trophy}
        colorClass="text-yellow-400"
        compact={compact}
      />
      <StatCard
        title="Playmaker"
        player={topAssister}
        value={topAssister?.assists || 0}
        label="Assists"
        icon={Activity}
        colorClass="text-blue-400"
        compact={compact}
      />
      <StatCard
        title="Most Threatening"
        player={topXG}
        value={topXG?.expectedGoals?.toFixed(2) || '0.00'}
        label="xG"
        icon={Footprints}
        colorClass="text-green-400"
        compact={compact}
      />
    </div>
  );
};

export default TopStats;