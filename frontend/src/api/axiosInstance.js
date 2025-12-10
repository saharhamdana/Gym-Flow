// frontend/src/api/axiosInstance.js

import axios from "axios";

/**
 * Fonction pour extraire le sous-domaine de l'URL actuelle
 */
const getBaseURL = () => {
  const hostname = window.location.hostname;
  const isProduction = import.meta.env.PROD;

  console.log('🌐 Configuration:', { hostname, isProduction });

  // 🚀 EN PRODUCTION
  if (isProduction) {
    return import.meta.env.VITE_API_URL || 'https://gymflow-backend.onrender.com/api/';
  }

  // 💻 EN DÉVELOPPEMENT
  return '/api/';  // Proxy Vite
};

const getSubdomain = () => {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // Production Vercel: xxx.vercel.app
  if (hostname.includes('.vercel.app')) {
    const subdomain = parts[0];
    // Extraire le sous-domaine avant .vercel.app
    // Ex: powerfit-gymflow.vercel.app → powerfit
    if (subdomain.includes('-')) {
      return subdomain.split('-')[0];
    }
    return 'moveup'; // Par défaut
  }
  
  // Sous-domaines .gymflow.com
  if (hostname.includes('.gymflow.com')) {
    const subdomain = parts[0];
    return subdomain !== 'www' ? subdomain : null;
  }
  
  return 'moveup'; // Par défaut
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
});

// ✅ INTERCEPTEUR DE REQUÊTE
api.interceptors.request.use(
  (config) => {
    console.log("🔧 INTERCEPTOR RUNNING");

    const token = localStorage.getItem("access_token");
    const subdomain = getSubdomain();

    console.log("🔑 TOKEN =", token ? "✅ Présent" : "❌ Absent");
    console.log("🏢 TENANT =", subdomain);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (subdomain) {
      config.headers['X-Tenant-Subdomain'] = subdomain;
      config.headers['Tenant-ID'] = subdomain;
    }

    console.log("📤 Headers envoyés:", config.headers);

    return config;
  },
  (error) => {
    console.error("❌ Erreur intercepteur requête:", error);
    return Promise.reject(error);
  }
);

// ✅ INTERCEPTEUR DE RÉPONSE
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    console.error("❌ Erreur API:", error.response?.status, error.response?.data);

    if (error.response?.status === 401) {
      console.warn("⚠️ Token expiré ou invalide - Redirection vers login");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      window.location.href = "/sign-in";
    }

    return Promise.reject(error);
  }
);

export { getSubdomain, getBaseURL };
export default api;