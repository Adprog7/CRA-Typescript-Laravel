import axios from 'axios';

// Configuration de l'URL de base vers le back Laravel
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Important pour Sanctum
});

// Intercepteur pour ajouter le token d'authentification si disponible
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getMissions = async () => {
  try {
    const response = await apiClient.get('/missions');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des missions:', error);
    throw error;
  }
};

export const getUser = async () => {
  try {
    const response = await apiClient.get('/user');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    throw error;
  }
};

export default apiClient;
