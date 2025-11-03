import axios from "axios";

/**
 * Fonction pour extraire le sous-domaine de l'URL actuelle
 * Ex: powerfit.gymflow.com → "powerfit"
 * moveup.localhost → "moveup"
 */
const getSubdomain = () => {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // En développement sur localhost simple (sans sous-domaine)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return null;
  }
  
  // Pour les sous-domaines en .localhost (développement)
  // Ex: moveup.localhost → "moveup"
  if (hostname.endsWith('.localhost')) {
    return parts[0];
  }
  
  // Pour les sous-domaines en production ou en dev simulé
  // Ex: moveup.gymflow.com → "moveup"
  // On s'assure qu'il y a au moins trois parties et que ce n'est pas 'www'
  if (parts.length >= 3 && parts[0] !== 'www') {
    return parts[0];
  }
  
  return null;
};

/**
 * Déterminer l'URL de base de l'API dynamiquement.
 */
const getBaseURL = () => {
  const hostname = window.location.hostname;

  // 💻 En développement local (localhost, 127.0.0.1 ou sous-domaine.localhost)
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.gymflow.com')
  ) {
    // Utilise l'IP locale du backend pour contourner les problèmes CORS/proxy en dev
    return "http://127.0.0.1:8000/api/";
  }

  // 🚀 En production: assume que l'API est sur un sous-domaine api.
  return `${window.location.protocol}//api.gymflow.com/api/`;
};


// Créer l'instance Axios
const api = axios.create({
  baseURL: getBaseURL(),
});


// Variable pour éviter les boucles infinies de rafraîchissement (HEAD logic)
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Intercepteur de requête
api.interceptors.request.use((config) => {
    // URLs à ignorer pour l'authentification
    const skipAuthUrls = [
      "auth/register/", 
      "auth/token/", 
      "auth/token/refresh/",
      // Permettre la vérification de sous-domaine sans auth
      "auth/centers/check-subdomain/" 
    ]; 
    const url = config.url || "";
    
    // Vérifier si l'URL nécessite l'authentification
    const shouldSkip = skipAuthUrls.some((u) => url.includes(u));
    
    // 1. GESTION DU TOKEN JWT
    if (!shouldSkip) {
      const token = localStorage.getItem("access_token");
      
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // S'assurer que l'en-tête n'est pas envoyé si le token est manquant
        delete config.headers?.Authorization;
      }
    } else {
      // Supprimer l'autorisation pour les endpoints publics
      delete config.headers?.Authorization;
    }
    
    // 2. 🎯 AJOUTER LE SOUS-DOMAINE À CHAQUE REQUÊTE (Logic Multi-Tenant)
    const subdomain = getSubdomain();
    if (subdomain) {
      config.headers = config.headers || {};
      config.headers['X-Tenant-Subdomain'] = subdomain;
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Intercepteur de réponse pour gérer les erreurs 401 et la file d'attente
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si l'erreur est 401 et qu'on n'a pas déjà essayé de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Si on est déjà en train de refresh, mettre en queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
        .then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        })
        .catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        // Pas de refresh token, déconnecter
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/auth/sign-in";
        return Promise.reject(error);
      }

      try {
        // Tenter de rafraîchir le token (en utilisant getBaseURL)
        const response = await axios.post(
          `${getBaseURL()}auth/token/refresh/`, 
          { refresh: refreshToken }
        );

        const { access } = response.data;
        
        // Sauvegarder le nouveau token
        localStorage.setItem("access_token", access);
        
        // Mettre à jour l'en-tête de la requête originale
        originalRequest.headers['Authorization'] = 'Bearer ' + access;
        
        // Traiter la queue
        processQueue(null, access);
        
        isRefreshing = false;
        
        // Réessayer la requête originale
        return api(originalRequest);
      } catch (refreshError) {
        // Le refresh a échoué, déconnecter l'utilisateur
        processQueue(refreshError, null);
        isRefreshing = false;
        
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/auth/sign-in";
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Exporter des utilitaires (pourrait être utile dans d'autres hooks/composants)
export { getSubdomain, getBaseURL };

export default api;
