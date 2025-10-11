import axios from "axios";

// 👇 Adresse du backend Django
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

// Ajouter automatiquement le token JWT dans chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;