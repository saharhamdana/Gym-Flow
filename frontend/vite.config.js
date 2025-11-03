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
    port: 5173,
    host: '0.0.0.0', // Permet l'accès depuis n'importe quelle interface
    
    // 🌐 Configuration pour accepter les sous-domaines
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.gymflow.com', // Accepte tous les sous-domaines
      'gymflow.com',
      'www.gymflow.com',
      'powerfit.gymflow.com',
      'titangym.gymflow.com',
      'moveup.gymflow.com',
    ],
    
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