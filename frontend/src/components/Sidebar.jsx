import React, { useState } from 'react';
import { LayoutDashboard, Users, GitCompare, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';

const Sidebar = ({ activeTab, onTabChange, selectedSeason, onSeasonChange }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems = [
        { id: 'dashboard', label: 'League Overview', icon: LayoutDashboard },
        { id: 'players', label: 'Player Table', icon: Users },
        { id: 'statistics', label: 'Stats Hub', icon: BarChart3 },
        { id: 'comparison', label: 'Comparison Arena', icon: GitCompare },
    ];

    const seasons = ['2024-25','2023-24', '2022-23', '2021-22', '2020-21', '2019-20', '2018-19', '2017-18', '2016-17', '2015-16', '2014-15', '2013-14'];

    return (
        <div 
            className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                height: '100vh',
                width: isCollapsed ? '100px' : '280px',
                zIndex: 1000,
                transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
        >
            
            <div
            className="h-full flex flex-col bg-navy-900 shadow-lg overflow-y-auto relative"
            >
            
            <div className="px-6 py-6 border-b border-navy-600/50">
                {!isCollapsed ? (
                    <div>
                        <h1 className="text-xl font-bold text-gold-600">
                            PL Analytics
                        </h1>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <div className="w-10 h-10 bg-gold-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                            PL
                        </div>
                    </div>
                )}
            </div>

            {!isCollapsed && (
                <div className="px-4 py-4 border-b border-navy-600/50">
                    <label className="text-xs font-semibold text-gold-100 uppercase tracking-wider mb-2 block">
                        Season
                    </label>
                    <select
                        className="w-full px-3 py-2 bg-navy-800 border border-navy-600 rounded-lg text-white text-sm appearance-none cursor-pointer hover:border-gold-500 focus:outline-none focus:border-gold-500 transition-colors"
                        value={selectedSeason}
                        onChange={(e) => onSeasonChange && onSeasonChange(e.target.value)}
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2.5 4.5L6 8L9.5 4.5' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 0.75rem center',
                            paddingRight: '2.5rem',
                        }}
                    >
                        {seasons.map(season => (
                            <option key={season} value={season} className="bg-navy-800">
                                {season}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            
            <nav className="flex-1 px-3 py-4 space-y-1">
                {menuItems.map((item) => {
                    const isActive = activeTab === item.id;
                    
                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                isActive 
                                    ? 'bg-navy-800 text-white' 
                                    : 'text-gold-100 hover:bg-navy-800/50 hover:text-white'
                            }`}
                            title={isCollapsed ? item.label : ''}
                        >
                            <item.icon 
                                size={20} 
                                className="flex-shrink-0"
                            />

                            {!isCollapsed && (
                                <span className="font-medium text-sm">
                                    {item.label}
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>

            {!isCollapsed && (
                <div className="px-4 py-4 border-t border-navy-600/50">
                    <p className="text-xs text-gold-100">
                        © Developed by Anubhav Basnet, Shashank Hari Joshi, Parbat Baniya, Nabin Pandey & Kaustuv Bhandari
                    </p>
                </div>
            )}
            </div>

            <button
                className="absolute -right-3 top-20 w-6 h-6 bg-navy-800 border border-navy-600 rounded-full flex items-center justify-center hover:bg-navy-600 hover:border-gold-500 transition-colors z-20"
                onClick={() => setIsCollapsed(!isCollapsed)}
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                style={{
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
            >
                {isCollapsed ? (
                    <ChevronRight size={14} className="text-gold-100" />
                ) : (
                    <ChevronLeft size={14} className="text-gold-100" />
                )}
            </button>
        </div>
    );
};

export default Sidebar;