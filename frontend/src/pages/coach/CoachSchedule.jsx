import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { coachAPI } from '../../api/coachAPI';
import api from '../../api/axiosInstance';
import { 
  Calendar, Clock, Users, MapPin, ChevronLeft, 
  ChevronRight, ArrowLeft, Filter, Plus 
} from 'lucide-react';

const CoachSchedule = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week');

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      
      // 1. Charger les cours collectifs (Course)
      let coursesData = [];
      try {
        coursesData = await coachAPI.getUpcomingSessions();
        console.log('Cours collectifs:', coursesData);
      } catch (error) {
        console.error('Erreur chargement cours:', error);
      }
      
      // 2. Charger les programmes avec leurs sessions
      let programSessions = [];
      try {
        const programsResponse = await api.get('/coaching/programs/', {
          params: { status: 'active' }
        });
        
        const programs = programsResponse.data.results || programsResponse.data || [];
        console.log('Programmes:', programs);
        
        // Pour chaque programme, générer les sessions basées sur les WorkoutSessions
        for (const program of programs) {
          if (program.workout_sessions && program.workout_sessions.length > 0) {
            const programStartDate = new Date(program.start_date);
            
            program.workout_sessions.forEach(session => {
              // Calculer la date de chaque session
              const weekOffset = (session.week_number - 1) * 7;
              const dayOffset = session.day_of_week - 1; // 1=Lundi, 7=Dimanche
              
              const sessionDate = new Date(programStartDate);
              sessionDate.setDate(sessionDate.getDate() + weekOffset + dayOffset);
              
              // Ne garder que les sessions futures ou d'aujourd'hui
              if (sessionDate >= new Date().setHours(0, 0, 0, 0)) {
                // Calculer l'heure de fin
                const startHour = 9; // Heure par défaut
                const endHour = startHour + Math.floor(session.duration_minutes / 60);
                const endMinute = session.duration_minutes % 60;
                
                programSessions.push({
                  id: `program-${session.id}`,
                  title: `${session.title} - ${program.member_name || 'Membre'}`,
                  date: sessionDate.toISOString().split('T')[0],
                  start_time: `${startHour.toString().padStart(2, '0')}:00`,
                  end_time: `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`,
                  room: 'Session privée',
                  participants_count: 1,
                  max_capacity: 1,
                  type: 'program',
                  program_id: program.id,
                  session_id: session.id
                });
              }
            });
          }
        }
        
        console.log('Sessions de programmes:', programSessions);
      } catch (error) {
        console.error('Erreur chargement programmes:', error);
      }
      
      // 3. Fusionner et trier
      const allSessions = [...coursesData, ...programSessions].sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );
      
      console.log('Toutes les sessions:', allSessions);
      setSessions(allSessions);
    } catch (error) {
      console.error('Erreur chargement sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  
  const getWeekDates = (date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const weekDates = getWeekDates(new Date(currentDate));

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const getSessionsForDate = (date) => {
    return sessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate.toDateString() === date.toDateString();
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getStatusColor = (participantsCount, maxCapacity) => {
    const ratio = participantsCount / maxCapacity;
    if (ratio >= 0.9) return 'bg-red-100 text-red-700 border-red-200';
    if (ratio >= 0.7) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  const handleSessionClick = (session) => {
    if (session.type === 'program') {
      // Rediriger vers la page du programme
      navigate(`/coaching/programs/${session.program_id}`);
    } else {
      // Rediriger vers la page du cours
      navigate(`/admin/courses/${session.id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/coach')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour au tableau de bord
          </button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Mon Planning</h1>
                <p className="text-gray-600 mt-1">
                  Cours collectifs et sessions privées
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">Vue semaine</option>
                <option value="list">Vue liste</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation semaine */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateWeek(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Semaine du {weekDates[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {weekDates[0].toLocaleDateString('fr-FR', { year: 'numeric' })}
              </p>
            </div>
            
            <button
              onClick={() => navigateWeek(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Vue semaine */}
        {viewMode === 'week' ? (
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {weekDates.map((date, index) => {
              const daySessions = getSessionsForDate(date);
              const today = isToday(date);

              return (
                <div
                  key={index}
                  className={`bg-white rounded-lg shadow-sm border-2 ${
                    today ? 'border-blue-500' : 'border-gray-200'
                  } overflow-hidden`}
                >
                  <div className={`p-4 ${today ? 'bg-blue-600 text-white' : 'bg-gray-50'}`}>
                    <p className={`text-sm font-medium ${today ? 'text-white' : 'text-gray-600'}`}>
                      {daysOfWeek[index]}
                    </p>
                    <p className={`text-2xl font-bold ${today ? 'text-white' : 'text-gray-900'}`}>
                      {date.getDate()}
                    </p>
                  </div>

                  <div className="p-2 space-y-2 min-h-[200px]">
                    {daySessions.length === 0 ? (
                      <p className="text-center text-gray-400 text-sm py-4">
                        Aucune session
                      </p>
                    ) : (
                      daySessions.map((session) => (
                        <div
                          key={session.id}
                          onClick={() => handleSessionClick(session)}
                          className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all ${
                            session.type === 'program' 
                              ? 'bg-purple-100 text-purple-700 border-purple-200'
                              : getStatusColor(session.participants_count, session.max_capacity)
                          }`}
                        >
                          <div className="flex items-center text-xs font-semibold mb-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {session.start_time}
                          </div>
                          <p className="font-medium text-sm mb-1 line-clamp-2">
                            {session.title}
                          </p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center">
                              {session.type === 'program' ? (
                                <>🏋️ Privé</>
                              ) : (
                                <>
                                  <Users className="w-3 h-3 mr-1" />
                                  {session.participants_count}/{session.max_capacity}
                                </>
                              )}
                            </span>
                            <span className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {session.room}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Vue liste */
          <div className="space-y-4">
            {sessions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucune session à venir
                </h3>
                <p className="text-gray-600">
                  Votre planning est vide pour le moment
                </p>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`px-3 py-2 rounded-lg ${
                          session.type === 'program' ? 'bg-purple-100' : 'bg-blue-100'
                        }`}>
                          <span className={`font-semibold text-sm ${
                            session.type === 'program' ? 'text-purple-700' : 'text-blue-700'
                          }`}>
                            {session.start_time} - {session.end_time}
                          </span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          session.type === 'program'
                            ? 'bg-purple-100 text-purple-700'
                            : getStatusColor(session.participants_count, session.max_capacity)
                        }`}>
                          {session.type === 'program' 
                            ? '🏋️ Session privée'
                            : `${session.participants_count}/${session.max_capacity} participants`
                          }
                        </span>
                      </div>

                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {session.title}
                      </h3>

                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(session.date).toLocaleDateString('fr-FR', { 
                            weekday: 'long', 
                            day: 'numeric', 
                            month: 'long' 
                          })}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          {session.room}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSessionClick(session)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Voir détails
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Stats résumé */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sessions cette semaine</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {sessions.filter(s => {
                    const sessionDate = new Date(s.date);
                    return weekDates.some(d => d.toDateString() === sessionDate.toDateString());
                  }).length}
                </p>
              </div>
              <Calendar className="w-12 h-12 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sessions privées</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {sessions.filter(s => s.type === 'program').length}
                </p>
              </div>
              <Users className="w-12 h-12 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cours collectifs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {sessions.filter(s => s.type !== 'program').length}
                </p>
              </div>
              <Clock className="w-12 h-12 text-green-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachSchedule;