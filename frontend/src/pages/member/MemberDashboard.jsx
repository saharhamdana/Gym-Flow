// frontend/src/pages/member/MemberDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MemberLayout from '../../components/member/MemberLayout';
import { Card, CardBody, Typography, Button, Progress, Avatar, Chip } from "@material-tailwind/react";
import {
  CalendarDaysIcon, TrophyIcon, FireIcon, ClockIcon, 
  ChartBarIcon, BoltIcon, HeartIcon, UserGroupIcon,
  ArrowTrendingUpIcon, CheckCircleIcon
} from "@heroicons/react/24/solid";
import api from '../../api/axiosInstance';

const MemberDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Appels parallèles pour optimiser le chargement
      const [userRes, statsRes, bookingsRes, programsRes] = await Promise.all([
        api.get('/auth/me/'),
        api.get('/members/dashboard-stats/'),
        api.get('/bookings/bookings/my_bookings/'),
        api.get('/coaching/member/my-programs/')
      ]);

      // Calculer les statistiques basées sur les vraies données
      const completedBookings = bookingsRes.data.filter(b => 
        b.checked_in && new Date(b.course__date) < new Date()
      ).length;

      const upcomingBookings = bookingsRes.data.filter(b => 
        b.status === 'CONFIRMED' && new Date(b.course__date) >= new Date()
      ).length;

      setDashboardData({
        user: userRes.data,
        stats: {
          totalBookings: bookingsRes.data.length,
          completedSessions: completedBookings,
          upcomingSessions: upcomingBookings,
          totalPrograms: programsRes.data.length,
          activePrograms: programsRes.data.filter(p => p.status === 'active').length,
          totalHours: Math.floor(completedBookings * 1.5), // 1.5h par session
          monthlyProgress: Math.min(100, (completedBookings / 20) * 100),
          streak: 12, // À calculer selon votre logique
          caloriesBurned: completedBookings * 350
        },
        recentBookings: bookingsRes.data.slice(0, 5),
        programs: programsRes.data,
        center: statsRes.data.center || {}
      });

    } catch (err) {
      console.error('Erreur chargement dashboard:', err);
      setError('Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MemberLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <Typography className="text-gray-600">Chargement...</Typography>
          </div>
        </div>
      </MemberLayout>
    );
  }

  if (error || !dashboardData) {
    return (
      <MemberLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <Typography variant="h5" color="red" className="mb-4">
            {error || 'Erreur de chargement'}
          </Typography>
          <Button onClick={fetchDashboardData} color="red">
            Réessayer
          </Button>
        </div>
      </MemberLayout>
    );
  }

  const { user, stats, recentBookings, programs, center } = dashboardData;

  return (
      <div className="space-y-6">
        {/* Header avec bienvenue */}
        <Card className="bg-gradient-to-r from-blue-600 to-blue-800 overflow-hidden">
          <CardBody className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar
                src={user.profile_picture_url || "/img/default-avatar.png"}
                alt={user.first_name}
                size="xxl"
                className="ring-4 ring-white shadow-xl"
              />
              <div className="flex-1 text-center md:text-left">
                <Typography variant="h3" color="white" className="mb-2">
                  Bienvenue, {user.first_name} {user.last_name}
                </Typography>
                <Typography variant="small" className="text-blue-100 mb-3">
                  {user.email}
                </Typography>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Chip
                    value={center.name || "Gym Flow"}
                    color="white"
                    className="bg-white/20 text-white"
                  />
                  <Chip
                    value={`${stats.activePrograms} Programme${stats.activePrograms > 1 ? 's' : ''} actif${stats.activePrograms > 1 ? 's' : ''}`}
                    color="green"
                    icon={<CheckCircleIcon className="h-4 w-4" />}
                  />
                </div>
              </div>
              <div className="text-center bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                <Typography variant="h1" color="white" className="mb-1">
                  {stats.streak}
                </Typography>
                <Typography variant="small" className="text-blue-100">
                  Jours consécutifs 🔥
                </Typography>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Statistiques principales */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="hover:shadow-xl transition-shadow cursor-pointer border-l-4 border-orange-500">
            <CardBody className="text-center p-4">
              <FireIcon className="h-10 w-10 text-orange-500 mx-auto mb-2" />
              <Typography variant="h4" color="blue-gray">
                {stats.completedSessions}
              </Typography>
              <Typography variant="small" className="text-gray-600 font-medium">
                Séances complétées
              </Typography>
            </CardBody>
          </Card>

          <Card className="hover:shadow-xl transition-shadow cursor-pointer border-l-4 border-blue-500">
            <CardBody className="text-center p-4">
              <ClockIcon className="h-10 w-10 text-blue-500 mx-auto mb-2" />
              <Typography variant="h4" color="blue-gray">
                {stats.totalHours}h
              </Typography>
              <Typography variant="small" className="text-gray-600 font-medium">
                Temps total
              </Typography>
            </CardBody>
          </Card>

          <Card className="hover:shadow-xl transition-shadow cursor-pointer border-l-4 border-yellow-500">
            <CardBody className="text-center p-4">
              <BoltIcon className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
              <Typography variant="h4" color="blue-gray">
                {stats.caloriesBurned.toLocaleString()}
              </Typography>
              <Typography variant="small" className="text-gray-600 font-medium">
                Calories brûlées
              </Typography>
            </CardBody>
          </Card>

          <Card className="hover:shadow-xl transition-shadow cursor-pointer border-l-4 border-red-500">
            <CardBody className="text-center p-4">
              <HeartIcon className="h-10 w-10 text-red-500 mx-auto mb-2" />
              <Typography variant="h4" color="blue-gray">
                142
              </Typography>
              <Typography variant="small" className="text-gray-600 font-medium">
                BPM moyen
              </Typography>
            </CardBody>
          </Card>

          <Card className="hover:shadow-xl transition-shadow cursor-pointer border-l-4 border-purple-500">
            <CardBody className="text-center p-4">
              <TrophyIcon className="h-10 w-10 text-purple-500 mx-auto mb-2" />
              <Typography variant="h4" color="blue-gray">
                {stats.activePrograms}
              </Typography>
              <Typography variant="small" className="text-gray-600 font-medium">
                Programmes actifs
              </Typography>
            </CardBody>
          </Card>

          <Card className="hover:shadow-xl transition-shadow cursor-pointer border-l-4 border-green-500">
            <CardBody className="text-center p-4">
              <ChartBarIcon className="h-10 w-10 text-green-500 mx-auto mb-2" />
              <Typography variant="h4" color="blue-gray">
                {Math.round(stats.monthlyProgress)}%
              </Typography>
              <Typography variant="small" className="text-gray-600 font-medium">
                Objectif mensuel
              </Typography>
            </CardBody>
          </Card>
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Progression mensuelle */}
          <Card className="border border-gray-200">
            <CardBody>
              <div className="flex items-center justify-between mb-4">
                <Typography variant="h5" style={{ color: '#00357a' }}>
                  Progression Mensuelle
                </Typography>
                <ArrowTrendingUpIcon className="h-6 w-6 text-green-500" />
              </div>
              <Progress 
                value={stats.monthlyProgress} 
                color="blue" 
                className="mb-3"
                size="lg"
              />
              <div className="flex justify-between items-center">
                <Typography variant="small" color="gray">
                  {stats.completedSessions} séances sur 20 ce mois
                </Typography>
                <Typography variant="h6" style={{ color: '#00357a' }}>
                  {Math.round(stats.monthlyProgress)}%
                </Typography>
              </div>
            </CardBody>
          </Card>

          {/* Prochaines séances */}
          <Card className="border border-gray-200">
            <CardBody>
              <div className="flex items-center justify-between mb-4">
                <Typography variant="h5" style={{ color: '#00357a' }}>
                  Prochaines Séances
                </Typography>
                <Chip 
                  value={`${stats.upcomingSessions} réservée${stats.upcomingSessions > 1 ? 's' : ''}`}
                  color="blue"
                  size="sm"
                />
              </div>
              {stats.upcomingSessions > 0 ? (
                <div className="space-y-3">
                  {recentBookings.slice(0, 3).map((booking) => (
                    <div 
                      key={booking.id}
                      className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <CalendarDaysIcon className="h-6 w-6 text-blue-600" />
                        <div>
                          <Typography variant="small" className="font-semibold">
                            {booking.course_title}
                          </Typography>
                          <Typography variant="small" color="gray">
                            {new Date(booking.course_date).toLocaleDateString('fr-FR')}
                          </Typography>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button 
                    variant="outlined" 
                    size="sm" 
                    fullWidth
                    onClick={() => navigate('/portal/bookings')}
                  >
                    Voir toutes mes réservations
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <CalendarDaysIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <Typography color="gray" className="mb-3">
                    Aucune séance prévue
                  </Typography>
                  <Button 
                    color="blue" 
                    size="sm"
                    onClick={() => navigate('/portal/bookings')}
                  >
                    Réserver une séance
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Mes programmes */}
          <Card className="border border-gray-200 lg:col-span-2">
            <CardBody>
              <div className="flex items-center justify-between mb-4">
                <Typography variant="h5" style={{ color: '#00357a' }}>
                  Mes Programmes d'Entraînement
                </Typography>
                <Button 
                  size="sm" 
                  variant="outlined" 
                  color="blue"
                  onClick={() => navigate('/portal/programs')}
                >
                  Voir tous
                </Button>
              </div>
              {programs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {programs.slice(0, 2).map((program) => (
                    <Card key={program.id} className="border border-blue-100 bg-blue-50">
                      <CardBody>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <Typography variant="h6" color="blue-gray">
                              {program.title}
                            </Typography>
                            <Typography variant="small" color="gray">
                              Coach: {program.coach_name}
                            </Typography>
                          </div>
                          <Chip
                            value={program.status}
                            color="green"
                            size="sm"
                            className="capitalize"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <Typography color="gray">Sessions</Typography>
                            <Typography className="font-semibold">
                              {program.workout_sessions?.length || 0}
                            </Typography>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outlined" 
                            fullWidth
                            onClick={() => navigate(`/portal/programs/${program.id}`)}
                          >
                            Voir détails
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrophyIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <Typography color="gray" className="mb-4">
                    Aucun programme assigné pour le moment
                  </Typography>
                  <Typography variant="small" color="gray">
                    Contactez votre coach pour créer un programme personnalisé
                  </Typography>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Actions rapides */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
          <CardBody>
            <Typography variant="h5" className="mb-4" style={{ color: '#00357a' }}>
              Actions Rapides
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                size="lg" 
                color="blue"
                className="flex items-center justify-center gap-2"
                onClick={() => navigate('/portal/bookings')}
              >
                <CalendarDaysIcon className="h-5 w-5" />
                Réserver un cours
              </Button>
              <Button 
                size="lg" 
                variant="outlined"
                className="flex items-center justify-center gap-2"
                onClick={() => navigate('/portal/programs')}
              >
                <TrophyIcon className="h-5 w-5" />
                Mes programmes
              </Button>
              <Button 
                size="lg" 
                variant="outlined"
                className="flex items-center justify-center gap-2"
                onClick={() => navigate('/portal/progress')}
              >
                <ChartBarIcon className="h-5 w-5" />
                Ma progression
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
  );
};

export default MemberDashboard;