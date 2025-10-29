// Fichier: utils/AuthGuard.jsx

import React from "react";
import { Navigate } from "react-router-dom";

// 1. Protection basique (pour les routes nécessitant d'être connecté)
export function RequireAuth({ children }) {
    const token = localStorage.getItem("access_token"); 
    return token ? children : <Navigate to="/sign-in" />;
}

// 2. Protection par Rôle (pour la gestion des membres)
export function RequireAdminOrReceptionistOrCoach({ children }) {
    const token = localStorage.getItem("access_token");
    if (!token) {
        return <Navigate to="/sign-in" />;
    }
    
    const userInfo = localStorage.getItem("user");
    let user;
    try {
        user = JSON.parse(userInfo);
    } catch (e) {
        return <Navigate to="/sign-in" />; 
    }

    // Rôles attendus du backend
    const userRole = user?.role; 
    
    // Les rôles autorisés à gérer les membres sont ADMIN, RECEPTIONIST, et COACH
    if (userRole === "ADMIN" || userRole === "RECEPTIONIST" || userRole === "COACH") {
        return children;
    }

    // Redirige vers la page d'accueil si non autorisé
    return <Navigate to="/" />; 
}