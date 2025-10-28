// src/lib/api.js

import axios from 'axios';

// Configuration de base
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Créer une instance Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer le refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si erreur 401 et pas déjà tenté de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);

          // Réessayer la requête originale avec le nouveau token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Si le refresh échoue, déconnecter l'utilisateur
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Fonctions helpers pour l'authentification
export const authAPI = {
  // Inscription
  register: (data) => api.post('/auth/register/', data),
  
  // Connexion
  login: (data) => api.post('/auth/login/', data),
  
  // Déconnexion
  logout: (refreshToken) => api.post('/auth/logout/', { refresh_token: refreshToken }),
  
  // Récupérer l'utilisateur connecté
  me: () => api.get('/auth/me/'),
  
  // Mettre à jour le profil
  updateProfile: (data) => api.put('/auth/profile/update/', data),
  
  // Changer le mot de passe
  changePassword: (data) => api.post('/auth/password/change/', data),
};

// Fonctions helpers pour les centres
export const centerAPI = {
  // Liste des centres
  list: () => api.get('/auth/centers/'),
  
  // Détails d'un centre
  get: (id) => api.get(`/auth/centers/${id}/`),
  
  // Mon centre
  myCenter: () => api.get('/auth/centers/my_center/'),
  
  // Créer un centre
  create: (data) => api.post('/auth/centers/', data),
  
  // Mettre à jour un centre
  update: (id, data) => api.put(`/auth/centers/${id}/`, data),
  
  // Supprimer un centre
  delete: (id) => api.delete(`/auth/centers/${id}/`),
};