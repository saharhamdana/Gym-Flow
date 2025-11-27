// Fichier: frontend/src/api/axiosInstance.js

import axios from "axios";

/**
 * Fonction pour extraire le sous-domaine de l'URL actuelle
 * Ex: powerfit.gymflow.com → "powerfit"
 *     moveup.localhost → "moveup"
 */
const getSubdomain = () => {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // En développement sur localhost simple (sans sous-domaine)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Retourner un tenant par défaut en dev
    return 'powerfit'; // ✅ Changez selon votre centre par défaut
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
  
  // Retour par défaut
  return 'powerfit';
};

/**
 * Déterminer l'URL de base de l'API
 */
const getBaseURL = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;

  console.log("🌐 Hostname:", hostname, "Port:", port);

  // 💻 En développement avec sous-domaines gymflow.com
  if (hostname.endsWith('.gymflow.com')) {
    if (hostname === 'api.gymflow.com') {
      return "http://127.0.0.1:8000/api/";
    }
    return "http://127.0.0.1:8000/api/";
  }

  // 💻 En développement local standard
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return "http://127.0.0.1:8000/api/";
  }

  // 🚀 En production
  return `${protocol}//api.gymflow.com/api/`;
};

// Créer l'instance Axios
const api = axios.create({
  baseURL: getBaseURL(),
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