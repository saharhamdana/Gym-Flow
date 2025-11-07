import React from 'react';
import { 
  User, 
  Calendar, 
  Target, 
  Dumbbell, 
  Clock, 
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const Step5Summary = ({ formData }) => {
  const statusLabels = {
    draft: 'Brouillon',
    active: 'Actif',
    completed: 'Terminé',
    archived: 'Archivé'
  };

  const statusColors = {
    draft: 'bg-yellow-100 text-yellow-800',
    active: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    archived: 'bg-gray-100 text-gray-800'
  };

  const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  const calculateEndDate = (startDate, weeks) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + (weeks * 7));
    return date.toLocaleDateString('fr-FR');
  };

  // Organiser les sessions par semaine
  const sessionsByWeek = formData.workout_sessions.reduce((acc, session) => {
    const week = session.week_number;
    if (!acc[week]) acc[week] = [];
    acc[week].push(session);
    return acc;
  }, {});

  // Statistiques
  const totalExercises = formData.workout_sessions.reduce(
    (sum, session) => sum + (session.exercises?.length || 0), 
    0
  );

  const totalDuration = formData.workout_sessions.reduce(
    (sum, session) => sum + (session.duration_minutes || 0), 
    0
  );

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Récapitulatif du programme
        </h2>
        <p className="text-gray-600">
          Vérifiez les informations avant de créer le programme
        </p>
      </div>

      {/* Alerte si pas de sessions */}
      {formData.workout_sessions.length === 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-yellow-900">Attention</h4>
            <p className="text-sm text-yellow-800 mt-1">
              Vous allez créer un programme sans sessions d'entraînement. 
              Vous pourrez en ajouter plus tard.
            </p>
          </div>
        </div>
      )}

      {/* Informations principales */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">{formData.title}</h3>
        <p className="text-gray-700 mb-4">{formData.description}</p>
        
        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-white shadow-sm">
          <Target className="w-4 h-4 mr-2" />
          {formData.goal}
        </div>
      </div>

      {/* Membre */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <User className="w-5 h-5 text-gray-600 mr-2" />
          <h3 className="font-semibold text-gray-900">Membre</h3>
        </div>
        <div className="pl-7">
          <p className="text-gray-900 font-medium">{formData.member?.full_name}</p>
          <p className="text-sm text-gray-600">{formData.member?.email}</p>
          {formData.member?.phone && (
            <p className="text-sm text-gray-600">{formData.member?.phone}</p>
          )}
        </div>
      </div>

      {/* Configuration */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <Calendar className="w-5 h-5 text-gray-600 mr-2" />
          <h3 className="font-semibold text-gray-900">Configuration</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 pl-7">
          <div>
            <p className="text-sm text-gray-600">Date de début</p>
            <p className="font-medium text-gray-900">
              {new Date(formData.start_date).toLocaleDateString('fr-FR')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Date de fin</p>
            <p className="font-medium text-gray-900">
              {calculateEndDate(formData.start_date, formData.duration_weeks)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Durée</p>
            <p className="font-medium text-gray-900">{formData.duration_weeks} semaines</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Statut</p>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusColors[formData.status]}`}>
              {statusLabels[formData.status]}
            </span>
          </div>
          {formData.target_weight && (
            <div>
              <p className="text-sm text-gray-600">Objectif de poids</p>
              <p className="font-medium text-gray-900">{formData.target_weight} kg</p>
            </div>
          )}
          {formData.target_body_fat && (
            <div>
              <p className="text-sm text-gray-600">Objectif de masse grasse</p>
              <p className="font-medium text-gray-900">{formData.target_body_fat}%</p>
            </div>
          )}
        </div>
      </div>

      {/* Notes du coach */}
      {formData.notes && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <FileText className="w-5 h-5 text-gray-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Notes du coach</h3>
          </div>
          <p className="text-gray-700 pl-7">{formData.notes}</p>
        </div>
      )}

      {/* Sessions d'entraînement */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Dumbbell className="w-5 h-5 text-gray-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Sessions d'entraînement</h3>
          </div>
          <span className="text-sm text-gray-600">
            {formData.workout_sessions.length} session(s)
          </span>
        </div>

        {formData.workout_sessions.length > 0 ? (
          <div className="space-y-4 pl-7">
            {/* Statistiques globales */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {formData.workout_sessions.length}
                </p>
                <p className="text-xs text-gray-600">Sessions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{totalExercises}</p>
                <p className="text-xs text-gray-600">Exercices</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(totalDuration / 60)}h
                </p>
                <p className="text-xs text-gray-600">Durée totale</p>
              </div>
            </div>

            {/* Sessions par semaine */}
            {Object.keys(sessionsByWeek).sort((a, b) => parseInt(a) - parseInt(b)).map(week => (
              <div key={week} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-3 py-2">
                  <h4 className="font-semibold text-sm text-gray-900">Semaine {week}</h4>
                </div>
                <div className="divide-y divide-gray-200">
                  {sessionsByWeek[week].map((session, index) => (
                    <div key={index} className="p-3">
                      <h5 className="font-medium text-gray-900 mb-1">{session.title}</h5>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                        <span>{dayNames[session.day_of_week - 1]}</span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {session.duration_minutes} min
                        </span>
                        <span className="flex items-center">
                          <Dumbbell className="w-3 h-3 mr-1" />
                          {session.exercises?.length || 0} exercice(s)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4 pl-7">
            Aucune session d'entraînement
          </p>
        )}
      </div>

      {/* Message de confirmation */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-green-900">Prêt à créer le programme</h4>
            <p className="text-sm text-green-800 mt-1">
              Cliquez sur "Créer le programme" pour finaliser la création. 
              Vous pourrez modifier le programme à tout moment après sa création.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step5Summary;