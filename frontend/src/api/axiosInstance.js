import axios from "axios";

// 👇 Adresse du backend Django
// Assurez-vous que cette URL est correcte
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

// Ajouter automatiquement le token JWT dans chaque requête
api.interceptors.request.use((config) => {
  // Les endpoints d'authentification (login, register, refresh) ne doivent pas envoyer de token
  const skipAuthUrls = ["register/", "token/", "token/refresh/"];
  const url = config.url || "";
  
  // Vérifie si l'URL est une URL d'authentification
  const shouldSkip = skipAuthUrls.some((u) => url.includes(u));
  if (shouldSkip) {
      // Si on est sur une URL d'authentification, on s'assure qu'aucun en-tête d'autorisation n'est envoyé.
      delete config.headers.Authorization; 
      return config;
  }

  // 🔑 Récupère le jeton d'accès
  const token = localStorage.getItem("access_token");
  
  // Si un jeton est trouvé, l'ajouter à l'en-tête Authorization
  if (token) {
    config.headers = config.headers || {};
    // Le format est obligatoire : "Bearer <token_value>"
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // Si aucun jeton n'est trouvé, s'assurer que l'en-tête n'est pas présent
    delete config.headers.Authorization;
  }
  
  return config;
}, (error) => {
    // Gérer les erreurs de la requête si nécessaire
    return Promise.reject(error);
});

export default api;