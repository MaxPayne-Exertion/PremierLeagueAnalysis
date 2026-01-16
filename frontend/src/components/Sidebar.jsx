import React, { useState } from 'react';
import { LayoutDashboard, Users, GitCompare, Trophy, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';

const Sidebar = ({ activeTab, onTabChange, selectedSeason, onSeasonChange }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'players', label: 'Players', icon: Users },
        { id: 'statistics', label: 'Statistics', icon: BarChart3 },
        { id: 'comparison', label: 'Comparison', icon: GitCompare },
    ];

    const seasons = ['2023-24', '2022-23', '2021-22', '2020-21'];

    return (
        <div className={`sidebar glass-panel ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="logo-container">
                    <Trophy size={24} className="text-white" />
                </div>
                {!isCollapsed && <h1 className="brand-text header-accent">PL Analytics</h1>}
            </div>

            {!isCollapsed && (
                <div className="season-selector-wrapper">
                    <label className="season-label">Season</label>
                    <select
                        className="season-selector-sidebar"
                        value={selectedSeason}
                        onChange={(e) => onSeasonChange && onSeasonChange(e.target.value)}
                    >
                        {seasons.map(season => (
                            <option key={season} value={season}>{season}</option>
                        ))}
                    </select>
                </div>
            )}

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={`nav-btn ${activeTab === item.id ? 'active' : ''}`}
                        title={isCollapsed ? item.label : ''}
                    >
                        <item.icon size={20} />
                        {!isCollapsed && <span className="nav-label">{item.label}</span>}
                    </button>
                ))}
            </nav>

            {!isCollapsed && (
                <div className="sidebar-footer">
                    <p>© 2024 PL Analytics</p>
                    <p>Data Source: Real Data</p>
                </div>
            )}

            <button
                className="sidebar-toggle"
                onClick={() => setIsCollapsed(!isCollapsed)}
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
                {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
        </div>
    );
};

export default Sidebar;
