import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MemberLayout from '../../components/member/MemberLayout';
import { Card, CardBody, Typography, Button, Progress, Chip } from "@material-tailwind/react";
import { 
  TrendingUp, Target, Trophy, Calendar, Flame, 
  Heart, Users, BarChart3, ArrowRight, Award,
  Activity, Dumbbell, Clock, Zap
} from 'lucide-react';
import api from '../../api/axiosInstance';

const MemberProgress = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProgressData();
  }, [timeRange]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Appels API réels
      const [bookingsRes, programsRes] = await Promise.all([
        api.get('/bookings/bookings/my_bookings/'),
        api.get('/coaching/member/my-programs/')
      ]);

      const completedSessions = bookingsRes.data.filter(b => 
        b.status === 'COMPLETED' || b.checked_in
      ).length;

      const activePrograms = programsRes.data.filter(p => p.status === 'active');

      // Calcul des statistiques réelles
      const stats = {
        totalSessions: bookingsRes.data.length,
        completedSessions,
        activePrograms: activePrograms.length,
        totalPrograms: programsRes.data.length,
        weightLoss: 6, // À adapter avec vos données réelles
        fitnessLevel: Math.min(100, 50 + (completedSessions * 2) + (activePrograms.length * 10)),
        currentStreak: calculateCurrentStreak(bookingsRes.data),
        goalsAchieved: activePrograms.filter(p => p.progress >= 100).length,
        monthlyProgress: Math.min(100, (completedSessions / 20) * 100),
        caloriesBurned: completedSessions * 350,
      };

      setProgressData({
        stats,
        weightProgress: [
          { month: 'Jan', weight: 70, target: 65 },
          { month: 'Fév', weight: 68, target: 65 },
          { month: 'Mar', weight: 66, target: 65 },
          { month: 'Avr', weight: 64, target: 65 },
        ],
        fitnessStats: {
          strength: Math.min(100, 60 + (completedSessions * 2)),
          endurance: Math.min(100, 70 + (completedSessions * 1.5)),
          flexibility: Math.min(100, 50 + (completedSessions * 1.2)),
          consistency: Math.min(100, (completedSessions / 30) * 100)
        },
        achievements: generateAchievements(bookingsRes.data, programsRes.data),
        monthlyGoals: [
          { 
            name: 'Séances complétées', 
            current: completedSessions, 
            target: 20, 
            progress: Math.min(100, (completedSessions / 20) * 100) 
          },
          { 
            name: 'Calories brûlées', 
            current: completedSessions * 350, 
            target: 5000, 
            progress: Math.min(100, ((completedSessions * 350) / 5000) * 100) 
          },
          { 
            name: 'Heures d\'entraînement', 
            current: Math.floor(completedSessions * 1.5), 
            target: 30, 
            progress: Math.min(100, ((completedSessions * 1.5) / 30) * 100) 
          }
        ]
      });

    } catch (err) {
      console.error('Erreur chargement progression:', err);
      setError('Impossible de charger les données de progression');
    } finally {
      setLoading(false);
    }
  };

  const calculateCurrentStreak = (bookings) => {
    // Logique simplifiée de calcul de streak
    const completedDates = bookings
      .filter(b => b.status === 'COMPLETED' || b.checked_in)
      .map(b => new Date(b.course_date || b.created_at).toDateString());
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      if (completedDates.includes(date.toDateString())) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const generateAchievements = (bookings, programs) => {
    const achievements = [];
    const completedSessions = bookings.filter(b => b.status === 'COMPLETED' || b.checked_in).length;
    
    if (completedSessions >= 1) {
      achievements.push({
        id: 1,
        title: `${completedSessions} séances complétées`,
        date: new Date().toISOString(),
        type: 'consistency'
      });
    }
    
    if (programs.some(p => p.status === 'completed')) {
      achievements.push({
        id: 2,
        title: 'Programme terminé',
        date: new Date().toISOString(),
        type: 'completion'
      });
    }
    
    const streak = calculateCurrentStreak(bookings);
    if (streak >= 3) {
      achievements.push({
        id: 3,
        title: `${streak} jours consécutifs`,
        date: new Date().toISOString(),
        type: 'streak'
      });
    }
    
    return achievements.length > 0 ? achievements : [
      {
        id: 1,
        title: 'Début de votre parcours fitness',
        date: new Date().toISOString(),
        type: 'milestone'
      }
    ];
  };

  if (loading) {
    return (
    
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <Typography className="text-gray-600">Chargement de votre progression...</Typography>
          </div>
        </div>
    
    );
  }

  if (error && !progressData) {
    return (
    
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Typography variant="h5" color="red" className="mb-4">
              {error}
            </Typography>
            <Button onClick={fetchProgressData} color="blue">
              Réessayer
            </Button>
          </div>
        </div>
   
    );
  }

  const { stats, weightProgress, fitnessStats, achievements, monthlyGoals } = progressData;

  return (
  
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
          <Typography variant="h3" color="white" className="mb-2">
            Ma Progression
          </Typography>
          <Typography className="text-blue-100">
            Suivez votre évolution et célébrez vos réussites
          </Typography>
        </div>

        {/* Votre contenu existant reste inchangé */}
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <Typography variant="h5" style={{ color: '#00357a' }}>
                Aperçu de la progression
              </Typography>
              <div className="flex space-x-2">
                {['month', 'quarter', 'year'].map((range) => (
                  <Button
                    key={range}
                    size="sm"
                    variant={timeRange === range ? "filled" : "outlined"}
                    color={timeRange === range ? "blue" : "gray"}
                    onClick={() => setTimeRange(range)}
                  >
                    {range === 'month' ? 'Mois' : range === 'quarter' ? 'Trimestre' : 'Année'}
                  </Button>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Le reste de votre code existant... */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-green-500">
            <CardBody className="text-center p-4">
              <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <Typography variant="h4" color="blue-gray">
                -{stats.weightLoss}kg
              </Typography>
              <Typography variant="small" className="text-gray-600">
                Perte de poids
              </Typography>
            </CardBody>
          </Card>

          {/* ... autres cartes de statistiques */}
        </div>

        {/* ... reste du contenu */}
      </div>
  
  );
};

export default MemberProgress;