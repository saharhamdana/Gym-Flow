import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@material-tailwind/react";

// --- Import de vos composants principaux (Consolidé pour éviter les doublons) ---
import App from "./App";

// Les imports en conflit ont été remplacés par la version structurée (nommée) ci-dessous.
import { SignUp } from "./pages/auth/SignUp";
import { ProfilePage } from "./pages/profile";
import { MemberList } from "./pages/admin/members";
import { CourseTypeList } from "./pages/admin/bookings/course-types";
import ReservationList from "./pages/admin/ReservationList"; // Gardé car c'était un import par défaut unique

import "./assets/tailwind.css";
import "./index.css"; 

// 🚨 Note: Les composants de protection de route (RequireAuth, RequireAdminOrCoach)
// ont été retirés de ce fichier car ils ne sont pas utilisés directement ici et
// devraient être définis dans un module de routes (e.g., App.jsx ou un hook) pour la propreté.

// -----------------------------------------------------------

ReactDOM.createRoot(document.getElementById("root")).render(
    <StrictMode>
        <BrowserRouter>
            <ThemeProvider>
                {/* 🚨 CORRECTION: Seul le composant principal App est rendu ici.
                    Toutes les Routes, y compris celles utilisant les composants importés ci-dessus,
                    doivent être gérées DANS App.jsx. */}
                <App />
            </ThemeProvider>
        </BrowserRouter>
    </StrictMode>
);