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
    port: 80,  // ✅ Vous gardez le port 80
    host: '0.0.0.0',
    
    allowedHosts: [
      'localhost',
      '.gymflow.com',
      'gymflow.com'
    ],
    
    // 🔥 PROXY AMÉLIORÉ POUR PORT 80
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('🔄 Proxy:', req.method, req.url);
            // Transmettre le sous-domaine
            const host = req.headers.host;
            if (host && host.includes('.gymflow.com')) {
              const subdomain = host.split('.')[0];
              proxyReq.setHeader('X-Tenant-Subdomain', subdomain);
            }
          });
        }
      }
    },

    cors: true,
  },
  
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});