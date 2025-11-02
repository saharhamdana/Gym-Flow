// Fichier: frontend/src/components/admin/AdminLayout.jsx

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Card,
    Typography,
    List,
    ListItem,
    ListItemPrefix,
} from "@material-tailwind/react";
import {
    PresentationChartBarIcon,
    UserGroupIcon,
    BuildingOfficeIcon,
    AcademicCapIcon,
    CalendarDaysIcon,
    ClipboardDocumentCheckIcon,
    ClipboardDocumentListIcon, 
    TagIcon, 
} from "@heroicons/react/24/solid";

const Sidebar = () => {
    const location = useLocation();

    const isActive = (path) => {
        // La fonction isActive est parfaite pour gérer les sous-routes (ex: /admin/subscriptions/create)
        return location.pathname.startsWith(path) ? "bg-blue-500/10" : "";
    };

    const navigation = [
        {
            label: "Tableau de bord",
            path: "/admin/dashboard",
            icon: PresentationChartBarIcon,
        },
        {
            label: "Membres",
            path: "/admin/members",
            icon: UserGroupIcon,
        },
        {
            label: "Personnel",
            path: "/admin/staff",
            icon: UserGroupIcon,
        },
        {
            label: "Abonnements",
            path: "/admin/subscriptions",
            icon: ClipboardDocumentListIcon,
        },
        {
            label: "Plans d'Abonnement",
            path: "/admin/subscription-plans",
            path: "/admin/subscription-plans",
            icon: TagIcon,
        },
        {
            label: "Salles",
            path: "/admin/rooms",
            icon: BuildingOfficeIcon,
        },
        {
            label: "Types de cours",
            path: "/admin/course-types",
            icon: AcademicCapIcon,
        },
        {
            label: "Planning Cours",
            path: "/admin/courses",
            icon: CalendarDaysIcon,
        },
        {
            label: "Réservations",
            path: "/admin/bookings",
            icon: ClipboardDocumentCheckIcon,
        },
    ];

    return (
        // ✅ CLÉ 1 : h-screen (pleine hauteur de l'écran) et fixed (reste au défilement)
        <Card className="h-screen w-full max-w-[20rem] p-4 shadow-xl shadow-blue-gray-900/5 fixed top-0 left-0 z-50">
            <div className="mb-2 flex items-center gap-4 p-4">
                <Typography variant="h5" color="blue-gray">
                    Admin Panel
                </Typography>
            </div>
            <List className="overflow-y-auto"> {/* Ajout de l'overflow si la liste est très longue */}
                {navigation.map(({ label, path, icon: Icon }) => (
                    <Link key={path} to={path}>
                        <ListItem className={`mb-1 ${isActive(path)}`}>
                            <ListItemPrefix>
                                <Icon className="h-5 w-5" />
                            </ListItemPrefix>
                            {label}
                        </ListItem>
                    </Link>
                ))}
            </List>
        </Card>
    );
};

const AdminLayout = ({ children }) => {
    return (
        // Le conteneur principal
        <div className="flex min-h-screen bg-gray-50">
            
            {/* 1. Sidebar (Fixed) */}
            <Sidebar /> 
            
            {/* 2. Main Content (Décalé) */}
            {/* ✅ CLÉ 2 : pl-[20rem] pour décaler le contenu principal et éviter qu'il ne passe sous la sidebar */}
            <main className="flex-grow w-full pl-[20rem] p-8">
                {children}
            </main>

        </div>
    );
};

export default AdminLayout;