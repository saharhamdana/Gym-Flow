// Fichier: frontend/src/api/axiosInstance.js

import axios from "axios";

// 🛑 CHANGEMENT ICI : baseURL doit être l'URL générale de l'API (/api/)
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});


// Ajouter automatiquement le token JWT dans chaque requête
api.interceptors.request.use((config) => {
    // 🔑 NOUVELLES URLs à ignorer (elles doivent inclure 'auth/')
    // L'appel de connexion sera maintenant: /api/ + auth/token/
    const skipAuthUrls = ["auth/register/", "auth/token/", "auth/token/refresh/"]; 
    const url = config.url || "";
    
    // Vérifie si l'URL est une URL d'authentification
    // On utilise url.includes(u) car la configuration est dynamique (URL + path)
    const shouldSkip = skipAuthUrls.some((u) => url.includes(u));
    
    if (shouldSkip) {
        // Si on est sur une URL d'authentification, on s'assure qu'aucun en-tête d'autorisation n'est envoyé.
        delete config.headers.Authorization; 
        return config;
    }

    // Récupère le jeton d'accès
    const token = localStorage.getItem("access_token");
    
    // Si un jeton est trouvé, l'ajouter à l'en-tête Authorization
    if (token) {
      config.headers = config.headers || {};
      // Le format est obligatoire : "Bearer <token_value>"
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;