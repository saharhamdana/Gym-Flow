// frontend/src/api/axiosInstance.js
import axios from "axios";

/**
 * Extraire le sous-domaine de l'URL actuelle
 * Supporte: sous-domaines réels, .localhost, et paramètre ?tenant=
 */
const getSubdomain = () => {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // 1. Paramètre URL ?tenant= (pour le développement/test)
  const urlParams = new URLSearchParams(window.location.search);
  const tenantParam = urlParams.get('tenant');
  
  if (tenantParam) {
    console.log('🧪 Mode test: tenant =', tenantParam);
    return tenantParam;
  }
  
  // 2. Localhost simple (pas de sous-domaine)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return null;
  }
  
  // 3. Sous-domaines en développement (.localhost)
  if (hostname.endsWith('.localhost')) {
    return parts[0];
  }
  
  // 4. Sous-domaines réels (ex: moveup.gymflow.com)
  if (parts.length >= 3) {
    const subdomain = parts[0];
    
    // Ignorer 'www' et 'api'
    if (subdomain === 'www' || subdomain === 'api') {
      return null;
    }
    
    console.log('🌐 Sous-domaine détecté:', subdomain);
    return subdomain;
  }
  
  return null;
};

/**
 * Déterminer l'URL de base de l'API
 */
const getBaseURL = () => {
  const hostname = window.location.hostname;
  
  // Développement local
  if (hostname === 'localhost' || 
      hostname === '127.0.0.1' ||
      hostname.endsWith('.localhost')) {
    return "http://127.0.0.1:8000/api";
  }
  
  // Production avec sous-domaines
  if (hostname.endsWith('.gymflow.com') || hostname === 'gymflow.com') {
    // API dédiée sur api.gymflow.com
    return "http://api.gymflow.com:8000/api";
    // Ou si l'API est sur le même serveur :
    // return `${window.location.protocol}//${window.location.host}/api`;
  }
  
  // Par défaut
  return "http://127.0.0.1:8000/api";
};

// Créer l'instance Axios
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT et le sous-domaine
api.interceptors.request.use(
  (config) => {
    // URLs à ignorer pour l'authentification
    const skipAuthUrls = [
      "auth/register/", 
      "auth/token/", 
      "auth/token/refresh/",
      "auth/centers/check-subdomain/",
    ]; 
    
    const url = config.url || "";
    const shouldSkip = skipAuthUrls.some((u) => url.includes(u));
    
    // Ajouter le token JWT si disponible et nécessaire
    if (!shouldSkip) {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // 🎯 Ajouter le sous-domaine à CHAQUE requête
    const subdomain = getSubdomain();
    if (subdomain) {
      config.headers['X-Tenant-Subdomain'] = subdomain;
      console.log('📡 Requête avec tenant:', subdomain);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Erreur requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => {
    console.log('✅ Réponse:', response.config.url, response.status);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Si erreur 401 et qu'on n'a pas déjà tenté de rafraîchir
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        
        if (refreshToken) {
          console.log('🔄 Tentative de rafraîchissement du token...');
          
          const response = await axios.post(
            `${getBaseURL()}/auth/token/refresh/`,
            { refresh: refreshToken }
          );
          
          const { access } = response.data;
          localStorage.setItem("access_token", access);
          
          // Réessayer la requête originale
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('❌ Échec du rafraîchissement:', refreshError);
        
        // Déconnecter l'utilisateur
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        
        // Rediriger vers la page de connexion
        window.location.href = "/auth/sign-in";
      }
    }
    
    console.error('❌ Erreur réponse:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

// Exporter des utilitaires
export { getSubdomain, getBaseURL };
export default api;