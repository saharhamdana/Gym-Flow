import React, { useState, useEffect } from 'react';
import { 
  Calendar, Users, Dumbbell, FileText, BarChart3, 
  Settings, LogOut, Bell, Search, Clock, TrendingUp,
  ArrowRight, Activity, Eye, Plus, ChevronRight,
  Target, Award, Zap
} from 'lucide-react';

const CoachPanel = () => {
  const [stats, setStats] = useState({
    sessions_today: 0,
    total_members: 0,
    completed_sessions: 0,
    satisfaction: 0
  });
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');

  const user = {
    first_name: "Thomas",
    last_name: "Durand",
    email: "thomas.durand@gym.com"
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // ✅ Charger les vraies données depuis l'API
      const token = localStorage.getItem('token');
      const baseURL = 'http://localhost:8000';
      
      // Configuration des headers avec tenant
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // 1. Charger les statistiques du coach
      const statsResponse = await fetch(`${baseURL}/api/coaching/coach/dashboard-stats/`, {
        headers
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // 2. Charger les sessions à venir
      const sessionsResponse = await fetch(`${baseURL}/api/coaching/coach/upcoming-sessions/`, {
        headers
      });
      
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        setUpcomingSessions(sessionsData.slice(0, 5)); // Limiter à 5
      }

      // 3. Charger les membres avec progression
      const membersResponse = await fetch(`${baseURL}/api/coaching/coach/my-members/`, {
        headers
      });
      
      if (membersResponse.ok) {
        const membersData = await membersResponse.json();
        setMembers(membersData.slice(0, 5)); // Limiter à 5
      }

    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      
      // En cas d'erreur, afficher des données vides
      setStats({
        sessions_today: 0,
        total_members: 0,
        completed_sessions: 0,
        satisfaction: 0
      });
      setUpcomingSessions([]);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    alert('Déconnexion...');
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Tableau de Bord',
      icon: BarChart3
    },
    {
      id: 'schedule',
      label: 'Planning',
      icon: Calendar
    },
    {
      id: 'members',
      label: 'Mes Membres',
      icon: Users
    },
    {
      id: 'programs',
      label: 'Programmes',
      icon: Dumbbell
    },
    {
      id: 'exercises',
      label: 'Exercices',
      icon: FileText
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: Settings
    }
  ];

  const handleNavigation = (item) => {
    setActiveMenu(item.id);
    alert(`Navigation vers: ${item.label}`);
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return '#00a000';
    if (progress >= 50) return '#00357a';
    if (progress >= 25) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

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
              {`${user.first_name[0]}${user.last_name[0]}`}
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
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
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

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
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

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
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

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Satisfaction</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats.satisfaction}/5
                    </p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <Award className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Rapides */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => alert('Créer un nouveau programme')}
                className="flex items-center justify-between p-5 bg-gradient-to-r from-[#00357a] to-blue-700 text-white rounded-xl hover:shadow-lg transition-all"
              >
                <div className="flex items-center">
                  <Plus className="w-5 h-5 mr-3" />
                  <span className="font-medium">Nouveau Programme</span>
                </div>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => alert('Voir le planning')}
                className="flex items-center justify-between p-5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:shadow-lg transition-all"
              >
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-3" />
                  <span className="font-medium">Mon Planning</span>
                </div>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => alert('Voir tous les membres')}
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
                <button 
                  onClick={() => alert('Voir toutes les sessions')}
                  className="text-sm font-medium flex items-center hover:opacity-80 transition-opacity" 
                  style={{ color: '#9b0e16' }}
                >
                  Voir tout <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
              <div className="divide-y divide-gray-100">
                {upcomingSessions.map((session) => (
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
                ))}
              </div>
            </div>

            {/* Progrès des membres */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-semibold" style={{ color: '#00357a' }}>
                  Progrès des Membres
                </h3>
                <button 
                  onClick={() => alert('Gérer les programmes')}
                  className="text-sm font-medium flex items-center hover:opacity-80 transition-opacity" 
                  style={{ color: '#9b0e16' }}
                >
                  Gérer programmes <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {members.map((member) => (
                  <div key={member.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{member.member_name}</h4>
                        <p className="text-sm text-gray-600">{member.title}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-semibold text-gray-900">
                          {member.progress}%
                        </span>
                        <button
                          onClick={() => alert(`Voir programme de ${member.member_name}`)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" style={{ color: '#00357a' }} />
                        </button>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="h-2.5 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${member.progress}%`,
                          backgroundColor: getProgressColor(member.progress)
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-blue-900">Programmes Actifs</h4>
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-blue-900">{members.length}</p>
                <p className="text-sm text-blue-700 mt-1">En cours de réalisation</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-green-900">Taux de Réussite</h4>
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-900">
                  {Math.round(members.reduce((sum, m) => sum + m.progress, 0) / members.length)}%
                </p>
                <p className="text-sm text-green-700 mt-1">Progression moyenne</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-purple-900">Prochaine Session</h4>
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-purple-900">
                  {upcomingSessions[0].start_time}
                </p>
                <p className="text-sm text-purple-700 mt-1">
                  {upcomingSessions[0].title}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CoachPanel;