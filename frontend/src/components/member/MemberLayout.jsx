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
    UserCircleIcon,
    ClipboardDocumentListIcon,
    CalendarDaysIcon,
    ChartBarIcon,
    ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/solid";

const MemberLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path) => {
        return location.pathname === path ? "bg-[#00357a]/10" : "";
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        navigate('/sign-in');
    };

    const navigation = [
        {
            label: "Mon Profil",
            path: "/portal/profile",
            icon: UserCircleIcon,
        },
        {
            label: "Mes Programmes",  // ✅ AJOUTÉ
            path: "/portal/programs",
            icon: ClipboardDocumentListIcon,
        },
        {
            label: "Mes Réservations",
            path: "/portal/bookings",
            icon: CalendarDaysIcon,
        },
        {
            label: "Mon Progrès",
            path: "/portal/progress",
            icon: ChartBarIcon,
        },

    ];

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Sidebar */}
            <Card className="h-screen w-full max-w-[18rem] p-4 shadow-xl shadow-blue-gray-900/5 fixed">
                <div className="mb-2 flex items-center gap-4 p-4">
                    <Typography variant="h5" style={{ color: "#00357a" }}>
                        GYMFLOW
                    </Typography>
                </div>
                <List className="overflow-y-auto">
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
                    <ListItem className="mt-4" onClick={handleLogout}>
                        <ListItemPrefix>
                            <ArrowLeftOnRectangleIcon className="h-5 w-5" style={{ color: "#9b0e16" }} />
                        </ListItemPrefix>
                        <Typography style={{ color: "#00357a" }}>
                            Déconnexion
                        </Typography>
                    </ListItem>
                </List>
            </Card>

            {/* Main Content */}
            <div className="pl-[18rem]">
                <main className="min-h-screen bg-gray-50/50 p-4">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MemberLayout;