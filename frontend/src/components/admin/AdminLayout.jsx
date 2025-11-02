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
} from "@heroicons/react/24/solid";

const Sidebar = () => {
    const location = useLocation();

    const isActive = (path) => {
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
        <Card className="h-screen w-full max-w-[20rem] p-4 shadow-xl shadow-blue-gray-900/5 fixed">
            <div className="mb-2 flex items-center gap-4 p-4">
                <Typography variant="h5" color="blue-gray">
                    Admin Panel
                </Typography>
            </div>
            <List>
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
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-[20rem] flex-shrink-0">
                <Sidebar />
            </div>
            
            {/* Main Content */}
            <div className="flex-grow p-8 ml-[20rem]">
                {children}
            </div>
        </div>
    );
};

export default AdminLayout;