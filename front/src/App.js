import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import BudgetSummary from "./component/BudgetSummary";
import Matrix from "./component/Matrix";
import Missions from "./component/Missions";
import "./App.css"; // Import du style global (fond noir)
import "./css/Matrix.css"; // Import du style de la matrice

export default function App() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [newMissionName, setNewMissionName] = useState('');
  const [newMissionBudget, setNewMissionBudget] = useState('');
  const [newMissionRate, setNewMissionRate] = useState('');
  const [creatingMission, setCreatingMission] = useState(false);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [creatingCompany, setCreatingCompany] = useState(false);


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
      if (!user.client) {
        fetchClients();
      }
    }
  }, [user]);

  const fetchClients = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/clients?t=${new Date().getTime()}`);
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
    }
  };

  const fetchMissions = async () => {
    if (!user) return; // Ne pas chercher si l'utilisateur n'est pas connecté
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/missions?user_id=${user.id}`);
      const data = await response.json();
      setMissions(data);
    } catch (error) {
      console.error('Erreur lors du chargement des missions:', error);
    }
    setLoading(false);
  };

  const handleCreateMission = async (e) => {
    e.preventDefault();
    if (!newMissionName.trim()) return;

    setCreatingMission(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/missions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          user_id: user.id,
          name: newMissionName,
          client_id: selectedClient ? parseInt(selectedClient) : null,
          budget: newMissionBudget ? parseFloat(newMissionBudget) : null,
          rate: newMissionRate ? parseFloat(newMissionRate) : null
        })
      });

      if (response.ok) {
        setNewMissionName('');
        setNewMissionBudget('');
        setNewMissionRate('');
        setSelectedClient('');
        fetchMissions(); // Recharger les missions pour mettre à jour la matrice
      } else {
        console.error('Erreur du serveur lors de la création');
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
    setCreatingMission(false);
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;

    setCreatingCompany(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/companies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          user_id: user.id,
          name: newCompanyName,
        })
      });

      if (response.ok) {
        setNewCompanyName('');
        await fetchClients(); // Recharger la liste des clients
      } else {
        console.error('Erreur du serveur lors de la création de l\'entreprise');
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'entreprise:', error);
    }
    setCreatingCompany(false);
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
    <div className="App">
      <div className="App-header">
        {/* Titre stylisé en vert */}
        <h1 className="main-title">PROJET <span className="highlight">CRA</span></h1>
        
        {/* Ta matrice est automatiquement centrée par le CSS de App-header */}
        <Matrix rows={5} /> 
      </div>
      
      {/* Composant pour afficher les missions du back */}
      <Missions />
    </div>
  );
}