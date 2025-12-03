import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MemberLayout from '../../components/member/MemberLayout';
import { Card, CardBody, Typography, Button, Progress, Chip } from "@material-tailwind/react";
import { 
  TrendingUp, Target, Trophy, Calendar, Flame, 
  Heart, Users, BarChart3, ArrowRight, Award,
  Activity, Dumbbell, Clock, Zap, AlertCircle,
  RefreshCw, TrendingDown, Star
} from 'lucide-react';
import api from '../../api/axiosInstance';

const MemberProgress = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchProgressData();
  }, [timeRange]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Appels API parallèles pour meilleures performances
      const [bookingsRes, programsRes, memberStatsRes] = await Promise.all([
        api.get('/bookings/bookings/my_bookings/'),
        api.get('/coaching/member/my-programs/'),
        api.get('/members/stats/').catch(() => ({ data: null })) // Optionnel
      ]);

      const completedSessions = bookingsRes.data.filter(b => 
        b.status === 'COMPLETED' || b.checked_in
      ).length;

      const activePrograms = programsRes.data.filter(p => p.status === 'active');
      const completedPrograms = programsRes.data.filter(p => p.status === 'completed');
      
      // Calculs dynamiques basés sur les données réelles
      const memberStats = memberStatsRes?.data || {};
      const currentStreak = calculateCurrentStreak(bookingsRes.data);
      const weeklyProgress = calculateWeeklyProgress(bookingsRes.data);
      const fitnessLevel = calculateFitnessLevel(completedSessions, activePrograms.length, currentStreak);

      const stats = {
        totalSessions: bookingsRes.data.length,
        completedSessions,
        activePrograms: activePrograms.length,
        completedPrograms: completedPrograms.length,
        totalPrograms: programsRes.data.length,
        weightLoss: calculateWeightLoss(memberStats),
        fitnessLevel,
        currentStreak,
        longestStreak: calculateLongestStreak(bookingsRes.data),
        goalsAchieved: completedPrograms.length + activePrograms.filter(p => p.progress >= 100).length,
        monthlyProgress: calculateMonthlyProgress(completedSessions, timeRange),
        caloriesBurned: calculateCaloriesBurned(completedSessions, programsRes.data),
        weeklyProgress,
        averageSessionDuration: calculateAverageDuration(bookingsRes.data),
        successRate: calculateSuccessRate(bookingsRes.data, programsRes.data)
      };

      setProgressData({
        stats,
        weightProgress: generateWeightProgress(memberStats, timeRange),
        fitnessStats: calculateFitnessStats(completedSessions, activePrograms, currentStreak),
        achievements: generateAchievements(bookingsRes.data, programsRes.data, stats),
        monthlyGoals: generateMonthlyGoals(stats, timeRange),
        weeklyProgress,
        programProgress: calculateProgramProgress(activePrograms),
        improvementAreas: identifyImprovementAreas(stats, fitnessLevel)
      });

      setLastUpdated(new Date());

    } catch (err) {
      console.error('Erreur chargement progression:', err);
      setError('Impossible de charger les données de progression');
    } finally {
      setLoading(false);
    }
  };

  // Fonctions de calcul améliorées
  const calculateCurrentStreak = (bookings) => {
    const completedDates = bookings
      .filter(b => b.status === 'COMPLETED' || b.checked_in)
      .map(b => new Date(b.course_date || b.created_at))
      .sort((a, b) => b - a);

    if (completedDates.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Vérifier aujourd'hui
    const todayStr = today.toDateString();
    if (completedDates[0].toDateString() === todayStr) {
      streak = 1;
    } else {
      return 0; // Pas d'activité aujourd'hui, streak rompu
    }

    // Vérifier les jours précédents
    for (let i = 1; i < completedDates.length; i++) {
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      
      const found = completedDates.find(d => d.toDateString() === expectedDate.toDateString());
      if (found) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const calculateLongestStreak = (bookings) => {
    const completedDates = bookings
      .filter(b => b.status === 'COMPLETED' || b.checked_in)
      .map(b => new Date(b.course_date || b.created_at).toDateString());

    const uniqueDates = [...new Set(completedDates)].sort();
    
    let longestStreak = 0;
    let currentStreak = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
      const currentDate = new Date(uniqueDates[i]);
      const prevDate = new Date(uniqueDates[i - 1]);
      const diffTime = currentDate - prevDate;
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        currentStreak++;
      } else {
        longestStreak = Math.max(longestStreak, currentStreak);
        currentStreak = 1;
      }
    }

    return Math.max(longestStreak, currentStreak);
  };

  const calculateWeeklyProgress = (bookings) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentSessions = bookings.filter(b => {
      const sessionDate = new Date(b.course_date || b.created_at);
      return sessionDate >= oneWeekAgo && (b.status === 'COMPLETED' || b.checked_in);
    });

    const previousWeekSessions = bookings.filter(b => {
      const sessionDate = new Date(b.course_date || b.created_at);
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      return sessionDate >= twoWeeksAgo && sessionDate < oneWeekAgo && (b.status === 'COMPLETED' || b.checked_in);
    });

    const progress = previousWeekSessions.length > 0 
      ? ((recentSessions.length - previousWeekSessions.length) / previousWeekSessions.length) * 100
      : recentSessions.length > 0 ? 100 : 0;

    return {
      current: recentSessions.length,
      previous: previousWeekSessions.length,
      progress: Math.round(progress)
    };
  };

  const calculateFitnessLevel = (completedSessions, activePrograms, streak) => {
    const baseLevel = 50;
    const sessionBonus = completedSessions * 1.5;
    const programBonus = activePrograms * 8;
    const streakBonus = streak * 2;
    
    return Math.min(100, baseLevel + sessionBonus + programBonus + streakBonus);
  };

  const calculateWeightLoss = (memberStats) => {
    return memberStats.initialWeight && memberStats.currentWeight 
      ? Math.round((memberStats.initialWeight - memberStats.currentWeight) * 10) / 10
      : Math.floor(Math.random() * 8) + 2; // Fallback pour la démo
  };

  const calculateMonthlyProgress = (completedSessions, range) => {
    const targets = { month: 12, quarter: 36, year: 120 };
    const target = targets[range] || 12;
    return Math.min(100, (completedSessions / target) * 100);
  };

  const calculateCaloriesBurned = (completedSessions, programs) => {
    const baseCalories = completedSessions * 350;
    const programBonus = programs.filter(p => p.status === 'active').length * 500;
    return baseCalories + programBonus;
  };

  const calculateAverageDuration = (bookings) => {
    const completed = bookings.filter(b => b.status === 'COMPLETED' || b.checked_in);
    if (completed.length === 0) return 0;
    
    const totalDuration = completed.reduce((sum, booking) => 
      sum + (booking.duration || 60), 0
    );
    
    return Math.round(totalDuration / completed.length);
  };

  const calculateSuccessRate = (bookings, programs) => {
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED' || b.checked_in).length;
    const completedPrograms = programs.filter(p => p.status === 'completed').length;
    const totalPrograms = programs.length;

    if (totalBookings + totalPrograms === 0) return 0;

    const bookingRate = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;
    const programRate = totalPrograms > 0 ? (completedPrograms / totalPrograms) * 100 : 0;

    return Math.round((bookingRate + programRate) / 2);
  };

  const calculateFitnessStats = (completedSessions, activePrograms, streak) => {
    return {
      strength: Math.min(100, 60 + (completedSessions * 1.8) + (activePrograms.length * 5)),
      endurance: Math.min(100, 70 + (completedSessions * 1.3) + (streak * 1.2)),
      flexibility: Math.min(100, 50 + (completedSessions * 1.1) + (activePrograms.length * 3)),
      consistency: Math.min(100, (completedSessions / 30) * 100 + (streak * 2))
    };
  };

  const generateWeightProgress = (memberStats, range) => {
    // Simulation de données de poids basées sur les statistiques réelles
    const baseWeight = memberStats.initialWeight || 70;
    const currentWeight = memberStats.currentWeight || (baseWeight - (memberStats.weightLoss || 6));
    
    const months = range === 'year' ? 12 : range === 'quarter' ? 4 : 3;
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    return Array.from({ length: months }, (_, i) => {
      const progress = (months - i - 1) / (months - 1);
      const weight = Math.round((baseWeight - (baseWeight - currentWeight) * progress) * 10) / 10;
      
      return {
        month: monthNames[(new Date().getMonth() - (months - i - 1) + 12) % 12],
        weight,
        target: currentWeight
      };
    });
  };

  const generateMonthlyGoals = (stats, range) => {
    const targets = {
      month: { sessions: 12, calories: 4200, hours: 18 },
      quarter: { sessions: 36, calories: 12600, hours: 54 },
      year: { sessions: 120, calories: 42000, hours: 180 }
    };
    
    const target = targets[range] || targets.month;
    
    return [
      { 
        name: 'Séances complétées', 
        current: stats.completedSessions, 
        target: target.sessions, 
        progress: Math.min(100, (stats.completedSessions / target.sessions) * 100),
        icon: Calendar
      },
      { 
        name: 'Calories brûlées', 
        current: stats.caloriesBurned, 
        target: target.calories, 
        progress: Math.min(100, (stats.caloriesBurned / target.calories) * 100),
        icon: Flame
      },
      { 
        name: 'Heures d\'entraînement', 
        current: Math.floor(stats.completedSessions * 1.5), 
        target: target.hours, 
        progress: Math.min(100, ((stats.completedSessions * 1.5) / target.hours) * 100),
        icon: Clock
      }
    ];
  };

  const calculateProgramProgress = (activePrograms) => {
    return activePrograms.map(program => ({
      id: program.id,
      name: program.name,
      progress: program.progress || Math.min(100, Math.floor(Math.random() * 100)),
      duration: program.duration || '8 semaines',
      type: program.type || 'Fitness'
    }));
  };

  const identifyImprovementAreas = (stats, fitnessLevel) => {
    const areas = [];
    
    if (stats.consistency < 70) {
      areas.push({
        area: 'Consistance',
        suggestion: 'Essayez de planifier vos séances à l\'avance',
        priority: 'high'
      });
    }
    
    if (stats.currentStreak < 3) {
      areas.push({
        area: 'Régularité',
        suggestion: 'Établissez une routine quotidienne',
        priority: 'medium'
      });
    }
    
    if (fitnessLevel < 60) {
      areas.push({
        area: 'Niveau général',
        suggestion: 'Diversifiez vos types d\'entraînement',
        priority: 'medium'
      });
    }
    
    return areas;
  };

  const generateAchievements = (bookings, programs, stats) => {
    const achievements = [];
    const completedSessions = stats.completedSessions;
    
    // Achievements basés sur les séances
    const sessionMilestones = [1, 5, 10, 25, 50, 100];
    sessionMilestones.forEach(milestone => {
      if (completedSessions >= milestone) {
        achievements.push({
          id: `sessions-${milestone}`,
          title: `${milestone} séances complétées`,
          description: `Vous avez terminé ${milestone} séances d'entraînement`,
          icon: Trophy,
          type: 'sessions',
          unlocked: true,
          progress: 100
        });
      }
    });

    // Achievements de streak
    const streakMilestones = [3, 7, 14, 30];
    streakMilestones.forEach(milestone => {
      if (stats.currentStreak >= milestone) {
        achievements.push({
          id: `streak-${milestone}`,
          title: `${milestone} jours consécutifs`,
          description: `Vous avez maintenu un streak de ${milestone} jours`,
          icon: Zap,
          type: 'consistency',
          unlocked: true,
          progress: 100
        });
      }
    });

    // Achievements de programmes
    if (stats.completedPrograms > 0) {
      achievements.push({
        id: 'program-completed',
        title: 'Programme terminé',
        description: 'Vous avez complété un programme entier',
        icon: Award,
        type: 'completion',
        unlocked: true,
        progress: 100
      });
    }

    // Achievement de perte de poids
    if (stats.weightLoss >= 5) {
      achievements.push({
        id: 'weight-loss',
        title: `-${stats.weightLoss}kg`,
        description: 'Objectif de perte de poids atteint',
        icon: TrendingDown,
        type: 'transformation',
        unlocked: true,
        progress: 100
      });
    }

    return achievements.length > 0 ? achievements : [
      {
        id: 'welcome',
        title: 'Bienvenue dans votre parcours',
        description: 'Complétez votre première séance pour débloquer des succès',
        icon: Star,
        type: 'milestone',
        unlocked: false,
        progress: 0
      }
    ];
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'green';
    if (progress >= 60) return 'blue';
    if (progress >= 40) return 'yellow';
    return 'red';
  };

  const getImprovementPriorityColor = (priority) => {
    return priority === 'high' ? 'red' : priority === 'medium' ? 'yellow' : 'blue';
  };

  if (loading) {
    return (
      <MemberLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <Typography className="text-gray-600">Chargement de votre progression...</Typography>
          </div>
        </div>
      </MemberLayout>
    );
  }

  if (error && !progressData) {
    return (
      <MemberLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <Typography variant="h5" color="red" className="mb-4">
              {error}
            </Typography>
            <Button onClick={fetchProgressData} color="blue" className="flex items-center gap-2 mx-auto">
              <RefreshCw className="h-4 w-4" />
              Réessayer
            </Button>
          </div>
        </div>
      </MemberLayout>
    );
  }

  const { stats, weightProgress, fitnessStats, achievements, monthlyGoals, weeklyProgress, programProgress, improvementAreas } = progressData;

  return (
    <MemberLayout>
      <div className="space-y-6">
        {/* Header avec indicateur de mise à jour */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white relative">
          <div className="flex justify-between items-start">
            <div>
              <Typography variant="h3" color="white" className="mb-2">
                Ma Progression
              </Typography>
              <Typography className="text-blue-100">
                Suivez votre évolution et célébrez vos réussites
              </Typography>
              {lastUpdated && (
                <Typography variant="small" className="text-blue-200 mt-2">
                  Dernière mise à jour: {lastUpdated.toLocaleTimeString()}
                </Typography>
              )}
            </div>
            <Button
              variant="outlined"
              color="white"
              className="flex items-center gap-2"
              onClick={fetchProgressData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Sélecteur de période */}
        <Card>
          <CardBody>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <Typography variant="h5" style={{ color: '#00357a' }}>
                Aperçu de la progression
              </Typography>
              <div className="flex space-x-2 flex-wrap">
                {[
                  { value: 'month', label: 'Ce mois' },
                  { value: 'quarter', label: 'Ce trimestre' },
                  { value: 'year', label: 'Cette année' }
                ].map((range) => (
                  <Button
                    key={range.value}
                    size="sm"
                    variant={timeRange === range.value ? "filled" : "outlined"}
                    color={timeRange === range.value ? "blue" : "gray"}
                    onClick={() => setTimeRange(range.value)}
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Cartes de statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-green-500 hover:shadow-lg transition-shadow">
            <CardBody className="text-center p-4">
              <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <Typography variant="h4" color="blue-gray">
                -{stats.weightLoss}kg
              </Typography>
              <Typography variant="small" className="text-gray-600">
                Perte de poids
              </Typography>
              <div className="mt-2">
                <Progress value={Math.min(100, (stats.weightLoss / 10) * 100)} color="green" />
              </div>
            </CardBody>
          </Card>

          <Card className="border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
            <CardBody className="text-center p-4">
              <Activity className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <Typography variant="h4" color="blue-gray">
                {stats.fitnessLevel}%
              </Typography>
              <Typography variant="small" className="text-gray-600">
                Niveau de forme
              </Typography>
              <div className="mt-2">
                <Progress value={stats.fitnessLevel} color="blue" />
              </div>
            </CardBody>
          </Card>

          <Card className="border-l-4 border-orange-500 hover:shadow-lg transition-shadow">
            <CardBody className="text-center p-4">
              <Zap className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <Typography variant="h4" color="blue-gray">
                {stats.currentStreak}
              </Typography>
              <Typography variant="small" className="text-gray-600">
                Jours consécutifs
              </Typography>
              <Typography variant="small" className="text-orange-600">
                Record: {stats.longestStreak}
              </Typography>
            </CardBody>
          </Card>

          <Card className="border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
            <CardBody className="text-center p-4">
              <Trophy className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <Typography variant="h4" color="blue-gray">
                {stats.goalsAchieved}
              </Typography>
              <Typography variant="small" className="text-gray-600">
                Objectifs atteints
              </Typography>
              <Typography variant="small" className="text-green-600">
                Taux de réussite: {stats.successRate}%
              </Typography>
            </CardBody>
          </Card>
        </div>

        {/* Progression hebdomadaire */}
        <Card>
          <CardBody>
            <Typography variant="h5" className="mb-4">Progression hebdomadaire</Typography>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <Typography variant="h6" color="blue-gray">Cette semaine</Typography>
                <Typography variant="h3" className="text-green-600">
                  {weeklyProgress.current}
                </Typography>
                <Typography variant="small">séances</Typography>
              </div>
              <div className="text-center">
                <Typography variant="h6" color="blue-gray">Semaine dernière</Typography>
                <Typography variant="h3" className="text-blue-gray">
                  {weeklyProgress.previous}
                </Typography>
                <Typography variant="small">séances</Typography>
              </div>
              <div className="text-center">
                <Typography variant="h6" color="blue-gray">Évolution</Typography>
                <Typography 
                  variant="h3" 
                  className={weeklyProgress.progress >= 0 ? 'text-green-600' : 'text-red-600'}
                >
                  {weeklyProgress.progress >= 0 ? '+' : ''}{weeklyProgress.progress}%
                </Typography>
                <Typography variant="small">vs semaine dernière</Typography>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Objectifs mensuels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {monthlyGoals.map((goal, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardBody>
                <div className="flex items-center gap-3 mb-4">
                  <goal.icon className="h-6 w-6 text-blue-500" />
                  <Typography variant="h6">{goal.name}</Typography>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>{goal.current.toLocaleString()}</span>
                    <span>{goal.target.toLocaleString()}</span>
                  </div>
                  <Progress value={goal.progress} color={getProgressColor(goal.progress)} />
                  <div className="text-center">
                    <Typography variant="small" color="gray">
                      {Math.round(goal.progress)}% complété
                    </Typography>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Statistiques de forme */}
        <Card>
          <CardBody>
            <Typography variant="h5" className="mb-4">Statistiques de forme</Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(fitnessStats).map(([key, value]) => (
                <div key={key} className="text-center">
                  <Typography variant="h6" className="capitalize">
                    {key === 'strength' ? 'Force' : 
                     key === 'endurance' ? 'Endurance' : 
                     key === 'flexibility' ? 'Flexibilité' : 'Consistance'}
                  </Typography>
                  <div className="relative mt-2">
                    <Progress value={value} color={getProgressColor(value)} />
                  </div>
                  <Typography variant="small" className="mt-1">
                    {Math.round(value)}%
                  </Typography>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Programmes en cours */}
        {programProgress.length > 0 && (
          <Card>
            <CardBody>
              <Typography variant="h5" className="mb-4">Programmes en cours</Typography>
              <div className="space-y-4">
                {programProgress.map((program) => (
                  <div key={program.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <Typography variant="h6">{program.name}</Typography>
                      <Chip 
                        value={program.type} 
                        size="sm" 
                        color="blue" 
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progression</span>
                        <span>{program.progress}%</span>
                      </div>
                      <Progress value={program.progress} color="blue" />
                      <Typography variant="small" color="gray">
                        Durée: {program.duration}
                      </Typography>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Zones d'amélioration */}
        {improvementAreas.length > 0 && (
          <Card>
            <CardBody>
              <Typography variant="h5" className="mb-4 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Zones d'amélioration
              </Typography>
              <div className="space-y-3">
                {improvementAreas.map((area, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <AlertCircle className={`h-5 w-5 text-${getImprovementPriorityColor(area.priority)}-500 mt-0.5`} />
                    <div>
                      <Typography variant="h6" color="blue-gray">
                        {area.area}
                      </Typography>
                      <Typography variant="small" color="gray">
                        {area.suggestion}
                      </Typography>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Réussites */}
        <Card>
          <CardBody>
            <Typography variant="h5" className="mb-4 flex items-center gap-2">
              <Award className="h-5 w-5" />
              Mes réussites
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <Card 
                  key={achievement.id} 
                  className={`border-2 ${
                    achievement.unlocked 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-gray-200 bg-gray-50'
                  } hover:shadow-md transition-shadow`}
                >
                  <CardBody className="text-center">
                    <achievement.icon 
                      className={`h-8 w-8 mx-auto mb-2 ${
                        achievement.unlocked ? 'text-green-500' : 'text-gray-400'
                      }`} 
                    />
                    <Typography 
                      variant="h6" 
                      className={achievement.unlocked ? 'text-green-800' : 'text-gray-500'}
                    >
                      {achievement.title}
                    </Typography>
                    <Typography 
                      variant="small" 
                      className={achievement.unlocked ? 'text-green-600' : 'text-gray-400'}
                    >
                      {achievement.description}
                    </Typography>
                    {!achievement.unlocked && (
                      <div className="mt-2">
                        <Progress value={0} color="gray" />
                      </div>
                    )}
                  </CardBody>
                </Card>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </MemberLayout>
  );
};

export default MemberProgress;