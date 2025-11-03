import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@material-tailwind/react";

// Import de vos composants principaux
import App from "./App";
import { Home } from "./pages/Home"; // 👈 Ajout de l'import pour le composant Home
import HomePage from "./pages/home";
import { SignIn } from "./pages/sign-in"; 
import { SignUp }from "./pages/sign-up";
import Profile from "./pages/Profile.jsx";
import MemberList from "./pages/admin/MemberList";
import CourseTypeList from "./pages/admin/CourseTypeList";
import { Home } from "./pages/home";
import { SignIn } from "./pages/auth/SignIn"; 
import { SignUp } from "./pages/auth/SignUp";
import { ProfilePage } from "./pages/profile";
import { MemberList } from "./pages/admin/members";
import { CourseTypeList } from "./pages/admin/bookings/course-types";
import ReservationList from "./pages/admin/ReservationList";

import "./assets/tailwind.css";
import "./index.css"; 

// --- Composant de Protection des Routes (Authentication) ---
function RequireAuth({ children }) {
    const token = localStorage.getItem("access_token"); 
    return token ? children : <Navigate to="/sign-in" />;
}

// --- Composant de Protection des Routes (Rôles Admin/Coach) ---
function RequireAdminOrCoach({ children }) {
    const token = localStorage.getItem("access_token");
    if (!token) {
        return <Navigate to="/sign-in" />;
    }
    
    // Récupération et parsing des infos utilisateur
    const userInfo = localStorage.getItem("user");
    let user;
    try {
        user = JSON.parse(userInfo);
    } catch (e) {
        // En cas d'erreur de parsing ou si pas de user, renvoyer à la connexion
        return <Navigate to="/sign-in" />; 
    }

    const userRole = user?.role;
    
    if (userRole === "admin" || userRole === "coach") {
        return children;
    }

    // Rediriger les membres vers leur profil (ou une page d'accès refusé)
    return <Navigate to="/profile" />;
}
// -----------------------------------------------------------

ReactDOM.createRoot(document.getElementById("root")).render(
    <StrictMode>
        <BrowserRouter>
            <ThemeProvider>
                {/* 🚨 CORRECTION: Seul le composant principal App est rendu ici.
                    Toutes les Routes sont gérées DANS App.jsx. */}
                <App />
            </ThemeProvider>
        </BrowserRouter>
    </StrictMode>
);
