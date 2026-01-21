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

// Configure Axios base URL
axios.defaults.baseURL = 'http://localhost:8000/api';

function App() {
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState('2023-24');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [teamsRes, playersRes] = await Promise.all([
          axios.get(`/teams/?season=${selectedSeason}`),
          axios.get(`/players/?season=${selectedSeason}`)
        ]);
        setTeams(teamsRes.data);
        setPlayers(playersRes.data);
        if (playersRes.data.length > 0) {
          // Default select top scorer
          const top = [...playersRes.data].sort((a, b) => b.goals - a.goals)[0];
          setSelectedPlayer(top);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Ensure backend is running.");
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

      <main className="main-content">
        {loading ? (
          <div className="loader-container">
            <div className="spinner"></div>
          </div>
        ) : error ? (
          <div className="error-message p-4 border border-red-500 rounded text-red-400 bg-red-900/20 text-center">
            {error}
          </div>
        ) : (
          <div className="animate-fade-in">
            {/* DASHBOARD VIEW */}
            {activeTab === 'dashboard' && (
              <>
                <section>
                  <h2 className="section-title">
                    <span className="accent-bar"></span>
                    Team Overview
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <TeamTable teams={teams} selectedSeason={selectedSeason} />
                    </div>
                    <div className="lg:col-span-1">
                      <TopStats players={players} compact={true} />
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* PLAYERS VIEW */}
            {activeTab === 'players' && (
              <PlayerTable players={players} />
            )}

            {/* COMPARISON VIEW */}
            {activeTab === 'comparison' && (
              <ComparisonView players={players} teams={teams} />
            )}
            {/* STATISTICS VIEW */}
            {activeTab === 'statistics' && (
              <StatisticsPage players={players} teams={teams} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;