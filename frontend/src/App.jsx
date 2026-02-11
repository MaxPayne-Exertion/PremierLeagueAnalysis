import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./components/Sidebar";
import PlayerTable from "./components/PlayerTable";
import ComparisonView from "./components/ComparisonView";
import StatisticsPage from "./components/StatisticsPage";
import LeagueOverview from "./components/LeagueOverview";
import { Loader2 } from "lucide-react";

axios.defaults.baseURL = "http://localhost:8000/api";

function App() {
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState("2024-25");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [teamsRes, playersRes] = await Promise.all([
          axios.get(`/teams/?season=${selectedSeason}`),
          axios.get(`/players/?season=${selectedSeason}`),
        ]);

        setTeams(teamsRes.data);
        setPlayers(playersRes.data);

        if (playersRes.data.length > 0) {
          const top = [...playersRes.data].sort(
            (a, b) => (b.goals || 0) - (a.goals || 0)
          )[0];
          setSelectedPlayer(top);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          "Failed to load data. Ensure backend is running on http://localhost:8000"
        );
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

      <main
        className="main-content"
        style={{
          marginLeft: "280px",
          minHeight: "100vh",
          transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {loading ? (
          <div className="loader-container min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">
                Loading Premier League Data for Season {selectedSeason}
              </h3>
              <div className="mt-6 w-64 mx-auto h-1.5 bg-slate-800/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-400 rounded-full origin-left"
                  style={{
                    animation:
                      "indeterminate 1.5s infinite cubic-bezier(0.65, 0.815, 0.735, 0.395)",
                  }}
                ></div>


                <style>{`
                     @keyframes indeterminate {
                        0% { transform: translateX(-100%) scaleX(0.2); }
                        50% { transform: translateX(0%) scaleX(0.5); }
                        100% { transform: translateX(100%) scaleX(0.2); }
                   }
              `}</style>
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

                <p className="text-red-300 mb-6">{error}</p>

                <div className="bg-slate-900/50 rounded-lg p-4 mb-4 text-left">
                  <p className="text-xs text-slate-400 mb-2">
                    Troubleshooting:
                  </p>
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
            {activeTab === "dashboard" && (
              <div className="w-full min-h-screen bg-navy-900 p-4 md:p-6">
                <div className="max-w-7xl mx-auto">
                  <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gold-600 mb-1">
                      Premier League
                    </h1>
                    <p className="text-slate-400 text-sm">
                      Season {selectedSeason} • {teams.length} Teams •{" "}
                      {players.length} Players
                    </p>
                  </div>

                  <section>
                    <LeagueOverview players={players} teams={teams} season={selectedSeason} />
                  </section>
                </div>
              </div>
            )}
            {activeTab === "players" && <PlayerTable players={players} />}

            {activeTab === "comparison" && (
              <div className="p-8">
                <ComparisonView players={players} teams={teams} />
              </div>
            )}

            {activeTab === "statistics" && (
              <StatisticsPage players={players} teams={teams} />
            )}
          </div>
        )}
      </main>

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

        @media (max-width: 768px) {
          .main-content {
            margin-left: 0 !important;
          }
        }

        .sidebar.collapsed ~ .main-content {
          margin-left: 80px !important;
        }
      `}</style>
    </div>
  );
}

export default App;
