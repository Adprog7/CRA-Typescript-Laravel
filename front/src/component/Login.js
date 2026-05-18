import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Auth.css';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Afficher le message de succès d'inscription s'il existe
    const message = localStorage.getItem('registerSuccess');
    if (message) {
      setSuccessMessage(message);
      localStorage.removeItem('registerSuccess');
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Email ou mot de passe incorrect');
        setLoading(false);
        return;
      }

      // Succès
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      }
      
      navigate('/');
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
        <p className="auth-subtitle">Connexion</p>

        {successMessage && <div className="success-message">{successMessage}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Connexion en cours...' : 'SE CONNECTER'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Pas encore de compte ? <a href="/register">S'inscrire</a></p>
          <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <p>Vous êtes un client ? <a href="/client-login" style={{ color: '#00f2fe', fontWeight: 'bold' }}>Accès Entreprise</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
