// Fichier: frontend/src/api/axiosInstance.js

import axios from "axios";

/**
 * Fonction pour extraire le sous-domaine de l'URL actuelle
 * Ex: powerfit.gymflow.com → "powerfit"
 *     moveup.localhost → "moveup"
 */
const getBaseURL = () => {
  const hostname = window.location.hostname;
  const port = window.location.port;

  console.log('🌐 Configuration:', { hostname, port });

  // 💻 EN DÉVELOPPEMENT SUR PORT 80
  // Peu importe le sous-domaine, utilisez le proxy
  return '/api/';  // ✅ Le proxy Vite fera le reste
};

const getSubdomain = () => {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // Sous-domaines .gymflow.com (avec ou sans port)
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


// ✅ INTERCEPTEUR DE REQUÊTE - Ajouter le token et le tenant-id
api.interceptors.request.use(
  (config) => {
    console.log("🔧 INTERCEPTOR RUNNING");

    // 1️⃣ Récupérer le token depuis localStorage
    const token = localStorage.getItem("access_token"); // ✅ NOM CORRIGÉ
    
    // 2️⃣ Récupérer le subdomain (tenant_id)
    const subdomain = getSubdomain();

    console.log("🔑 TOKEN =", token ? "✅ Présent" : "❌ Absent");
    console.log("🏢 TENANT =", subdomain);

    // 3️⃣ Ajouter les headers SANS écraser ceux existants
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (subdomain) {
      config.headers['X-Tenant-Subdomain'] = subdomain;
      config.headers['Tenant-ID'] = subdomain; // ✅ Ajouter aussi Tenant-ID
    }

    console.log("📤 Headers envoyés:", config.headers);

    return config;
  },
  (error) => {
    console.error("❌ Erreur intercepteur requête:", error);
    return Promise.reject(error);
  }
);


// ✅ INTERCEPTEUR DE RÉPONSE - Gérer les erreurs
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    console.error("❌ Erreur API:", error.response?.status, error.response?.data);

    // Si erreur 401 (non autorisé), rediriger vers login
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


// Exporter des utilitaires
export { getSubdomain, getBaseURL };
export default api;