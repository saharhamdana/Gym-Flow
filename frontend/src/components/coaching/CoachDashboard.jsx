import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { coachAPI } from '../../api/coachAPI';
import { Card, CardBody, Typography } from "@material-tailwind/react";
import { 
  Calendar, Users, Dumbbell, TrendingUp, 
  Clock, ArrowRight, Plus 
} from 'lucide-react';
import CoachLayout from './CoachLayout';

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
      <CoachLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        </div>
      </CoachLayout>
    );
  }

  return (
    <CoachLayout>
      <div className="space-y-6">
        <div className="mb-6">
          <Typography variant="h3" style={{ color: "#00357a" }}>
            Tableau de Bord
          </Typography>
          <Typography variant="small" className="text-gray-600 mt-2">
            Vue d'ensemble de votre activité
          </Typography>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardBody className="flex items-center justify-between">
              <div>
                <Typography variant="small" className="text-gray-600">
                  Sessions Aujourd'hui
                </Typography>
                <Typography variant="h3" style={{ color: "#00357a" }} className="mt-2">
                  {stats?.sessions_today || 0}
                </Typography>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center justify-between">
              <div>
                <Typography variant="small" className="text-gray-600">
                  Membres Actifs
                </Typography>
                <Typography variant="h3" style={{ color: "#00357a" }} className="mt-2">
                  {stats?.total_members || 0}
                </Typography>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center justify-between">
              <div>
                <Typography variant="small" className="text-gray-600">
                  Sessions Complétées
                </Typography>
                <Typography variant="h3" style={{ color: "#00357a" }} className="mt-2">
                  {stats?.completed_sessions || 0}
                </Typography>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center justify-between">
              <div>
                <Typography variant="small" className="text-gray-600">
                  Satisfaction
                </Typography>
                <Typography variant="h3" style={{ color: "#00357a" }} className="mt-2">
                  {stats?.satisfaction || '0.0'}/5
                </Typography>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
            </CardBody>
          </Card>
        </div>

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
            to="/coach/schedule"
            className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-md"
          >
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-3" />
              <span className="font-medium">Planning</span>
            </div>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            to="/coach/members"
            className="flex items-center justify-between p-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md"
          >
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-3" />
              <span className="font-medium">Mes Membres</span>
            </div>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <Card>
          <CardBody>
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h5" style={{ color: "#00357a" }}>
                Sessions à Venir
              </Typography>
              <Link 
                to="/coach/schedule"
                className="text-sm font-medium flex items-center"
                style={{ color: "#9b0e16" }}
              >
                Voir tout <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {upcomingSessions.length > 0 ? (
                upcomingSessions.slice(0, 5).map((session) => (
                  <div key={session.id} className="py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 px-3 py-2 rounded-lg">
                          <span className="text-blue-700 font-semibold text-sm">
                            {session.start_time}
                          </span>
                        </div>
                        <div>
                          <Typography variant="small" className="font-semibold" style={{ color: "#00357a" }}>
                            {session.title}
                          </Typography>
                          <Typography variant="small" className="text-gray-600">
                            {session.room} • {session.participants_count}/{session.max_capacity} participants
                          </Typography>
                        </div>
                      </div>
                      <Link 
                        to={`/admin/courses/${session.id}`}
                        className="px-4 py-2 rounded-lg transition-colors text-sm font-medium text-white hover:opacity-90"
                        style={{ backgroundColor: "#9b0e16" }}
                      >
                        Détails
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-gray-500">
                  Aucune session à venir
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h5" style={{ color: "#00357a" }}>
                Progrès des Membres
              </Typography>
              <Link 
                to="/coaching/programs"
                className="text-sm font-medium flex items-center"
                style={{ color: "#9b0e16" }}
              >
                Gérer programmes <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="space-y-4">
              {members.length > 0 ? (
                members.slice(0, 5).map((program) => (
                  <div key={program.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <Typography variant="small" className="font-medium" style={{ color: "#00357a" }}>
                          {program.member_name}
                        </Typography>
                        <Typography variant="small" className="text-gray-600">
                          {program.title}
                        </Typography>
                      </div>
                      <Typography variant="small" className="font-semibold" style={{ color: "#00357a" }}>
                        {program.progress}%
                      </Typography>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${program.progress}%`,
                          backgroundColor: "#9b0e16"
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Dumbbell className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <Typography variant="small">Aucun membre assigné</Typography>
                  <Link
                    to="/coaching/programs/create"
                    className="inline-block mt-4 px-4 py-2 text-white rounded-lg text-sm hover:opacity-90"
                    style={{ backgroundColor: "#9b0e16" }}
                  >
                    Créer un programme
                  </Link>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </CoachLayout>
  );
};

export default CoachDashboard;