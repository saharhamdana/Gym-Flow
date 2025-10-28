import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Navbar } from "@/widgets/layout"; 
import routes from "./routes"; 
import { Home } from "./pages/Home";

function App() {
  const { pathname } = useLocation();

  return (
    <>
      {/* Navbar avec son style original */}
      {!(pathname === '/sign-in' || pathname === '/sign-up') && (
        <div className="container absolute left-2/4 z-10 mx-auto -translate-x-2/4 p-4">
          <Navbar routes={routes.filter(r => r.path !== '/profile')} /> 
        </div>
      )}
      
      {/* Routes avec wrapper pleine largeur */}
      <div className="w-full min-h-screen">
        <Routes>
          {routes.map(
            ({ path, element }, key) =>
              element && <Route key={key} exact path={path} element={element} />
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}

export default App;