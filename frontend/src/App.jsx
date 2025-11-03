// Fichier: frontend/src/App.jsx

import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Navbar } from "@/widgets/layout"; 
import routes from "./routes"; 
import AdminLayout from "@/components/admin/AdminLayout";
import { RequireAuth, RequireAdminOrReceptionistOrCoach } from "./utils/AuthGuard"; 
import ProgramList from "./components/coaching/ProgramList";


function App() {
  const { pathname } = useLocation();

  // Fonction utilitaire pour déterminer si une route est admin (commence par /admin/)
  const isAdminRoute = (path) => path.startsWith('/admin/');

  return (
    <>
      {/* Navbar avec son style original */}
      {!(pathname === '/sign-in' || pathname === '/sign-up' || isAdminRoute(pathname)) && (
        <Navbar />
      )}
      
      {/* Routes avec wrapper pleine largeur - SANS padding-top pour la home page */}
      <div className={`w-full min-h-screen ${
        !(pathname === '/sign-in' || pathname === '/sign-up' || pathname === '/') ? 'pt-24' : ''
      }`}>
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
                            element={
                                <RequireAdminOrReceptionistOrCoach>
                                    <AdminLayout>
                                        {element}
                                    </AdminLayout>
                                </RequireAdminOrReceptionistOrCoach>
                            } 
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
          <Route path="/coaching/programs" element={<ProgramList />} />
        </Routes>
      </div>
    </>
  );
}

export default App;