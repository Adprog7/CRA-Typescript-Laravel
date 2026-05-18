import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import '../App.css';

function MissionDetails({ missionId }) {
  const { data: monthlyStats = [], isLoading } = useQuery({
    queryKey: ['monthlyStats', missionId],
    queryFn: async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/missions/${missionId}/monthly`);
      if (!response.ok) throw new Error("Erreur de récupération des détails mensuels");
      return response.json();
    }
  });

  if (isLoading) {
    return <p style={{ fontSize: '13px', color: '#666' }}>Chargement...</p>;
  }

  if (monthlyStats.length === 0) {
    return <p style={{ fontSize: '13px', color: '#666' }}>Aucune donnée trouvée pour cette mission.</p>;
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
      <thead>
        <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
          <th style={{ padding: '8px 0' }}>Mois</th>
          <th style={{ padding: '8px 0' }}>Jours</th>
          <th style={{ padding: '8px 0' }}>Montant</th>
        </tr>
      </thead>
      <tbody>
        {monthlyStats.map((stat, idx) => (
          <tr key={idx} style={{ borderBottom: '1px solid #f9f9f9' }}>
            <td style={{ padding: '8px 0' }}>{stat.month}</td>
            <td style={{ padding: '8px 0' }}><strong>{parseFloat(stat.total_days).toFixed(1)} j</strong></td>
            <td style={{ padding: '8px 0' }}><strong>{parseFloat(stat.cost).toFixed(0)} €</strong></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function BudgetSummary({ missions = [] }) {
  const navigate = useNavigate();
  const [expandedMissions, setExpandedMissions] = useState(new Set());

  const toggleDetails = (missionId) => {
    const newExpanded = new Set(expandedMissions);
    if (newExpanded.has(missionId)) {
      newExpanded.delete(missionId);
    } else {
      newExpanded.add(missionId);
    }
    setExpandedMissions(newExpanded);
  };

  const missionsWithBudget = missions.filter(m => m.budget && m.rate);

  const globalBudgetDays = missionsWithBudget.reduce((acc, mission) => acc + (parseFloat(mission.budget) / parseFloat(mission.rate)), 0);
  const globalLoggedDays = missionsWithBudget.reduce((acc, mission) => acc + (parseFloat(mission.total_days_logged) || 0), 0);
  const globalRemainingDays = Math.max(0, globalBudgetDays - globalLoggedDays);

  const globalBudgetEuros = missionsWithBudget.reduce((acc, mission) => acc + parseFloat(mission.budget), 0);
  const globalLoggedEuros = missionsWithBudget.reduce((acc, mission) => acc + ((parseFloat(mission.total_days_logged) || 0) * parseFloat(mission.rate)), 0);

  return (
    <div className="App">
      <div className="App-header">
        <div className="top-bar">
          <h1 className="main-title">Résumé des <span className="highlight">Budgets</span></h1>
          <button className="logout-button" onClick={() => navigate('/')} style={{ background: '#0066cc' }}>
            RETOUR AU CRA
          </button>
        </div>

        <div className="missions-container" style={{ marginTop: '0' }}>
          <div style={{ background: '#f8f9fa', border: '1px solid #e0e6ed', borderRadius: '8px', padding: '15px', marginBottom: '30px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#0066cc' }}>Synthèse Globale</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#333', flexWrap: 'wrap', gap: '10px' }}>
              <div>Total Budget : <strong>{globalBudgetDays.toFixed(1)} j</strong> <span style={{ color: '#666' }}>({globalBudgetEuros.toFixed(0)} €)</span></div>
              <div>Total Dépensé : <strong>{globalLoggedDays.toFixed(1)} j</strong> <span style={{ color: '#666' }}>({globalLoggedEuros.toFixed(0)} €)</span></div>
              <div>Reste à placer : <strong style={{ color: globalRemainingDays <= 0 ? '#dc3545' : '#0066cc' }}>{globalRemainingDays.toFixed(1)} j</strong></div>
            </div>
          </div>

          <h2>Détail par Mission</h2>
          {missionsWithBudget.length === 0 ? (
            <p>Aucune mission avec un budget défini n'a été trouvée.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {missionsWithBudget.map((mission) => {
                const totalBudget = parseFloat(mission.budget) / parseFloat(mission.rate);
                const logged = parseFloat(mission.total_days_logged || 0);
                const remaining = Math.max(0, totalBudget - logged);
                const ratio = logged / totalBudget;
                const loggedEuros = logged * parseFloat(mission.rate);
                const remainingEuros = parseFloat(mission.budget) - loggedEuros;
                const isExpanded = expandedMissions.has(mission.id);

                return (
                  <li key={mission.id} style={{ background: 'white', padding: '20px', marginBottom: '15px', borderRadius: '8px', borderLeft: '4px solid #0066cc', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <strong style={{ fontSize: '16px', color: '#222' }}>{mission.name}</strong>
                      <button 
                        onClick={() => toggleDetails(mission.id)}
                        style={{ 
                          background: isExpanded ? '#f0f0f0' : '#0066cc', 
                          color: isExpanded ? '#333' : 'white',
                          border: 'none',
                          padding: '5px 10px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        {isExpanded ? 'Masquer le détail' : 'Afficher le détail'}
                      </button>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#666', marginBottom: '15px', flexWrap: 'wrap' }}>
                      <span>Budget : <strong>{mission.budget} €</strong></span>
                      <span>TJM : <strong>{mission.rate} €/j</strong></span>
                      <span>Dépensé : <strong style={{ color: '#0066cc' }}>{loggedEuros.toFixed(0)} €</strong></span>
                      <span>Reste : <strong style={{ color: remainingEuros <= 0 ? '#dc3545' : '#0066cc' }}>{remainingEuros.toFixed(0)} €</strong></span>
                    </div>
                    
                    <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #e0e6ed' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px', color: '#555' }}>
                        <span>Jours placés: <strong style={{ color: '#222' }}>{logged.toFixed(1)} j</strong></span>
                        <span>Restant: <strong style={{ color: remaining <= 0 ? '#dc3545' : '#0066cc' }}>{remaining.toFixed(1)} j</strong> / {totalBudget.toFixed(1)} j</span>
                      </div>
                      <div style={{ width: '100%', height: '10px', backgroundColor: '#e0e6ed', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ 
                          height: '100%', 
                          width: `${Math.min(100, ratio * 100)}%`,
                          backgroundColor: ratio >= 1 ? '#dc3545' : ratio > 0.8 ? '#ffc107' : '#0066cc',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#333' }}>Répartition mensuelle</h4>
                        <MissionDetails missionId={mission.id} />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

