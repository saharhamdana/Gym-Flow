// Fichier: frontend/src/api/axiosInstance.js
// Version avec support du paramètre ?tenant= pour tester

import axios from "axios";

/**
 * Fonction pour extraire le sous-domaine de l'URL actuelle
 * Supporte aussi le paramètre ?tenant= pour les tests
 * Ex: powerfit.gymflow.com → "powerfit"
 *     moveup.localhost → "moveup"
 *     localhost:5173?tenant=moveup → "moveup" (pour tester)
 */
const getSubdomain = () => {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // 🧪 POUR TESTER EN DÉVELOPPEMENT : Vérifier le paramètre URL ?tenant=
  const urlParams = new URLSearchParams(window.location.search);
  const tenantParam = urlParams.get('tenant');
  if (tenantParam) {
    console.log('🧪 Mode test: tenant depuis URL =', tenantParam);
    return tenantParam;
  }
  
  // En développement sur localhost simple (sans sous-domaine)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return null;
  }
  
  // Pour les sous-domaines en .localhost (développement)
  // Ex: moveup.localhost → "moveup"
  if (hostname.endsWith('.localhost')) {
    return parts[0];
  }
  
  // Pour les sous-domaines en production
  // Ex: moveup.gymflow.com → "moveup"
  if (parts.length >= 3 && parts[0] !== 'www') {
    return parts[0];
  }
  
  return null;
};

/**
 * Déterminer l'URL de base de l'API
 */
const getBaseURL = () => {
  // En développement
  if (window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.endsWith('.localhost')) {
    return "http://127.0.0.1:8000/api/";
  }
  
  // En production
  return `${window.location.protocol}//api.gymflow.com/api/`;
};

// Créer l'instance Axios
const api = axios.create({
  baseURL: getBaseURL(),
});

// Intercepteur pour ajouter le token JWT et le sous-domaine
api.interceptors.request.use((config) => {
    // URLs à ignorer pour l'authentification
    const skipAuthUrls = [
      "auth/register/", 
      "auth/token/", 
      "auth/token/refresh/"
    ]; 
    const url = config.url || "";
    
    // Vérifier si l'URL nécessite l'authentification
    const shouldSkip = skipAuthUrls.some((u) => url.includes(u));
    
    if (!shouldSkip) {
      // Ajouter le token JWT si disponible
      const token = localStorage.getItem("access_token");
      
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      // Supprimer l'autorisation pour les endpoints publics
      delete config.headers?.Authorization;
    }
    
    // 🎯 AJOUTER LE SOUS-DOMAINE À CHAQUE REQUÊTE
    const subdomain = getSubdomain();
    if (subdomain) {
      config.headers = config.headers || {};
      config.headers['X-Tenant-Subdomain'] = subdomain;
      console.log('📡 Requête avec tenant:', subdomain);
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Si erreur 401 et qu'on n'a pas déjà tenté de rafraîchir le token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        
        if (refreshToken) {
          // Tenter de rafraîchir le token
          const response = await axios.post(
            `${getBaseURL()}auth/token/refresh/`,
            { refresh: refreshToken }
          );
          
          const { access } = response.data;
          localStorage.setItem("access_token", access);
          
          // Réessayer la requête originale avec le nouveau token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Si le refresh échoue, déconnecter l'utilisateur
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/auth/sign-in";
      }
    }
    
    return Promise.reject(error);
  }
);

// Exporter des utilitaires
export { getSubdomain, getBaseURL };
export default api;