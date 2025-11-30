// File: frontend/src/components/receptionist/ReceptionistLayout.jsx

import React, { useState, useEffect } from "react";
import { Link, useLocation, Navigate } from "react-router-dom";

// Composants Material Tailwind
import {
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemPrefix,
  Avatar,
} from "@material-tailwind/react";

// Icônes
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  UsersIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";

export default function ReceptionistLayout({ children }) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Récupérer l'utilisateur depuis localStorage
  useEffect(() => {
    const userInfo = localStorage.getItem("user");
    if (userInfo) {
      try {
        setUser(JSON.parse(userInfo));
      } catch (error) {
        console.error("Erreur parsing user data:", error);
      }
    }
    setLoading(false);
  }, []);

  const openDrawer = () => setOpen(true);
  const closeDrawer = () => setOpen(false);

  // Déconnexion
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_profile_photo");
    window.location.href = "/sign-in";
  };

  // Vérifier si l'utilisateur est réceptionniste ou admin
  if (!loading && user && user.role !== "RECEPTIONIST" && user.role !== "ADMIN") {
    return <Navigate to="/portal" replace />;
  }

  // Menu items pour réceptionniste
  const menuItems = [
    {
      label: "Tableau de bord",
      icon: ChartBarIcon,
      path: "/receptionist/dashboard",
    },
    {
      label: "Check-in",
      icon: ClipboardDocumentCheckIcon,
      path: "/receptionist/checkin",
    },
    {
      label: "Membres",
      icon: UsersIcon,
      path: "/receptionist/members",
    },
    {
      label: "Abonnements",
      icon: CreditCardIcon,
      path: "/receptionist/subscriptions",
    },
    {
      label: "Réservations",
      icon: CalendarDaysIcon,
      path: "/receptionist/bookings",
    },
  ];

  // Fonction pour vérifier si l'item est actif
  const isActive = (path) => {
    return location.pathname.startsWith(path) 
      ? "bg-blue-500/10 text-blue-600 border-r-2 border-blue-600" 
      : "text-gray-700";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar pour desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white border-r shadow-sm">
          <div className="flex items-center flex-shrink-0 px-4">
            <Typography variant="h5" color="blue-gray" className="ml-2">
              Panel Réceptionniste
            </Typography>
          </div>
          <div className="mt-8 flex-grow flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors hover:bg-gray-100 group ${isActive(item.path)}`}
                >
                  <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Profil utilisateur */}
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center">
                {user?.profile_picture ? (
                  <Avatar
                    src={user.profile_picture}
                    alt={user?.first_name}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <UserCircleIcon className="h-5 w-5 text-white" />
                  </div>
                )}
                <div className="ml-3 min-w-0 flex-1">
                  <Typography variant="small" className="font-medium text-gray-900 truncate">
                    {user?.first_name} {user?.last_name}
                  </Typography>
                  <Typography variant="small" className="text-gray-500 truncate">
                    {user?.role === "RECEPTIONIST" ? "Réceptionniste" : "Administrateur"}
                  </Typography>
                </div>
              </div>
              <IconButton
                variant="text"
                color="blue-gray"
                className="ml-2 flex-shrink-0"
                onClick={handleLogout}
                title="Déconnexion"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
              </IconButton>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header mobile */}
        <header className="lg:hidden bg-white shadow-sm z-10">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <IconButton
                variant="text"
                color="blue-gray"
                onClick={openDrawer}
                className="mr-2"
              >
                <Bars3Icon className="h-6 w-6" />
              </IconButton>
              <Typography variant="h5" color="blue-gray">
                GymFlow
              </Typography>
            </div>
            {user?.profile_picture ? (
              <Avatar
                src={user.profile_picture}
                alt={user?.first_name}
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <UserCircleIcon className="h-5 w-5 text-white" />
              </div>
            )}
          </div>
        </header>

        {/* Drawer mobile */}
        <Drawer open={open} onClose={closeDrawer} className="lg:hidden">
          <div className="flex items-center justify-between p-4 bg-blue-500 text-white">
            <Typography variant="h5">
              Menu Réceptionniste
            </Typography>
            <IconButton variant="text" color="white" onClick={closeDrawer}>
              <XMarkIcon className="h-5 w-5" />
            </IconButton>
          </div>
          <List className="p-0">
            {menuItems.map((item) => (
              <ListItem 
                key={item.path} 
                onClick={closeDrawer}
                className={`${isActive(item.path)} hover:bg-blue-50 focus:bg-blue-50`}
              >
                <Link to={item.path} className="flex items-center w-full">
                  <ListItemPrefix>
                    <item.icon className="h-5 w-5" />
                  </ListItemPrefix>
                  {item.label}
                </Link>
              </ListItem>
            ))}
            <ListItem 
              onClick={handleLogout} 
              className="text-red-600 hover:bg-red-50 focus:bg-red-50"
            >
              <ListItemPrefix>
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </ListItemPrefix>
              Déconnexion
            </ListItem>
          </List>
        </Drawer>

        {/* Contenu des pages */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}