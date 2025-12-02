import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  Navbar,
  IconButton,
  Typography,
  Button,
} from '@material-tailwind/react';
import {
  Bars3Icon,
  XMarkIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/solid';
import { useState } from 'react';

const SuperAdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { label: 'Dashboard', path: '/superadmin/dashboard', icon: ShieldCheckIcon },
    { label: 'Toutes les Salles', path: '/superadmin/centers', icon: BuildingOfficeIcon },
    { label: 'Tous les Utilisateurs', path: '/superadmin/users', icon: UserGroupIcon },
    { label: 'Statistiques', path: '/superadmin/stats', icon: ChartBarIcon },
    { label: 'Configuration', path: '/superadmin/config', icon: CogIcon },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/sign-in');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar className="sticky top-0 z-50 h-16">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <IconButton
              variant="text"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden"
            >
              {isSidebarOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </IconButton>
            <Typography variant="h5" color="blue-gray" className="flex items-center gap-2">
              <ShieldCheckIcon className="h-6 w-6" />
              SuperAdmin Panel
            </Typography>
          </div>
          <div className="flex items-center gap-4">
            <Typography variant="small">
              Connecté en tant que <strong>SuperAdmin</strong>
            </Typography>
            <Button size="sm" color="red" onClick={handleLogout}>
              <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </Navbar>

      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          open={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          className="h-[calc(100vh-4rem)] w-64 hidden lg:block"
        >
          <div className="p-4">
            <Typography variant="h6" color="blue-gray" className="mb-6">
              Administration Globale
            </Typography>
            <nav className="space-y-1">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 text-blue-gray-700 hover:text-blue-500 transition-colors"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </Sidebar>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;