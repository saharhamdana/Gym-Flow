import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CoachLayout from '../../components/coaching/CoachLayout';
import { coachAPI } from '../../api/coachAPI';
import { 
  Users, Search, TrendingUp, Calendar, 
  Activity, Eye, AlertCircle
} from 'lucide-react';

const CoachMembers = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await coachAPI.getMyMembers();
      setMembers(data);
    } catch (error) {
      console.error('Erreur chargement membres:', error);
      setError('Impossible de charger les membres. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.member_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.member_email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    
    if (filterStatus === 'on-track' && member.progress >= 50) return matchesSearch;
    if (filterStatus === 'needs-attention' && member.progress < 50) return matchesSearch;
    
    return matchesSearch;
  });

  const getProgressColor = (progress) => {
    if (progress >= 75) return '#00a000';
    if (progress >= 50) return '#00357a';
    if (progress >= 25) return '#f59e0b';
    return '#ef4444';
  };

  const getProgressLabel = (progress) => {
    if (progress >= 75) return 'Excellent';
    if (progress >= 50) return 'Bon progrès';
    if (progress >= 25) return 'En cours';
    return 'Début';
  };

  if (loading) {
    return (
      <CoachLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des membres...</p>
          </div>
        </div>
      </CoachLayout>
    );
  }

  if (error) {
    return (
      <CoachLayout>
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-center mb-2" style={{ color: '#00357a' }}>
            Erreur de chargement
          </h3>
          <p className="text-gray-600 text-center mb-4">{error}</p>
          <button
            onClick={loadMembers}
            className="w-full text-white px-4 py-2 rounded-lg hover:opacity-90 transition-colors"
            style={{ backgroundColor: '#9b0e16' }}
          >
            Réessayer
          </button>
        </div>
      </CoachLayout>
    );
  }

  return (
    <CoachLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#00357a' }}>
              Mes Membres
            </h1>
            <p className="text-gray-600 mt-1">
              Gérez et suivez la progression de vos membres
            </p>
          </div>
          <div className="px-4 py-2 rounded-lg" style={{ backgroundColor: '#00357a' + '10' }}>
            <p className="text-sm font-medium" style={{ color: '#00357a' }}>
              {filteredMembers.length} membre(s)
            </p>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les membres</option>
              <option value="on-track">Progrès satisfaisant</option>
              <option value="needs-attention">Besoin d'attention</option>
            </select>
          </div>
        </div>

        {/* Liste des membres */}
        {filteredMembers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#00357a' }}>
              Aucun membre trouvé
            </h3>
            <p className="text-gray-600">
              {searchTerm ? 'Essayez de modifier vos critères de recherche' : 'Vous n\'avez pas encore de membres assignés'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* En-tête carte */}
                <div className="p-6" style={{ background: 'linear-gradient(135deg, #00357a 0%, #004a9e 100%)' }}>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center font-bold text-xl" style={{ color: '#00357a' }}>
                      {member.member_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate text-lg">
                        {member.member_name || 'N/A'}
                      </h3>
                      <p className="text-blue-100 text-sm truncate">
                        {member.member_email || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contenu carte */}
                <div className="p-6">
                  {/* Programme en cours */}
                  <div className="mb-4">
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Activity className="w-4 h-4 mr-2" />
                      <span className="font-medium">Programme actuel</span>
                    </div>
                    <p className="font-medium line-clamp-2" style={{ color: '#00357a' }}>
                      {member.title || 'Aucun programme'}
                    </p>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>
                      {new Date(member.start_date).toLocaleDateString('fr-FR')} - {new Date(member.end_date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>

                  {/* Progression */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Progression</span>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          member.progress >= 50 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {getProgressLabel(member.progress)}
                        </span>
                        <span className="text-sm font-bold" style={{ color: '#00357a' }}>{member.progress}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${member.progress}%`,
                          backgroundColor: getProgressColor(member.progress)
                        }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => navigate(`/coaching/programs/${member.id}`)}
                      className="flex-1 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-colors flex items-center justify-center text-sm font-medium"
                      style={{ backgroundColor: '#9b0e16' }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Voir programme
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats résumé */}
        {filteredMembers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total membres</p>
                  <p className="text-3xl font-bold mt-2" style={{ color: '#00357a' }}>
                    {filteredMembers.length}
                  </p>
                </div>
                <Users className="w-12 h-12" style={{ color: '#9b0e16' }} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Progression moyenne</p>
                  <p className="text-3xl font-bold mt-2" style={{ color: '#00357a' }}>
                    {Math.round(filteredMembers.reduce((sum, m) => sum + m.progress, 0) / filteredMembers.length)}%
                  </p>
                </div>
                <TrendingUp className="w-12 h-12 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Progrès satisfaisant</p>
                  <p className="text-3xl font-bold mt-2" style={{ color: '#00357a' }}>
                    {filteredMembers.filter(m => m.progress >= 50).length}
                  </p>
                </div>
                <Activity className="w-12 h-12 text-purple-600" />
              </div>
            </div>
          </div>
        )}
      </div>
    </CoachLayout>
  );
};

export default CoachMembers;