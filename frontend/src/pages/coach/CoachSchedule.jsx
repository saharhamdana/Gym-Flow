import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CoachLayout from '../../components/coaching/CoachLayout';
import { coachAPI } from '../../api/coachAPI';
import api from '../../api/axiosInstance';
import { 
  Calendar, Clock, Users, MapPin, ChevronLeft, 
  ChevronRight
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
      
      let coursesData = [];
      try {
        coursesData = await coachAPI.getUpcomingSessions();
      } catch (error) {
        console.error('Erreur chargement cours:', error);
      }
      
      let programSessions = [];
      try {
        const programsResponse = await api.get('/coaching/programs/', {
          params: { status: 'active' }
        });
        
        const programs = programsResponse.data.results || programsResponse.data || [];
        
        for (const program of programs) {
          if (program.workout_sessions && program.workout_sessions.length > 0) {
            const programStartDate = new Date(program.start_date);
            
            program.workout_sessions.forEach(session => {
              const weekOffset = (session.week_number - 1) * 7;
              const dayOffset = session.day_of_week - 1;
              
              const sessionDate = new Date(programStartDate);
              sessionDate.setDate(sessionDate.getDate() + weekOffset + dayOffset);
              
              if (sessionDate >= new Date().setHours(0, 0, 0, 0)) {
                const startHour = 9;
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
      } catch (error) {
        console.error('Erreur chargement programmes:', error);
      }
      
      const allSessions = [...coursesData, ...programSessions].sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );
      
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
      navigate(`/coaching/programs/${session.program_id}`);
    } else {
      navigate(`/admin/courses/${session.id}`);
    }
  };

  if (loading) {
    return (
      <CoachLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
              Mon Planning
            </h1>
            <p className="text-gray-600 mt-1">
              Cours collectifs et sessions privées
            </p>
          </div>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Vue semaine</option>
            <option value="list">Vue liste</option>
          </select>
        </div>

        {/* Navigation semaine */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateWeek(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            
            <div className="text-center">
              <h2 className="text-xl font-semibold" style={{ color: '#00357a' }}>
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
                  <div className={`p-4`} style={today ? { backgroundColor: '#00357a', color: 'white' } : { backgroundColor: '#f9fafb' }}>
                    <p className={`text-sm font-medium ${today ? 'text-white' : 'text-gray-600'}`}>
                      {daysOfWeek[index]}
                    </p>
                    <p className={`text-2xl font-bold ${today ? 'text-white' : ''}`} style={!today ? { color: '#00357a' } : {}}>
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
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#00357a' }}>
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
                        <div className={`px-3 py-2 rounded-lg`} style={session.type === 'program' ? { backgroundColor: '#00357a' + '10' } : { backgroundColor: '#e0f2fe' }}>
                          <span className={`font-semibold text-sm`} style={session.type === 'program' ? { color: '#00357a' } : { color: '#0369a1' }}>
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

                      <h3 className="text-xl font-semibold mb-2" style={{ color: '#00357a' }}>
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
                      className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors text-sm font-medium"
                      style={{ backgroundColor: '#9b0e16' }}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sessions cette semaine</p>
                <p className="text-3xl font-bold mt-2" style={{ color: '#00357a' }}>
                  {sessions.filter(s => {
                    const sessionDate = new Date(s.date);
                    return weekDates.some(d => d.toDateString() === sessionDate.toDateString());
                  }).length}
                </p>
              </div>
              <Calendar className="w-12 h-12" style={{ color: '#9b0e16' }} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sessions privées</p>
                <p className="text-3xl font-bold mt-2" style={{ color: '#00357a' }}>
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
                <p className="text-3xl font-bold mt-2" style={{ color: '#00357a' }}>
                  {sessions.filter(s => s.type !== 'program').length}
                </p>
              </div>
              <Clock className="w-12 h-12 text-green-600" />
            </div>
          </div>
        </div>
      </div>
    </CoachLayout>
  );
};

export default CoachSchedule;