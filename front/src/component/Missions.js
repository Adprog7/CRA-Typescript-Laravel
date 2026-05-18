import React, { useState, useEffect } from 'react';
import { getMissions } from '../services/api';
import '../css/Missions.css';

export default function Missions() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        setLoading(true);
        const data = await getMissions();
        console.log('Missions récupérées:', data);
        setMissions(data);
        setError(null);
      } catch (err) {
        console.error('Erreur:', err);
        setError(err.message);
        setMissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMissions();
  }, []);

  if (loading) {
    return <div className="missions-container">Chargement des missions...</div>;
  }

  if (error) {
    return <div className="missions-container error">Erreur: {error}</div>;
  }

  return (
    <div className="missions-container">
      <h2>Missions</h2>
      {missions && missions.length > 0 ? (
        <table className="missions-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Libellé</th>
              <th>Budget</th>
              <th>Taux Horaire</th>
              <th>Client</th>
            </tr>
          </thead>
          <tbody>
            {missions.map((mission) => (
              <tr key={mission.id}>
                <td>{mission.id}</td>
                <td>{mission.libelle}</td>
                <td>{mission.budget}€</td>
                <td>{mission.rate}€/h</td>
                <td>{mission.client?.society || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Aucune mission disponible</p>
      )}
    </div>
  );
}
