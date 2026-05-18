import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Auth.css';

export default function ClientLogin({ onLoginSuccess }) {
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!companyName.trim()) {
      setError('Veuillez entrer le nom de votre entreprise');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/client-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ company_name: companyName }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Entreprise non trouvée');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      }

      window.location.href = '/';
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur de connexion au serveur');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="auth-title">PROJET <span className="auth-highlight">CRA</span></h1>
        <p className="auth-subtitle">Espace Entreprise</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="companyName">Nom de l'entreprise</label>
            <input
              type="text"
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Nom de l'entreprise"
              required
              disabled={loading}
              autoComplete="off"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Connexion en cours...' : 'ACCÉDER À MES MISSIONS'}
          </button>
        </form>

        <div className="auth-footer">
          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <p>Vous êtes un collaborateur ? <a href="/login" style={{ color: '#aaa' }}>Retour à la connexion classique</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
