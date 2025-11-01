import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import coachingService from '../../services/coachingService';
import { 
  Calendar, User, Target, Download, Copy, 
  Edit, Trash2, Plus, Search, Filter 
} from 'lucide-react';

const ProgramList = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    member: '',
  });

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
      setPrograms(response.data);
    } catch (error) {
      console.error('Erreur chargement programmes:', error);
      alert('Erreur lors du chargement des programmes');
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
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
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
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Programmes d'Entraînement</h1>
        <Link
          to="/coaching/programs/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Nouveau Programme
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tous les statuts</option>
            <option value="draft">Brouillon</option>
            <option value="active">Actif</option>
            <option value="completed">Terminé</option>
            <option value="archived">Archivé</option>
          </select>

          <button
            onClick={loadPrograms}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2"
          >
            <Filter size={20} />
            Filtrer
          </button>
        </div>
      </div>

      {/* Programs List */}
      {programs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 text-lg">Aucun programme trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <div key={program.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 flex-1">
                    {program.title}
                  </h3>
                  {getStatusBadge(program.status)}
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {program.description}
                </p>

                {/* Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <User size={16} className="mr-2 text-gray-400" />
                    <span>{program.member_details?.user?.first_name} {program.member_details?.user?.last_name}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar size={16} className="mr-2 text-gray-400" />
                    <span>
                      {new Date(program.start_date).toLocaleDateString('fr-FR')} - {new Date(program.end_date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Target size={16} className="mr-2 text-gray-400" />
                    <span className="line-clamp-1">{program.goal}</span>
                  </div>
                </div>

                {/* Sessions Count */}
                <div className="text-sm text-gray-500 mb-4">
                  {program.workout_sessions?.length || 0} session(s) d'entraînement
                </div>

                {/* Actions */}
                <div className="flex gap-2 border-t pt-4">
                  <Link
                    to={`/coaching/programs/${program.id}`}
                    className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 text-center text-sm font-medium"
                  >
                    Voir Détails
                  </Link>

                  <button
                    onClick={() => handleExportPDF(program.id)}
                    className="bg-gray-50 text-gray-600 p-2 rounded-lg hover:bg-gray-100"
                    title="Exporter en PDF"
                  >
                    <Download size={18} />
                  </button>

                  <button
                    onClick={() => handleDuplicate(program.id)}
                    className="bg-gray-50 text-gray-600 p-2 rounded-lg hover:bg-gray-100"
                    title="Dupliquer"
                  >
                    <Copy size={18} />
                  </button>

                  <Link
                    to={`/coaching/programs/${program.id}/edit`}
                    className="bg-gray-50 text-gray-600 p-2 rounded-lg hover:bg-gray-100"
                    title="Modifier"
                  >
                    <Edit size={18} />
                  </Link>

                  <button
                    onClick={() => handleDelete(program.id)}
                    className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100"
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
  );
};

export default ProgramList;