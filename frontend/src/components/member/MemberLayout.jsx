import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Card,
  Typography,
  List,
  ListItem,
  ListItemPrefix,
  Avatar,
} from "@material-tailwind/react";
import {
  UserCircleIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ArrowLeftOnRectangleIcon,
  HomeIcon,
  UserGroupIcon,
  CreditCardIcon, // 🆕 AJOUT DE CET IMPORT MANQUANT
} from "@heroicons/react/24/solid";

const MemberLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Récupérer les informations utilisateur depuis le localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

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
    // {
    //   label: "Tableau de Bord",
    //   path: "/dashboard",
    //   icon: HomeIcon,
    // },
    {
      label: "Mon Profil",
      path: "/portal/profile",
      icon: UserCircleIcon,
    },
    {
      label: "Mes Programmes",
      path: "/portal/programs",
      icon: ClipboardDocumentListIcon,
    },
    {
      label: "Mes Abonnements", // Correction orthographique
      path: "/portal/subscriptions", // Chemin corrigé
      icon: CreditCardIcon,
    },
    {
      label: "Mes Réservations",
      path: "/portal/bookings",
      icon: CalendarDaysIcon,
    },
    {
      label: "Cours Collectifs",
      path: "/portal/courses",
      icon: UserGroupIcon,
    },
    {
      label: "Mon Progrès",
      path: "/portal/progress",
      icon: ChartBarIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Sidebar - Design modifié avec profil en haut */}
      <Card className="h-screen w-full max-w-[18rem] p-4 shadow-xl shadow-blue-gray-900/5 fixed">
        {/* Header avec GYMFLOW et profil */}
        <div className="mb-6">
          {/* Logo GYMFLOW */}
          <div className="mb-4 p-4 border-b border-gray-200">
            <Typography variant="h5" style={{ color: "#00357a" }} className="text-center font-bold">
              GYMFLOW
            </Typography>
          </div>

          {/* Section Profil */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg mb-4">
            <Avatar
              src={user?.profile_picture_url || "/img/default-avatar.png"}
              alt={user?.first_name || "Membre"}
              size="sm"
              className="border-2 border-[#00357a]"
            />
            <div className="flex-1 min-w-0">
              <Typography
                variant="small"
                className="font-semibold text-gray-900 truncate"
                style={{ color: "#00357a" }}
              >
                {user ? `${user.first_name} ${user.last_name}` : "Chargement..."}
              </Typography>
              <Typography variant="small" className="text-gray-600 truncate">
                {user?.email || "Membre"}
              </Typography>
            </div>
          </div>
        </div>

        {/* Navigation */}
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

          {/* Déconnexion */}
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