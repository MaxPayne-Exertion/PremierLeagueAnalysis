import React, { useState } from 'react';
import { LayoutDashboard, Users, GitCompare, Trophy, BarChart3, ChevronLeft, ChevronRight, Sparkles, TrendingUp } from 'lucide-react';

const Sidebar = ({ activeTab, onTabChange, selectedSeason, onSeasonChange }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [hoveredItem, setHoveredItem] = useState(null);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'from-blue-500 to-cyan-500', accent: '#3b82f6' },
        { id: 'players', label: 'Players', icon: Users, color: 'from-green-500 to-emerald-500', accent: '#10b981' },
        { id: 'statistics', label: 'Statistics', icon: BarChart3, color: 'from-purple-500 to-pink-500', accent: '#8b5cf6' },
        { id: 'comparison', label: 'Comparison', icon: GitCompare, color: 'from-orange-500 to-red-500', accent: '#f59e0b' },
    ];

    const seasons = ['2024-25','2023-24', '2022-23', '2021-22', '2020-21'];

    return (
        <div 
            className={`sidebar glass-panel ${isCollapsed ? 'collapsed' : ''}`}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                height: '100vh',
                overflowY: 'auto',
                overflowX: 'hidden',
                zIndex: 1000,
                transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Animated Background Gradient */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 animate-gradient-shift"></div>
            </div>

            {/* Header with Logo */}
            <div className="sidebar-header relative z-10">
                <div className="logo-container group">
                    <div className="relative">
                        <Trophy size={isCollapsed ? 28 : 32} className="text-yellow-400 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                        <Sparkles 
                            size={12} 
                            className="absolute -top-1 -right-1 text-yellow-300 opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse" 
                        />
                    </div>
                </div>
                {!isCollapsed && (
                    <div className="overflow-hidden">
                        <h1 
                            className="brand-text header-accent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-bold text-2xl"
                            style={{
                                animation: 'slideInRight 0.4s ease-out',
                            }}
                        >
                            PL Analytics
                        </h1>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                            <TrendingUp size={12} className="text-green-400" />
                            Real-time insights
                        </p>
                    </div>
                )}
            </div>

            {/* Season Selector */}
            {!isCollapsed && (
                <div 
                    className="season-selector-wrapper px-4 mb-6"
                    style={{
                        animation: 'fadeIn 0.5s ease-out 0.1s both',
                    }}
                >
                    <label className="season-label text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                        Season
                    </label>
                    <div className="relative group">
                        <select
                            className="season-selector-sidebar w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white font-medium appearance-none cursor-pointer hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
                            value={selectedSeason}
                            onChange={(e) => onSeasonChange && onSeasonChange(e.target.value)}
                        >
                            {seasons.map(season => (
                                <option key={season} value={season} className="bg-slate-900">
                                    {season}
                                </option>
                            ))}
                        </select>
                        <ChevronRight 
                            size={16} 
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-blue-400 transition-colors"
                            style={{ transform: 'translateY(-50%) rotate(90deg)' }}
                        />
                    </div>
                </div>
            )}

            {/* Navigation Menu */}
            <nav className="sidebar-nav flex-1 px-3 space-y-2">
                {menuItems.map((item, index) => {
                    const isActive = activeTab === item.id;
                    const isHovered = hoveredItem === item.id;
                    
                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            onMouseEnter={() => setHoveredItem(item.id)}
                            onMouseLeave={() => setHoveredItem(null)}
                            className={`nav-btn relative w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
                                isActive ? 'active' : ''
                            }`}
                            title={isCollapsed ? item.label : ''}
                            style={{
                                animation: `slideInLeft 0.3s ease-out ${index * 0.1}s both`,
                            }}
                        >
                            {/* Active/Hover Background Gradient */}
                            {(isActive || isHovered) && (
                                <div 
                                    className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-${isActive ? '20' : '10'} rounded-lg transition-opacity duration-300`}
                                    style={{
                                        animation: isActive ? 'pulse 2s ease-in-out infinite' : 'none',
                                    }}
                                />
                            )}

                            {/* Left Accent Bar */}
                            {isActive && (
                                <div 
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                                    style={{
                                        backgroundColor: item.accent,
                                        boxShadow: `0 0 10px ${item.accent}`,
                                        animation: 'expandHeight 0.3s ease-out',
                                    }}
                                />
                            )}

                            {/* Icon */}
                            <div className="relative z-10">
                                <item.icon 
                                    size={20} 
                                    className={`transition-all duration-300 ${
                                        isActive 
                                            ? 'text-white scale-110' 
                                            : 'text-slate-400 group-hover:text-white group-hover:scale-110'
                                    }`}
                                    style={{
                                        filter: isActive ? `drop-shadow(0 0 8px ${item.accent})` : 'none',
                                    }}
                                />
                            </div>

                            {/* Label */}
                            {!isCollapsed && (
                                <span 
                                    className={`nav-label relative z-10 font-medium transition-all duration-300 ${
                                        isActive 
                                            ? 'text-white' 
                                            : 'text-slate-400 group-hover:text-white'
                                    }`}
                                >
                                    {item.label}
                                </span>
                            )}

                            {/* Ripple effect on hover */}
                            {isHovered && (
                                <div 
                                    className="absolute inset-0 rounded-lg"
                                    style={{
                                        background: `radial-gradient(circle at center, ${item.accent}20 0%, transparent 70%)`,
                                        animation: 'ripple 0.6s ease-out',
                                    }}
                                />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Footer */}
            {!isCollapsed && (
                <div 
                    className="sidebar-footer px-4 py-4 border-t border-slate-700/50 mt-auto"
                    style={{
                        animation: 'fadeIn 0.5s ease-out 0.2s both',
                    }}
                >
                    <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Live Data
                        </p>
                        <p className="text-xs text-slate-500">
                            © 2026 PL Analytics
                        </p>
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-700/50">
                            <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
                                    style={{
                                        animation: 'progressBar 2s ease-in-out infinite',
                                        width: '70%',
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Collapse/Expand Toggle */}
            <button
                className="sidebar-toggle absolute -right-3 top-20 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center hover:bg-slate-700 hover:border-blue-500 transition-all duration-300 group z-20"
                onClick={() => setIsCollapsed(!isCollapsed)}
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                style={{
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
            >
                {isCollapsed ? (
                    <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-400 transition-colors" />
                ) : (
                    <ChevronLeft size={16} className="text-slate-400 group-hover:text-blue-400 transition-colors" />
                )}
            </button>

            {/* Custom Animations */}
            <style jsx>{`
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes slideInLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes expandHeight {
                    from {
                        height: 0;
                    }
                    to {
                        height: 2rem;
                    }
                }

                @keyframes ripple {
                    from {
                        opacity: 1;
                        transform: scale(0);
                    }
                    to {
                        opacity: 0;
                        transform: scale(2);
                    }
                }

                @keyframes progressBar {
                    0%, 100% {
                        width: 70%;
                    }
                    50% {
                        width: 90%;
                    }
                }

                @keyframes pulse {
                    0%, 100% {
                        opacity: 0.2;
                    }
                    50% {
                        opacity: 0.3;
                    }
                }

                @keyframes gradient-shift {
                    0% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                    100% {
                        background-position: 0% 50%;
                    }
                }

                .animate-gradient-shift {
                    background-size: 200% 200%;
                    animation: gradient-shift 15s ease infinite;
                }

                /* Custom scrollbar for sidebar */
                .sidebar::-webkit-scrollbar {
                    width: 6px;
                }

                .sidebar::-webkit-scrollbar-track {
                    background: transparent;
                }

                .sidebar::-webkit-scrollbar-thumb {
                    background: rgba(148, 163, 184, 0.3);
                    border-radius: 3px;
                }

                .sidebar::-webkit-scrollbar-thumb:hover {
                    background: rgba(148, 163, 184, 0.5);
                }
            `}</style>
        </div>
    );
};

export default Sidebar;