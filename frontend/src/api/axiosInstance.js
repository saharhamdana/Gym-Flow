// Fichier: frontend/src/api/axiosInstance.js

import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

// Variable pour éviter les boucles infinies de rafraîchissement
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
    const skipAuthUrls = ["auth/register/", "auth/token/", "auth/token/refresh/"];
    const url = config.url || "";
    
    const shouldSkip = skipAuthUrls.some((u) => url.includes(u));
    
    if (shouldSkip) {
        delete config.headers.Authorization;
        return config;
    }

    const token = localStorage.getItem("access_token");
    
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Intercepteur de réponse pour gérer les erreurs 401
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
        // Pas de refresh token, rediriger vers login
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/auth/sign-in";
        return Promise.reject(error);
      }

      try {
        // Tenter de rafraîchir le token
        const response = await axios.post("http://127.0.0.1:8000/api/auth/token/refresh/", {
          refresh: refreshToken,
        });

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

export default api;