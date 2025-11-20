import React, { useState, useEffect } from 'react';
import { 
  Calendar, Users, Dumbbell, FileText, BarChart3, 
  Settings, LogOut, Bell, Search, Clock, TrendingUp,
  ArrowRight, Activity, Eye
} from 'lucide-react';

// Simuler les données
const mockStats = {
  sessions_today: 3,
  total_members: 12,
  completed_sessions: 45,
  satisfaction: 4.5
};

const mockUpcomingSessions = [
  {
    id: 1,
    title: "CrossFit Débutant",
    start_time: "09:00",
    room: "Salle A",
    participants_count: 8,
    max_capacity: 10
  },
  {
    id: 2,
    title: "Yoga Flow",
    start_time: "11:00",
    room: "Salle B",
    participants_count: 12,
    max_capacity: 15
  },
  {
    id: 3,
    title: "HIIT Avancé",
    start_time: "14:00",
    room: "Salle A",
    participants_count: 15,
    max_capacity: 15
  }
];

const mockMembers = [
  {
    id: 1,
    member_name: "Marie Dubois",
    title: "Programme Perte de Poids",
    progress: 65
  },
  {
    id: 2,
    member_name: "Jean Martin",
    title: "Programme Force",
    progress: 80
  },
  {
    id: 3,
    member_name: "Sophie Bernard",
    title: "Programme Tonification",
    progress: 45
  }
];

const CoachPanel = () => {
  const [stats] = useState(mockStats);
  const [upcomingSessions] = useState(mockUpcomingSessions);
  const [members] = useState(mockMembers);
  const [profilePhoto] = useState(null);
  const [activeMenu, setActiveMenu] = useState('dashboard');

  // Simuler l'utilisateur
  const user = {
    first_name: "Thomas",
    last_name: "Durand",
    email: "thomas.durand@gym.com"
  };

  const handleLogout = () => {
    alert('Déconnexion...');
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Tableau de Bord',
      icon: BarChart3,
      color: '#00357a'
    },
    {
      id: 'schedule',
      label: 'Planning',
      icon: Calendar,
      color: '#00357a'
    },
    {
      id: 'members',
      label: 'Mes Membres',
      icon: Users,
      color: '#00357a'
    },
    {
      id: 'programs',
      label: 'Programmes',
      icon: Dumbbell,
      color: '#00357a'
    },
    {
      id: 'exercises',
      label: 'Exercices',
      icon: FileText,
      color: '#00357a'
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: Settings,
      color: '#00357a'
    }
  ];

  const handleNavigation = (item) => {
    setActiveMenu(item.id);
    alert(`Navigation vers: ${item.label}`);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex">
      {/* Sidebar */}
      <div className="w-72 bg-white shadow-xl fixed h-screen overflow-y-auto">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold" style={{ color: '#00357a' }}>
            GYMFLOW
          </h1>
          <p className="text-sm text-gray-600 mt-1">Espace Coach</p>
        </div>

        {/* Profile Card */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: '#00357a', color: 'white' }}>
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                `${user.first_name[0]}${user.last_name[0]}`
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-sm text-gray-600 truncate">Coach Sportif</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavigation(item)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[#00357a]/10 text-[#00357a] font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon 
                      className="w-5 h-5 flex-shrink-0" 
                      style={{ color: isActive ? '#9b0e16' : '#6b7280' }}
                    />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" style={{ color: '#9b0e16' }} />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-72">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 max-w-xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher un membre, une session..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00357a] focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4 ml-6">
                <button className="relative p-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Bell className="w-6 h-6" />
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-8">
          <div className="space-y-6">
            {/* Welcome Message */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Bienvenue, {user.first_name} ! 👋
              </h2>
              <p className="text-gray-600 mt-1">
                Voici un aperçu de votre activité aujourd'hui
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Sessions Aujourd'hui</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats.sessions_today}
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Membres Actifs</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats.total_members}
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Sessions Complétées</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats.completed_sessions}
                    </p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Satisfaction</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats.satisfaction}/5
                    </p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Rapides */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => alert('Navigation vers Nouveau Programme')}
                className="flex items-center justify-between p-5 bg-gradient-to-r from-[#00357a] to-blue-700 text-white rounded-xl hover:shadow-lg transition-all"
              >
                <div className="flex items-center">
                  <Dumbbell className="w-5 h-5 mr-3" />
                  <span className="font-medium">Nouveau Programme</span>
                </div>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => alert('Navigation vers Planning')}
                className="flex items-center justify-between p-5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:shadow-lg transition-all"
              >
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-3" />
                  <span className="font-medium">Planning</span>
                </div>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => alert('Navigation vers Mes Membres')}
                className="flex items-center justify-between p-5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:shadow-lg transition-all"
              >
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-3" />
                  <span className="font-medium">Mes Membres</span>
                </div>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Sessions à venir */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-semibold" style={{ color: '#00357a' }}>
                  Sessions à Venir
                </h3>
                <button className="text-sm font-medium flex items-center" style={{ color: '#9b0e16' }}>
                  Voir tout <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
              <div className="divide-y divide-gray-100">
                {upcomingSessions.length > 0 ? (
                  upcomingSessions.map((session) => (
                    <div key={session.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="bg-blue-100 px-3 py-2 rounded-lg">
                            <span className="text-blue-700 font-semibold text-sm">
                              {session.start_time}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{session.title}</h4>
                            <p className="text-sm text-gray-600">
                              {session.room} • {session.participants_count}/{session.max_capacity} participants
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => alert(`Voir détails de ${session.title}`)}
                          className="px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center"
                          style={{ backgroundColor: '#00357a', color: 'white' }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Détails
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-8 text-center text-gray-500">
                    Aucune session à venir
                  </div>
                )}
              </div>
            </div>

            {/* Progrès des membres */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-semibold" style={{ color: '#00357a' }}>
                  Progrès des Membres
                </h3>
                <button className="text-sm font-medium flex items-center" style={{ color: '#9b0e16' }}>
                  Gérer programmes <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {members.length > 0 ? (
                  members.map((program) => (
                    <div key={program.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{program.member_name}</h4>
                          <p className="text-sm text-gray-600">{program.title}</p>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {program.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="h-2.5 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${program.progress}%`,
                            backgroundColor: '#00357a'
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Dumbbell className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>Aucun membre assigné</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CoachPanel;