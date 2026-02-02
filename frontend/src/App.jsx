import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import TeamTable from './components/TeamTable';
import PlayerTable from './components/PlayerTable';
import TopStats from './components/TopStats';
import ComparisonView from './components/ComparisonView';
import { ClinicalityScatter } from './components/EvaluationCharts';
import { PlotlyRadar } from './components/PlotlyRadar';
import StatisticsPage from './components/StatisticsPage';
import LeagueOverview from './components/LeagueOverview';
import { Loader2 } from 'lucide-react';

// Configure Axios base URL
axios.defaults.baseURL = 'http://localhost:8000/api';

function App() {
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState('2024-25');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [teamsRes, playersRes] = await Promise.all([
          axios.get(`/teams/?season=${selectedSeason}`),
          axios.get(`/players/?season=${selectedSeason}`)
        ]);

        setTeams(teamsRes.data);
        setPlayers(playersRes.data);
        
        if (playersRes.data.length > 0) {
          // Default select top scorer
          const top = [...playersRes.data].sort((a, b) => (b.goals || 0) - (a.goals || 0))[0];
          setSelectedPlayer(top);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Ensure backend is running on http://localhost:8000");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedSeason]);

  return (
    <div className="app-layout">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedSeason={selectedSeason}
        onSeasonChange={setSelectedSeason}
      />
      
      {/* Main Content - with proper margin for fixed sidebar */}
      <main 
        className="main-content"
        style={{
          marginLeft: '280px', // Width of expanded sidebar
          minHeight: '100vh',
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {loading ? (
          <div className="loader-container min-h-screen flex items-center justify-center">
            <div className="text-center">
              {/* Enhanced Loader */}
              <div className="relative">
                <Loader2 
                  className="animate-spin text-blue-500 mx-auto mb-4" 
                  size={64}
                  strokeWidth={2}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div 
                    className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"
                    style={{ animationDuration: '1.5s' }}
                  ></div>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">
                Loading Premier League Data
              </h3>
              <p className="text-slate-400 text-sm">
                Fetching season {selectedSeason} statistics...
              </p>
              
              {/* Loading progress bar */}
              <div className="mt-6 w-64 mx-auto bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-pulse"
                  style={{
                    animation: 'loading-bar 1.5s ease-in-out infinite',
                  }}
                ></div>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="min-h-screen flex items-center justify-center p-8">
            <div className="max-w-md w-full">
              <div className="bg-gradient-to-br from-red-900/50 to-slate-800 border-2 border-red-500/50 rounded-xl p-8 text-center backdrop-blur-sm">
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg 
                    className="w-10 h-10 text-red-500" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                    />
                  </svg>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3">
                  Connection Error
                </h3>
                
                <p className="text-red-300 mb-6">
                  {error}
                </p>
                
                <div className="bg-slate-900/50 rounded-lg p-4 mb-4 text-left">
                  <p className="text-xs text-slate-400 mb-2">Troubleshooting:</p>
                  <ul className="text-sm text-slate-300 space-y-1">
                    <li>• Check if Django backend is running</li>
                    <li>• Verify the API is accessible at localhost:8000</li>
                    <li>• Ensure CORS is properly configured</li>
                  </ul>
                </div>
                
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-medium hover:from-red-600 hover:to-pink-600 transition-all transform hover:scale-105"
                >
                  Retry Connection
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            {/* DASHBOARD VIEW */}
            {activeTab === 'dashboard' && (
              <div className="p-8">
                <div className="mb-8">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                    Premier League Dashboard
                  </h1>
                  <p className="text-slate-400">
                    Season {selectedSeason} • {teams.length} Teams • {players.length} Players
                  </p>
                </div>
                
                <section>
                  <h2 className="section-title mb-6">
                    <span className="accent-bar"></span>
                    League Overview
                  </h2>
                  <LeagueOverview players={players} teams={teams} />
                </section>
              </div>
            )}

            {/* PLAYERS VIEW */}
            {activeTab === 'players' && (
              <div className="p-8">
                <div className="mb-8">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                    Players
                  </h1>
                  <p className="text-slate-400">
                    Browse and analyze all {players.length} players from season {selectedSeason}
                  </p>
                </div>
                <PlayerTable players={players} />
              </div>
            )}

            {/* COMPARISON VIEW */}
            {activeTab === 'comparison' && (
              <div className="p-8">
                <ComparisonView players={players} teams={teams} />
              </div>
            )}

            {/* STATISTICS VIEW */}
            {activeTab === 'statistics' && (
              <div className="p-8">
                <StatisticsPage players={players} teams={teams} />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Global Styles */}
      <style jsx>{`
        @keyframes loading-bar {
          0% {
            width: 0%;
          }
          50% {
            width: 70%;
          }
          100% {
            width: 100%;
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .section-title {
          position: relative;
          font-size: 1.75rem;
          font-weight: 700;
          color: white;
          padding-left: 1rem;
        }

        .accent-bar {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 2px;
        }

        /* Responsive sidebar margin */
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0 !important;
          }
        }

        /* Smooth transitions for sidebar collapse */
        .sidebar.collapsed ~ .main-content {
          margin-left: 80px !important;
        }
      `}</style>
    </div>
  );
}

export default App;