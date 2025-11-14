import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Navbar } from "@/widgets/layout"; 
import routes from "./routes"; 
import AdminLayout from "@/components/admin/AdminLayout";
import { RequireAuth, RequireAdminOrReceptionistOrCoach, RequireCoach } from "./utils/AuthGuard"; 
import { ProgramList, CreateProgramForm } from "./components/coaching";
import APIDebugTool from './components/debug/APIDebugTool';
import EditProgramForm from './components/coaching/EditProgramForm';
import ProgramDetails from './components/coaching/ProgramDetails';


function App() {
  const { pathname } = useLocation();
  const isAdminRoute = (path) => path.startsWith('/admin/');
  const isCoachRoute = (path) => path.startsWith('/coach');

  return (
    <>
      {/* Navbar - cachée sur sign-in, sign-up, admin et coach */}
      {!(pathname === '/sign-in' || pathname === '/sign-up' || isAdminRoute(pathname) || isCoachRoute(pathname)) && (
        <Navbar routes={routes}/>
      )}
      
      {/* Routes avec wrapper pleine largeur */}
      <div className={`w-full min-h-screen ${
        !(pathname === '/sign-in' || pathname === '/sign-up' || pathname === '/' || isCoachRoute(pathname)) ? 'pt-24' : ''
      }`}>

        <Routes>
          {/* Routes de base depuis routes.jsx */}
          {routes.map(
            ({ path, element }, key) => {
                if (!element) return null;

                // Routes Admin
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

                // Routes Coach - AVEC PROTECTION
                if (isCoachRoute(path)) {
                    return (
                        <Route 
                            key={key} 
                            exact 
                            path={path} 
                            element={
                                <RequireCoach>
                                    {element}
                                </RequireCoach>
                            } 
                        />
                    );
                }

                // Routes membres protégées
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

                // Routes publiques
                return <Route key={key} exact path={path} element={element} />;
            }
          )}
          
          {/* Routes Coaching (hors du système de routes principal) */}
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
          <Route path="/debug" element={<APIDebugTool />} />
          <Route path="/coaching/programs/:id/edit" element={<EditProgramForm />} />
          <Route path="/coaching/programs/:id" element={<ProgramDetails />} />
        </Routes>
      </div>
    </>
  );
}
   
   
export default App;