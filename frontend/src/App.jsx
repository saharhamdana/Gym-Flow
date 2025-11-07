import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Navbar } from "@/widgets/layout"; 
import routes from "./routes"; 
import AdminLayout from "@/components/admin/AdminLayout";
import { RequireAuth, RequireAdminOrReceptionistOrCoach } from "./utils/AuthGuard"; 
import { ProgramList, CreateProgramForm } from "./components/coaching"; // ← Import depuis index.js


function App() {
  const { pathname } = useLocation();
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

                return <Route key={key} exact path={path} element={element} />;
            }
          )}
          
          {/* Routes Coaching */}
          <Route 
            path="/coaching/programs" 
            element={
              <RequireAdminOrReceptionistOrCoach>
                <ProgramList />
              </RequireAdminOrReceptionistOrCoach>
            } 
          />
          <Route 
            path="/coaching/programs/create" 
            element={
              <RequireAdminOrReceptionistOrCoach>
                <CreateProgramForm />
              </RequireAdminOrReceptionistOrCoach>
            } 
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}

export default App;