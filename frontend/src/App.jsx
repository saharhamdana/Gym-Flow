// Fichier: frontend/src/App.jsx

import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Navbar } from "@/widgets/layout"; 
import routes from "./routes"; 
// 🌟 Importez les nouvelles gardes de protection
import { RequireAuth, RequireAdminOrReceptionistOrCoach } from "./utils/AuthGuard"; 

function App() {
  const { pathname } = useLocation();

  // Fonction utilitaire pour déterminer si une route est admin (commence par /admin/)
  const isAdminRoute = (path) => path.startsWith('/admin/');

  return (
    <>
      {/* Navbar avec son style original */}
      {!(pathname === '/sign-in' || pathname === '/sign-up') && (
        <div className="container absolute left-2/4 z-10 mx-auto -translate-x-2/4 p-4">
          {/* Filtrez les routes cachées si besoin */}
          <Navbar routes={routes.filter(r => r.path !== '/profile' && !r.hidden)} /> 
        </div>
      )}
      
      {/* Routes avec wrapper pleine largeur */}
      <div className="w-full min-h-screen">
        <Routes>
          {routes.map(
            ({ path, element }, key) => {
                if (!element) return null;

                // Protège les routes Admin/Coach/Réceptionniste
                if (isAdminRoute(path)) {
                    return (
                        <Route 
                            key={key} 
                            exact 
                            path={path} 
                            element={<RequireAdminOrReceptionistOrCoach>{element}</RequireAdminOrReceptionistOrCoach>} 
                        />
                    );
                }

                // Protège les routes Membre (Profile, Programmes)
                if (path === '/profile' || path === '/my-programs') {
                    return (
                        <Route 
                            key={key} 
                            exact 
                            path={path} 
                            element={<RequireAuth>{element}</RequireAuth>} 
                        />
                    );
                }

                // Routes publiques (Home, Sign-in, Sign-up, Docs)
                return <Route key={key} exact path={path} element={element} />;
            }
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}

export default App;