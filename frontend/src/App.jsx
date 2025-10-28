import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
// NOTE: Ces imports sont basés sur votre code et supposent qu'ils existent
import { Navbar } from "@/widgets/layout"; 
// 💡 Import de toutes les routes définies dans routes.jsx
import routes from "./routes"; 
import { Home } from "./pages/Home"; // Assurez-vous d'importer les composants de base si nécessaire

// --------------------------------------------------------------------------

function App() {
  const { pathname } = useLocation();

  return (
    <>
      {/* Affichage de la Navbar uniquement si ce n'est pas la page de connexion ou d'inscription */}
      {!(pathname === '/sign-in' || pathname === '/sign-up') && (
        <div className="container absolute left-2/4 z-10 mx-auto -translate-x-2/4 p-4">
          {/* La Navbar reçoit les routes pertinentes (ajustez le filtrage si nécessaire) */}
          <Navbar routes={routes.filter(r => r.path !== '/profile')} /> 
        </div>
      )}
      <Routes>
        {routes.map(
          // On s'assure que seuls les éléments avec un 'element' React sont mappés en Route
          ({ path, element }, key) =>
            element && <Route key={key} exact path={path} element={element} />
        )}
        {/* Route de secours si aucune correspondance */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;