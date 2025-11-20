import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Card,
    Typography,
    List,
    ListItem,
    ListItemPrefix,
} from "@material-tailwind/react";
import {
    ChartBarIcon,
    CalendarDaysIcon,
    UsersIcon,
    ClipboardDocumentListIcon,
    AcademicCapIcon,
    Cog6ToothIcon,
    ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/solid";

const CoachLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const profilePhoto = localStorage.getItem('user_profile_photo');

    const isActive = (path) => {
        return location.pathname === path ? "bg-[#00357a]/10" : "";
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        localStorage.removeItem('user_profile_photo');
        navigate('/sign-in');
    };

    const navigation = [
        {
            label: "Tableau de Bord",
            path: "/coach",
            icon: ChartBarIcon,
        },
        {
            label: "Planning",
            path: "/coach/schedule",
            icon: CalendarDaysIcon,
        },
        {
            label: "Mes Membres",
            path: "/coach/members",
            icon: UsersIcon,
        },
        {
            label: "Programmes",
            path: "/coaching/programs",
            icon: ClipboardDocumentListIcon,
        },
        {
            label: "Exercices",
            path: "/coach/exercises",
            icon: AcademicCapIcon,
        },
        {
            label: "Paramètres",
            path: "/coach/settings",
            icon: Cog6ToothIcon,
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50/50">
            <Card className="h-screen w-full max-w-[18rem] p-4 shadow-xl shadow-blue-gray-900/5 fixed">
                <div className="mb-2 flex items-center gap-4 p-4 border-b border-gray-200">
                    <Typography variant="h5" style={{ color: "#00357a" }}>
                        GYMFLOW
                    </Typography>
                </div>

                <div className="p-4 mb-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center font-bold text-lg overflow-hidden flex-shrink-0">
                            {profilePhoto ? (
                                <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-white">
                                    {user?.first_name?.[0] || ''}{user?.last_name?.[0] || ''}
                                </span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <Typography variant="small" className="font-semibold truncate" style={{ color: "#00357a" }}>
                                {user?.first_name} {user?.last_name}
                            </Typography>
                            <Typography variant="small" className="text-gray-600 text-xs">
                                Coach
                            </Typography>
                        </div>
                    </div>
                </div>

                <List className="overflow-y-auto flex-1">
                    {navigation.map(({ label, path, icon: Icon }) => (
                        <Link key={path} to={path}>
                            <ListItem className={`mb-1 ${isActive(path)}`}>
                                <ListItemPrefix>
                                    <Icon className="h-5 w-5" style={{ color: "#9b0e16" }} />
                                </ListItemPrefix>
                                <Typography style={{ color: "#00357a" }}>
                                    {label}
                                </Typography>
                            </ListItem>
                        </Link>
                    ))}
                    
                    <ListItem className="mt-4 border-t border-gray-200 pt-4" onClick={handleLogout}>
                        <ListItemPrefix>
                            <ArrowLeftOnRectangleIcon className="h-5 w-5" style={{ color: "#9b0e16" }} />
                        </ListItemPrefix>
                        <Typography style={{ color: "#00357a" }}>
                            Déconnexion
                        </Typography>
                    </ListItem>
                </List>
            </Card>

            <div className="pl-[18rem]">
                <main className="min-h-screen bg-gray-50/50 p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default CoachLayout;