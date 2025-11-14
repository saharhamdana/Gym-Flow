// frontend/src/components/coaching/CoachDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { coachAPI } from '../../api/coachAPI';
import { 
  Calendar, Users, Dumbbell, TrendingUp, 
  Clock, ArrowRight, Plus 
} from 'lucide-react';
import api from '../../api/axiosInstance'; 
const CoachDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

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
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/coaching/programs/create"
          className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
        >
          <div className="flex items-center">
            <Plus className="w-5 h-5 mr-3" />
            <span className="font-medium">Nouveau Programme</span>
          </div>
          <ArrowRight className="w-5 h-5" />
        </Link>

        <Link
          to="/admin/courses/calendar"
          className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-md"
        >
          <div className="flex items-center">
            <Calendar className="w-5 h-5 mr-3" />
            <span className="font-medium">Planning</span>
          </div>
          <ArrowRight className="w-5 h-5" />
        </Link>

        <Link
          to="/admin/members"
          className="flex items-center justify-between p-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md"
        >
          <div className="flex items-center">
            <Users className="w-5 h-5 mr-3" />
            <span className="font-medium">Mes Membres</span>
          </div>
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Sessions à Venir</h2>
          <Link 
            to="/admin/courses/calendar"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
          >
            Voir tout <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {upcomingSessions.length > 0 ? (
            upcomingSessions.slice(0, 5).map((session) => (
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
                  <Link 
                    to={`/admin/courses/${session.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Détails
                  </Link>
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
          <Link 
            to="/coaching/programs"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
          >
            Gérer programmes <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="p-6 space-y-4">
          {members.length > 0 ? (
            members.slice(0, 5).map((program) => (
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
              <Dumbbell className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>Aucun membre assigné</p>
              <Link
                to="/coaching/programs/create"
                className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Créer un programme
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoachDashboard;