import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Navbar } from "@/widgets/layout"; 
import routes from "./routes"; 
import { RequireAuth, RequireAdminOrReceptionistOrCoach } from "./utils/AuthGuard"; 
import { ProgramList, CreateProgramForm } from "./components/coaching"; // ← Import depuis index.js

function App() {
  const { pathname } = useLocation();
  const isAdminRoute = (path) => path.startsWith('/admin/');

  return (
    <>
      {!(pathname === '/sign-in' || pathname === '/sign-up') && (
        <div className="container absolute left-2/4 z-10 mx-auto -translate-x-2/4 p-4">
          <Navbar routes={routes.filter(r => r.path !== '/profile' && !r.hidden)} /> 
        </div>
      )}
      
      <div className="w-full min-h-screen">
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
                            element={<RequireAdminOrReceptionistOrCoach>{element}</RequireAdminOrReceptionistOrCoach>} 
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