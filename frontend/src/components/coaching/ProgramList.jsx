import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import coachingService from '../../services/coachingService';
import { 
  Calendar, User, Target, Download, Copy, 
  Edit, Trash2, Plus, Search, Filter ,ArrowLeft
} from 'lucide-react';
import api from '../../api/axiosInstance';  
const ProgramList = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    member: '',
  });
  
  const navigate = useNavigate(); 

  useEffect(() => {
    loadPrograms();
  }, [filters]);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.member) params.member = filters.member;

      const response = await coachingService.getPrograms(params);
      
      // Gérer la pagination Django REST Framework
      const programsData = response.data?.results || response.data || [];
      
      if (Array.isArray(programsData)) {
        setPrograms(programsData);
      } else {
        console.error('Format de données inattendu:', response.data);
        setPrograms([]);
      }
    } catch (error) {
      console.error('Erreur chargement programmes:', error);
      alert('Erreur lors du chargement des programmes');
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async (programId) => {
    try {
      const response = await coachingService.exportProgramPDF(programId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `programme_${programId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erreur export PDF:', error);
      alert('Erreur lors de l\'export PDF');
    }
  };

  const handleDuplicate = async (programId) => {
    try {
      await coachingService.duplicateProgram(programId);
      alert('Programme dupliqué avec succès');
      loadPrograms();
    } catch (error) {
      console.error('Erreur duplication:', error);
      alert('Erreur lors de la duplication');
    }
  };

  const handleDelete = async (programId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce programme ?')) {
      return;
    }

    try {
      await coachingService.deleteProgram(programId);
      alert('Programme supprimé avec succès');
      loadPrograms();
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      archived: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.draft}`}>
        {status === 'draft' && 'Brouillon'}
        {status === 'active' && 'Actif'}
        {status === 'completed' && 'Terminé'}
        {status === 'archived' && 'Archivé'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="min-w-100xl mx-auto px-40 py-8">
        <button
        onClick={() => navigate('/coach')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour au tableau de bord
        </button>

        {/* Header Section */}
        <div className="flex justify-between items-center mb-8 mt-10">
          <h1 className="text-3xl font-bold text-gray-900">Programmes d'Entraînement</h1>
          <Link
            to="/coaching/programs/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={20} />
            Nouveau Programme
          </Link>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher un programme..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
              >
                <option value="">Tous les statuts</option>
                <option value="draft">Brouillon</option>
                <option value="active">Actif</option>
                <option value="completed">Terminé</option>
                <option value="archived">Archivé</option>
              </select>
            </div>

            {/* Filter Button */}
            <div>
              <button
                onClick={loadPrograms}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Filter size={20} />
                Appliquer
              </button>
            </div>
          </div>
        </div>

        {/* Programs Grid */}
        {!Array.isArray(programs) || programs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="max-w-sm mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun programme trouvé</h3>
              <p className="text-gray-500 mb-6">
                Commencez par créer votre premier programme d'entraînement
              </p>
              <Link
                to="/coaching/programs/create"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                Créer un programme
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {programs.map((program) => (
              <div 
                key={program.id} 
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col"
              >
                <div className="p-6 flex-1 flex flex-col">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
                      {program.title}
                    </h3>
                    {getStatusBadge(program.status)}
                  </div>

                  {/* Description */}
                  {program.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {program.description}
                    </p>
                  )}

                  {/* Info List */}
                  <div className="space-y-3 mb-4 flex-1">
                    {program.member_details?.user && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User size={16} className="text-blue-600" />
                        </div>
                        <span className="font-medium">
                          {program.member_details.user.first_name} {program.member_details.user.last_name}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Calendar size={16} className="text-purple-600" />
                      </div>
                      <span>
                        {new Date(program.start_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} - {new Date(program.end_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    {program.goal && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Target size={16} className="text-green-600" />
                        </div>
                        <span className="line-clamp-1">{program.goal}</span>
                      </div>
                    )}
                  </div>

                  {/* Sessions Count */}
                  <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg mb-4">
                    <span className="text-sm text-gray-600">Sessions d'entraînement</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {program.workout_sessions?.length || 0}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-100">
                    <Link
                      to={`/coaching/programs/${program.id}`}
                      className="col-span-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 text-center text-sm font-medium transition-colors"
                    >
                      Voir Détails
                    </Link>

                    <button
                      onClick={() => handleExportPDF(program.id)}
                      className="bg-gray-100 text-gray-700 p-2.5 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                      title="Exporter en PDF"
                    >
                      <Download size={18} />
                    </button>

                    <button
                      onClick={() => handleDuplicate(program.id)}
                      className="bg-gray-100 text-gray-700 p-2.5 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                      title="Dupliquer"
                    >
                      <Copy size={18} />
                    </button>

                    <Link
                      to={`/coaching/programs/${program.id}/edit`}
                      className="bg-gray-100 text-gray-700 p-2.5 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                      title="Modifier"
                    >
                      <Edit size={18} />
                    </Link>

                    <button
                      onClick={() => handleDelete(program.id)}
                      className="bg-red-50 text-red-600 p-2.5 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center"
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramList;