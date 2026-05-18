import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import BudgetSummary from "./component/BudgetSummary";
import Matrix from "./component/Matrix";
import Login from "./component/Login";
import Register from "./component/Register";
import ClientLogin from "./component/ClientLogin";
import "./App.css"; // Import du style global (fond noir)
import "./css/Matrix.css"; // Import du style de la matrice

export default function App() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [newMissionName, setNewMissionName] = useState('');
  const [newMissionBudget, setNewMissionBudget] = useState('');
  const [newMissionRate, setNewMissionRate] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');

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

  // Fetch missions
  const { data: missions = [], isLoading: loading } = useQuery({
    queryKey: ['missions', user?.id],
    queryFn: async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/missions?user_id=${user.id}`);
      if (!response.ok) throw new Error('Erreur lors du chargement des missions');
      return response.json();
    },
    enabled: !!user,
  });

  // Fetch clients
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/clients?t=${new Date().getTime()}`);
      if (!response.ok) throw new Error('Erreur lors du chargement des clients');
      return response.json();
    },
    enabled: !!user && !user.client,
  });

  // Create mission mutation
  const createMissionMutation = useMutation({
    mutationFn: async (newMission) => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/missions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(newMission)
      });
      if (!response.ok) throw new Error('Erreur lors de la création de la mission');
      return response.json();
    },
    onSuccess: () => {
      setNewMissionName('');
      setNewMissionBudget('');
      setNewMissionRate('');
      setSelectedClient('');
      queryClient.invalidateQueries({ queryKey: ['missions', user?.id] });
    }
  });

  const handleCreateMission = (e) => {
    e.preventDefault();
    if (!newMissionName.trim()) return;

    createMissionMutation.mutate({
      user_id: user.id,
      name: newMissionName,
      client_id: selectedClient ? parseInt(selectedClient) : null,
      budget: newMissionBudget ? parseFloat(newMissionBudget) : null,
      rate: newMissionRate ? parseFloat(newMissionRate) : null
    });
  };

  // Create company/client mutation
  const createCompanyMutation = useMutation({
    mutationFn: async (newCompany) => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/companies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(newCompany)
      });
      if (!response.ok) throw new Error("Erreur de création de l'entreprise");
      return response.json();
    },
    onSuccess: () => {
      setNewCompanyName('');
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    }
  });

  const handleCreateCompany = (e) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;

    createCompanyMutation.mutate({
      user_id: user.id,
      name: newCompanyName,
    });
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    queryClient.clear();
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
          path="/client-login"
          element={
            user ? <Navigate to="/" replace /> : <ClientLogin onLoginSuccess={handleLoginSuccess} />
          }
        />
        <Route
          path="/budgets"
          element={
            !user ? <Navigate to="/login" replace /> : <BudgetSummary missions={missions} />
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
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <Link to="/budgets" style={{ textDecoration: 'none' }}>
                        <button className="logout-button" style={{ background: '#0066cc' }}>
                          VOIR BUDGETS
                        </button>
                      </Link>
                      <button className="logout-button" onClick={handleLogout}>
                        DÉCONNEXION
                      </button>
                    </div>
                  </div>

                  <p className="user-info">
                    Connecté en tant que: {user.email} {user.client === 1 && <span className="client-badge">(Compte Client)</span>}
                  </p>

                  <Matrix missions={missions} userId={user.id} isClient={user.client === 1} />

                  {user.client !== 1 && (
                    <div className="companies-container" style={{ background: '#f8f9fa', padding: '25px', borderRadius: '8px', marginBottom: '20px' }}>
                      <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', color: '#222' }}>Gestion des clients</h3>
                      <form className="create-mission-form" onSubmit={handleCreateCompany} style={{ marginBottom: 0 }}>
                        <input
                          type="text"
                          placeholder="Nom de la nouvelle entreprise..."
                          value={newCompanyName}
                          onChange={(e) => setNewCompanyName(e.target.value)}
                          disabled={createCompanyMutation.isPending}
                          className="create-mission-input"
                        />
                        <button
                          type="submit"
                          disabled={createCompanyMutation.isPending || !newCompanyName.trim()}
                          className="create-mission-btn"
                        >
                          {createCompanyMutation.isPending ? "Création..." : "+ Créer Entreprise"}
                        </button>
                      </form>
                    </div>
                  )}

                  <div className="missions-container">


                    <div className="missions-header-row">
                      <h2>Missions ({missions.length})</h2>
                      {user.client !== 1 && (
                        <form className="create-mission-form" onSubmit={handleCreateMission}>
                          <input
                            type="text"
                            placeholder="Nouvelle mission..."
                            value={newMissionName}
                            onChange={(e) => setNewMissionName(e.target.value)}
                            disabled={createMissionMutation.isPending}
                            className="create-mission-input"
                          />
                          <input
                            type="number"
                            placeholder="Budget (€)"
                            value={newMissionBudget}
                            onChange={(e) => setNewMissionBudget(e.target.value)}
                            disabled={createMissionMutation.isPending}
                            className="create-mission-input"
                            style={{ marginLeft: '10px', width: '100px' }}
                          />
                          <input
                            type="number"
                            placeholder="TJM (€/j)"
                            value={newMissionRate}
                            onChange={(e) => setNewMissionRate(e.target.value)}
                            disabled={createMissionMutation.isPending}
                            className="create-mission-input"
                            style={{ marginLeft: '10px', width: '90px' }}
                          />
                          <select
                            value={selectedClient}
                            onChange={(e) => setSelectedClient(e.target.value)}
                            disabled={createMissionMutation.isPending}
                            className="create-mission-input"
                            style={{ marginLeft: '10px' }}
                          >
                            <option value="">-- Sans client --</option>
                            {clients.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                          <button
                            type="submit"
                            disabled={createMissionMutation.isPending || !newMissionName.trim()}
                            className="create-mission-btn"
                          >
                            {createMissionMutation.isPending ? "Création..." : "+ Ajouter"}
                          </button>
                        </form>
                      )}
                    </div>
                    {loading && <p>Chargement...</p>}
                    {missions.length === 0 && !loading && (
                      <p>Aucune mission trouvée.</p>
                    )}
                    {missions.length > 0 && (
                      <ul>
                        {missions.map((mission) => (
                          <li key={mission.id}>
                            <strong>{mission.name}</strong>
                            {user.client !== 1 && mission.company_name && (
                              <p style={{ margin: '0 0 5px 0', fontSize: '0.9em', color: '#aaa', fontStyle: 'italic' }}>
                                Entreprise : {mission.company_name}
                              </p>
                            )}
                            {(mission.budget || mission.rate) && (
                              <div style={{ margin: '0 0 10px 0', fontSize: '0.9em', color: '#ccc' }}>
                                <p style={{ margin: '0 0 5px 0' }}>
                                  {mission.budget && <span style={{ marginRight: '15px' }}>Budget : {mission.budget} €</span>}
                                  {mission.rate && <span>TJM : {mission.rate} €/j</span>}
                                </p>
                              </div>
                            )}
                            {mission.description && <p style={{ margin: '5px 0 0 0' }}>{mission.description}</p>}
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