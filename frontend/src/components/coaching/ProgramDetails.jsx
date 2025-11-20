import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import CoachLayout from '../../components/coaching/CoachLayout';
import coachingService from '../../services/coachingService';
import { 
  User, Calendar, Target, Clock, 
  Edit, Download
} from 'lucide-react';

const ProgramDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProgram();
  }, [id]);

  const loadProgram = async () => {
    try {
      setLoading(true);
      const response = await coachingService.getProgram(id);
      setProgram(response.data);
    } catch (err) {
      console.error('Erreur chargement programme:', err);
      setError('Impossible de charger le programme');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      archived: 'bg-red-100 text-red-800',
    };

    const labels = {
      draft: 'Brouillon',
      active: 'Actif',
      completed: 'Terminé',
      archived: 'Archivé'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status] || styles.draft}`}>
        {labels[status]}
      </span>
    );
  };

  if (loading) {
    return (
      <CoachLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </CoachLayout>
    );
  }

  if (error || !program) {
    return (
      <CoachLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700">{error || 'Programme introuvable'}</p>
          <button
            onClick={() => navigate('/coaching/programs')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Retour à la liste
          </button>
        </div>
      </CoachLayout>
    );
  }

  return (
    <CoachLayout>
      <div className="space-y-6">
        {/* Titre et actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: '#00357a' }}>
                {program.title}
              </h1>
              {getStatusBadge(program.status)}
            </div>
            
            <div className="flex gap-2">
              <Link
                to={`/coaching/programs/${program.id}/edit`}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                title="Modifier"
              >
                <Edit className="w-5 h-5 text-gray-700" />
              </Link>
              <button
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                title="Télécharger PDF"
              >
                <Download className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>

          <p className="text-gray-600 mb-6">{program.description}</p>

          {/* Informations du membre */}
          {program.member_details && (
            <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: '#00357a' + '10' }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: '#00357a' }}>
                {program.member_details.user?.first_name?.[0]}
                {program.member_details.user?.last_name?.[0]}
              </div>
              <div>
                <p className="font-semibold" style={{ color: '#00357a' }}>
                  {program.member_details.user?.first_name} {program.member_details.user?.last_name}
                </p>
                <p className="text-sm text-gray-600">{program.member_details.user?.email}</p>
              </div>
            </div>
          )}
        </div>

        {/* Grille d'informations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-6 h-6" style={{ color: '#9b0e16' }} />
              <h3 className="font-semibold" style={{ color: '#00357a' }}>Période</h3>
            </div>
            <p className="text-gray-600">
              Du {new Date(program.start_date).toLocaleDateString('fr-FR')}
              <br />
              au {new Date(program.end_date).toLocaleDateString('fr-FR')}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-6 h-6" style={{ color: '#9b0e16' }} />
              <h3 className="font-semibold" style={{ color: '#00357a' }}>Durée</h3>
            </div>
            <p className="text-gray-600">{program.duration_weeks} semaines</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-6 h-6" style={{ color: '#9b0e16' }} />
              <h3 className="font-semibold" style={{ color: '#00357a' }}>Sessions</h3>
            </div>
            <p className="text-gray-600">{program.workout_sessions?.length || 0} séances</p>
          </div>
        </div>

        {/* Objectifs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#00357a' }}>Objectifs</h2>
          <p className="text-gray-700 mb-4">{program.goal}</p>
          
          {(program.target_weight || program.target_body_fat) && (
            <div className="grid grid-cols-2 gap-4">
              {program.target_weight && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Poids cible</p>
                  <p className="text-lg font-semibold" style={{ color: '#00357a' }}>{program.target_weight} kg</p>
                </div>
              )}
              {program.target_body_fat && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Masse grasse cible</p>
                  <p className="text-lg font-semibold" style={{ color: '#00357a' }}>{program.target_body_fat}%</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sessions d'entraînement */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#00357a' }}>
            Sessions d'entraînement
          </h2>
          
          {program.workout_sessions && program.workout_sessions.length > 0 ? (
            <div className="space-y-4">
              {program.workout_sessions.map((session) => (
                <div key={session.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold" style={{ color: '#00357a' }}>{session.title}</h3>
                    <span className="text-sm text-gray-600">
                      Semaine {session.week_number} - Jour {session.day_of_week}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Durée: {session.duration_minutes} minutes
                  </p>
                  {session.notes && (
                    <p className="text-sm text-gray-700">{session.notes}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Aucune session d'entraînement définie</p>
          )}
        </div>

        {/* Notes */}
        {program.notes && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#00357a' }}>Notes du coach</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{program.notes}</p>
          </div>
        )}
      </div>
    </CoachLayout>
  );
};

export default ProgramDetails;