import axios from "axios";

// Instance spécifique pour superadmin - SANS tenant headers
const superadminApi = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://api.gymflow.com/api/",
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur simple sans tenant
superadminApi.interceptors.request.use(
  (config) => {
    console.log("👑 SuperAdmin API - URL:", config.url);
    
    const token = localStorage.getItem("access_token");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Token ajouté pour superadmin");
    }
    
    return config;
  },
  (error) => {
    console.error("❌ Erreur superadmin API:", error);
    return Promise.reject(error);
  }
);

export default superadminApi;