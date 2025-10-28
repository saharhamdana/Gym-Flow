import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Menu, 
  X, 
  LogOut, 
  Home,
  CreditCard,
  Settings,
  Bell,
  Search
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await api.get("me/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(res.data);
    } catch (err) {
      console.error(err);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', badge: null },
    { id: 'members', icon: Users, label: 'Membres', badge: '247' },
    { id: 'subscriptions', icon: CreditCard, label: 'Abonnements', badge: null },
    { id: 'schedule', icon: Calendar, label: 'Planning', badge: '5' },
    { id: 'settings', icon: Settings, label: 'Paramètres', badge: null }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-blue-900 text-white transition-all duration-300 flex flex-col`}>
        
        {/* Logo & Toggle */}
        <div className="p-4 flex items-center justify-between border-b border-blue-800">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">
                <span className="text-white">gym</span>
                <span className="text-red-500">flo</span>
              </div>
            </div>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="p-2 hover:bg-blue-800 rounded-lg transition"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* User Info */}
        {sidebarOpen && (
          <div className="p-4 border-b border-blue-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-semibold">{user?.username}</p>
                <p className="text-xs text-blue-300">{user?.role || 'Admin'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                currentPage === item.id 
                  ? 'bg-blue-800 text-white' 
                  : 'hover:bg-blue-800 text-blue-200'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {sidebarOpen && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-blue-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-800 rounded-lg transition text-red-300 hover:text-red-200"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between px-8 py-4">
            <div>
              <h1 className="text-2xl font-bold text-blue-900">
                {menuItems.find(m => m.id === currentPage)?.label || 'Dashboard'}
              </h1>
              <p className="text-gray-600 text-sm">Bienvenue, {user?.username}</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition relative">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                <Search className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          {currentPage === 'dashboard' && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  icon={Users}
                  title="Membres actifs"
                  value="247"
                  change={12}
                  color="bg-blue-600"
                />
                <StatCard
                  icon={DollarSign}
                  title="Revenus ce mois"
                  value="12,450 DT"
                  change={8}
                  color="bg-green-600"
                />
                <StatCard
                  icon={Calendar}
                  title="Cours aujourd'hui"
                  value="18"
                  change={-3}
                  color="bg-red-600"
                />
                <StatCard
                  icon={TrendingUp}
                  title="Taux occupation"
                  value="87%"
                  change={5}
                  color="bg-orange-600"
                />
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-blue-900 mb-4">Activité récente</h2>
                <div className="space-y-4">
                  {[
                    { name: 'Marie Dubois', action: 'a renouvelé son abonnement Premium', time: '5 min' },
                    { name: 'Thomas Martin', action: "s'est inscrit (Basic)", time: '12 min' },
                    { name: 'Sophie Laurent', action: 'a réservé un cours de Yoga', time: '23 min' },
                    { name: 'Lucas Bernard', action: 'a terminé une séance coaching', time: '1h' }
                  ].map((activity, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center text-white font-semibold">
                          {activity.name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{activity.name}</p>
                          <p className="text-sm text-gray-600">{activity.action}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">Il y a {activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {currentPage === 'subscriptions' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SubscriptionCard
                  name="Basic"
                  price="29"
                  features={['Accès salle', 'Casier', 'Support email']}
                />
                <SubscriptionCard
                  name="Premium"
                  price="49"
                  features={['Tout Basic', 'Cours collectifs', '2 séances coach']}
                  popular
                />
                <SubscriptionCard
                  name="Elite"
                  price="89"
                  features={['Tout Premium', 'Coach perso', 'Programme nutrition']}
                />
              </div>
            </div>
          )}

          {['members', 'schedule', 'settings'].includes(currentPage) && (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="text-gray-400 mb-4">
                {currentPage === 'members' && <Users className="w-16 h-16 mx-auto" />}
                {currentPage === 'schedule' && <Calendar className="w-16 h-16 mx-auto" />}
                {currentPage === 'settings' && <Settings className="w-16 h-16 mx-auto" />}
              </div>
              <p className="text-gray-500">Module à venir dans les prochains sprints</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Composant StatCard
function StatCard({ icon: Icon, title, value, change, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change && (
          <span className={`text-sm font-semibold ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change > 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <h3 className="text-gray-600 text-sm mb-1">{title}</h3>
      <p className="text-2xl font-bold text-blue-900">{value}</p>
    </div>
  );
}

// Composant SubscriptionCard
function SubscriptionCard({ name, price, features, popular }) {
  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition ${
      popular ? 'ring-2 ring-blue-900' : ''
    }`}>
      {popular && (
        <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
          POPULAIRE
        </span>
      )}
      <h3 className="text-xl font-bold text-blue-900 mt-4 mb-2">{name}</h3>
      <div className="flex items-baseline mb-4">
        <span className="text-4xl font-bold text-blue-900">{price} DT</span>
        <span className="text-gray-600 ml-2">/mois</span>
      </div>
      <ul className="space-y-3 mb-6">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-center text-gray-700">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <button className={`w-full py-3 rounded-full font-bold transition ${
        popular 
          ? 'bg-blue-900 text-white hover:bg-blue-800' 
          : 'bg-gray-100 text-blue-900 hover:bg-gray-200'
      }`}>
        Sélectionner
      </button>
    </div>
  );
}