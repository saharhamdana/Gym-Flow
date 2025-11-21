// Fichier: frontend/src/components/admin/AdminLayout.jsx

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Card,
    Typography,
    List,
    ListItem,
    ListItemPrefix,
    IconButton,
    Avatar,
    Menu,
    MenuHandler,
    MenuList,
    MenuItem,
    Chip,
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
    UserCircleIcon,
    Bars3Icon,
    XMarkIcon,
    ArrowRightOnRectangleIcon,
    Cog6ToothIcon,
} from "@heroicons/react/24/solid";

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const isActive = (path) => {
        return location.pathname.startsWith(path) 
            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md" 
            : "hover:bg-blue-50 text-gray-700 hover:text-blue-600";
    };

    const navigation = [
        {
            label: "Tableau de bord",
            path: "/admin/dashboard",
            icon: PresentationChartBarIcon,
        },
        {
            label: "Mon Profil",
            path: "/admin/profile",
            icon: UserCircleIcon,
        },
        {
            label: "Membres",
            path: "/admin/members",
            icon: UserGroupIcon,
            badge: "Hot",
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

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <>
            {/* Overlay pour mobile */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <Card 
                className={`
                    h-screen w-full max-w-[20rem] p-4 shadow-2xl 
                    fixed top-0 left-0 z-50 
                    transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    bg-gradient-to-b from-white to-gray-50
                `}
            >
                {/* Header avec Logo */}
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <Typography variant="h5" color="white" className="font-bold">
                                Admin Panel
                            </Typography>
                            <Typography variant="small" className="text-blue-100">
                                Gym Flow Manager
                            </Typography>
                        </div>
                        <IconButton 
                            variant="text" 
                            color="white"
                            className="lg:hidden"
                            onClick={onClose}
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </IconButton>
                    </div>
                </div>

                {/* User Info */}
                <div className="mb-4 p-3 bg-blue-50 rounded-xl">
                    <div className="flex items-center gap-3">
                        <Avatar
                            src={user.profile_picture || "/img/default-avatar.png"}
                            alt={user.email}
                            size="md"
                            className="ring-2 ring-blue-500"
                        />
                        <div className="flex-1">
                            <Typography variant="small" className="font-bold text-gray-900">
                                {user.first_name} {user.last_name}
                            </Typography>
                            <Typography variant="small" className="text-gray-600">
                                {user.role}
                            </Typography>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <List className="overflow-y-auto flex-1 space-y-1">
                    {navigation.map(({ label, path, icon: Icon, badge }) => (
                        <Link key={path} to={path} onClick={onClose}>
                            <ListItem 
                                className={`
                                    mb-1 rounded-lg transition-all duration-200
                                    ${isActive(path)}
                                `}
                            >
                                <ListItemPrefix>
                                    <Icon className="h-5 w-5" />
                                </ListItemPrefix>
                                <span className="flex-1">{label}</span>
                                {badge && (
                                    <Chip 
                                        value={badge} 
                                        size="sm" 
                                        color="red" 
                                        className="ml-auto"
                                    />
                                )}
                            </ListItem>
                        </Link>
                    ))}
                </List>

                {/* Footer Actions */}
                <div className="mt-4 space-y-2 pt-4 border-t border-gray-200">
                    <ListItem 
                        className="hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() => navigate('/admin/settings')}
                    >
                        <ListItemPrefix>
                            <Cog6ToothIcon className="h-5 w-5" />
                        </ListItemPrefix>
                        Paramètres
                    </ListItem>
                    <ListItem 
                        className="hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        onClick={handleLogout}
                    >
                        <ListItemPrefix>
                            <ArrowRightOnRectangleIcon className="h-5 w-5" />
                        </ListItemPrefix>
                        Déconnexion
                    </ListItem>
                </div>
            </Card>
        </>
    );
};

const AdminLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            
            {/* Main Content */}
            <main className="flex-1 lg:pl-[20rem] transition-all duration-300">
                {/* Top Bar Mobile */}
                <div className="lg:hidden sticky top-0 z-30 bg-white shadow-md p-4 flex items-center justify-between">
                    <IconButton
                        variant="text"
                        color="blue-gray"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Bars3Icon className="h-6 w-6" />
                    </IconButton>
                    <Typography variant="h6" color="blue-gray">
                        Admin Panel
                    </Typography>
                    <div className="w-10" /> {/* Spacer */}
                </div>

                {/* Content Area */}
                <div className="p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;