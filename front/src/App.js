import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Matrix from "./component/Matrix";
import Login from "./component/Login";
import Register from "./component/Register";
import "./App.css";
import "./css/Matrix.css";

export default function App() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Vérifier si l'utilisateur est connecté au démarrage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchMissions();
    }
  }, [user]);

  const fetchMissions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/missions`);
      const data = await response.json();
      setMissions(data);
    } catch (error) {
      console.error('Erreur lors du chargement des missions:', error);
    }
    setLoading(false);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setMissions([]);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            user ? <Navigate to="/" replace /> : <Login onLoginSuccess={handleLoginSuccess} />
          }
        />
        <Route
          path="/register"
          element={
            user ? <Navigate to="/" replace /> : <Register />
          }
        />
        <Route
          path="/"
          element={
            !user ? (
              <Navigate to="/login" replace />
            ) : (
              <div className="App">
                <div className="App-header">
                  <div className="top-bar">
                    <h1 className="main-title">PROJET <span className="highlight">CRA</span></h1>
                    <button className="logout-button" onClick={handleLogout}>
                      DÉCONNEXION
                    </button>
                  </div>

                  <p className="user-info">Connecté en tant que: {user.email}</p>

                  <Matrix rows={5} />

                  <div className="missions-container">
                    <h2>Missions ({missions.length})</h2>
                    {loading && <p>Chargement...</p>}
                    {missions.length === 0 && !loading && (
                      <p>Aucune mission trouvée.</p>
                    )}
                    {missions.length > 0 && (
                      <ul>
                        {missions.map((mission) => (
                          <li key={mission.id}>
                            <strong>{mission.name}</strong>
                            {mission.description && <p>{mission.description}</p>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )
          }
        />
      </Routes>
    </Router>
  );
}