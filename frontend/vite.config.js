import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  
  server: {
    port: 80,  // ← Changer ici
    host: true,
    
    // 🌐 Configuration pour accepter les sous-domaines
    allowedHosts: ['.gymflow.com', 'localhost'],
    
    // Proxy pour l'API (optionnel)
    proxy: {
  '/api': {
    target: 'http://127.0.0.1:8000',
    changeOrigin: true,
    secure: false,
  },
},

    // Configuration CORS
    cors: true,
  },
  
  // Optimisation du build
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});