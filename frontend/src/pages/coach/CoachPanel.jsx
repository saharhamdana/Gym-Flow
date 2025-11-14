// frontend/src/pages/coach/CoachPanel.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { coachAPI } from '../../api/coachAPI';
import { 
  Calendar, Users, Dumbbell, FileText, BarChart3, 
  Settings, LogOut, Menu, X, Bell, Search, Clock, TrendingUp 
} from 'lucide-react';

const CoachPanel = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [members, setMembers] = useState([]);
  const [profilePhoto, setProfilePhoto] = useState(null); // ← AJOUTER
  
  const navigate = useNavigate();

  // Récupérer l'utilisateur depuis localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadDashboardData();
    loadProfilePhoto(); // ← AJOUTER
  }, []);

  // ← AJOUTER CETTE FONCTION
  const loadProfilePhoto = () => {
    const savedPhoto = localStorage.getItem('user_profile_photo');
    if (savedPhoto) {
      setProfilePhoto(savedPhoto);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      let statsData = { sessions_today: 0, total_members: 0, completed_sessions: 0, satisfaction: 0 };
      let sessionsData = [];
      let membersData = [];
      
      try {
        statsData = await coachAPI.getDashboardStats();
      } catch (error) {
        console.error('Erreur stats:', error);
      }
      
      try {
        sessionsData = await coachAPI.getUpcomingSessions();
      } catch (error) {
        console.error('Erreur sessions:', error);
      }
      
      try {
        membersData = await coachAPI.getMyMembers();
      } catch (error) {
        console.error('Erreur membres:', error);
      }

      setStats(statsData);
      setUpcomingSessions(sessionsData);
      setMembers(membersData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_profile_photo'); // ← AJOUTER
    navigate('/sign-in');
  };

  const menuItems = [
    { id: 'dashboard', icon: BarChart3, label: 'Tableau de Bord', path: '/coach' },
    { id: 'schedule', icon: Calendar, label: 'Planning', path: '/coach/schedule' },
    { id: 'members', icon: Users, label: 'Mes Membres', path: '/coach/members' },
    { id: 'programs', icon: Dumbbell, label: 'Programmes', path: '/coaching/programs' },
    { id: 'exercises', icon: FileText, label: 'Exercices', path: '/coach/exercises' },
    { id: 'settings', icon: Settings, label: 'Paramètres', path: '/coach/settings' }
  ];

  const handleNavigation = (item) => {
    if (item.id === 'dashboard') {
      setActiveTab('dashboard');
    } else {
      navigate(item.path);
    }
  };

  const renderContent = () => {
    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sessions Aujourd'hui</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.sessions_today || 0}
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
                  {stats?.total_members || 0}
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
                  {stats?.completed_sessions || 0}
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
                  {stats?.satisfaction || '0.0'}/5
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Sessions à Venir</h2>
            <button 
              onClick={() => navigate('/admin/courses/calendar')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Voir tout →
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
                        <h3 className="font-semibold text-gray-900">{session.title}</h3>
                        <p className="text-sm text-gray-600">
                          {session.room} • {session.participants_count}/{session.max_capacity} participants
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate(`/admin/courses/${session.id}`)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Voir détails
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

        {/* Members Progress */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Progrès des Membres</h2>
            <button 
              onClick={() => navigate('/coaching/programs')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Gérer programmes →
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
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${program.progress}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                Aucun membre assigné
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo & Toggle */}
        <div className="p-6 flex items-center justify-between border-b border-gray-700">
          {sidebarOpen && (
            <div className="flex items-center space-x-2">
              <Dumbbell className="w-8 h-8 text-blue-400" />
              <span className="text-xl font-bold">Gym Flow</span>
            </div>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Coach Profile - MODIFIÉ */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center font-bold text-lg overflow-hidden flex-shrink-0">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`
              )}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-sm text-gray-400 truncate">Coach</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-700">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-8 py-4 flex items-center justify-between">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un membre, une session..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4 ml-6">
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default CoachPanel;