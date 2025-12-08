// Fichier: frontend/src/pages/admin/dashboard/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardBody,
    Typography,
    Alert,
    Avatar,
    Chip,
    Button,
} from "@material-tailwind/react";
import {
    UserGroupIcon,
    ClipboardDocumentListIcon,
    CalendarDaysIcon,
    CurrencyDollarIcon,
    ClockIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    AcademicCapIcon,
    CheckCircleIcon,
} from "@heroicons/react/24/solid";
import api from '../../../api/axiosInstance';

// 📊 Composant Carte Statistique
const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
    <Card className="shadow-lg hover:shadow-xl transition-shadow">
        <CardBody className="p-6">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <Typography variant="small" className="text-gray-600 font-medium mb-1">
                        {title}
                    </Typography>
                    <Typography variant="h3" color="blue-gray" className="font-bold">
                        {value}
                    </Typography>
                    {subtitle && (
                        <Typography variant="small" className="text-gray-500 mt-1">
                            {subtitle}
                        </Typography>
                    )}
                    {trend !== undefined && trend !== 0 && (
                        <div className="flex items-center gap-1 mt-2">
                            {trend > 0 ? (
                                <>
                                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                                    <Typography variant="small" className="text-green-500 font-semibold">
                                        +{trend}%
                                    </Typography>
                                </>
                            ) : (
                                <>
                                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                                    <Typography variant="small" className="text-red-500 font-semibold">
                                        {trend}%
                                    </Typography>
                                </>
                            )}
                            <Typography variant="small" className="text-gray-500">
                                vs mois dernier
                            </Typography>
                        </div>
                    )}
                </div>
                <div className={`rounded-xl p-4 ${color}`}>
                    <Icon className="h-8 w-8 text-white" />
                </div>
            </div>
        </CardBody>
    </Card>
);

// 📅 Composant Cours à Venir
const UpcomingCourseCard = ({ course, onClick }) => (
    <div 
        className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
        onClick={onClick}
    >
        <div className="flex items-start justify-between">
            <div className="flex-1">
                <Typography variant="h6" color="blue-gray" className="font-bold">
                    {course.title}
                </Typography>
                <Typography variant="small" className="text-gray-600 mt-1">
                    {course.course_type__name || course.course_type_name}
                </Typography>
                <div className="flex items-center gap-2 mt-2">
                    <CalendarDaysIcon className="h-4 w-4 text-gray-500" />
                    <Typography variant="small" className="text-gray-700">
                        {new Date(course.date || course.course__date).toLocaleDateString('fr-FR', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short'
                        })}
                    </Typography>
                    <ClockIcon className="h-4 w-4 text-gray-500 ml-2" />
                    <Typography variant="small" className="text-gray-700">
                        {course.start_time || course.course__start_time}
                    </Typography>
                </div>
            </div>
            <Chip 
                value={`${course.max_participants || 0} places`} 
                size="sm" 
                color="blue" 
            />
        </div>
    </div>
);

// 👤 Composant Nouveau Membre
const RecentMemberCard = ({ member, onClick }) => (
    <div 
        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        onClick={onClick}
    >
        <Avatar
            src={member.photo || '/img/default-avatar.png'}
            alt={`${member.first_name} ${member.last_name}`}
            size="md"
            variant="rounded"
        />
        <div className="flex-1">
            <Typography variant="small" className="font-bold text-blue-gray-900">
                {member.first_name} {member.last_name}
            </Typography>
            <Typography variant="small" className="text-gray-600">
                {member.member_id}
            </Typography>
        </div>
        <Chip 
            value={member.status === 'ACTIVE' ? 'Actif' : 'Inactif'} 
            color={member.status === 'ACTIVE' ? 'green' : 'gray'} 
            size="sm" 
        />
    </div>
);

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('members/dashboard-stats/');
            console.log('📊 Dashboard data:', response.data);
            setStats(response.data);
        } catch (err) {
            console.error("❌ Erreur dashboard:", err);
            setError(err.response?.data?.detail || "Impossible de charger les statistiques");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <ClockIcon className="w-8 h-8 animate-spin text-blue-500 mr-3" />
                <Typography variant="h5" color="blue-gray">
                    Chargement du tableau de bord...
                </Typography>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4">
                <Alert color="red" className="mb-4">
                    {error}
                </Alert>
                <Button onClick={fetchStats} color="blue">
                    Réessayer
                </Button>
            </div>
        );
    }

    const { center, overview, memberStats, popularPlans, upcomingCoursesDetails, recentMembers } = stats;

    return (
        <div className="space-y-6">
            {/* 🏢 En-tête avec Info du Centre */}
            <div className="flex items-center justify-between">
                <div>
                    <Typography variant="h3" color="blue-gray" className="font-bold">
                        {center?.name || 'Dashboard'}
                    </Typography>
                    <Typography className="text-gray-600 mt-1">
                        Vue d'ensemble de votre salle de sport
                    </Typography>
                </div>
                {center?.logo && (
                    <img 
                        src={center.logo} 
                        alt={center.name} 
                        className="h-16 w-auto object-contain"
                    />
                )}
            </div>

            {/* 📊 Statistiques Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Membres Total"
                    value={overview.totalMembers || 0}
                    subtitle={`${overview.activeMembers || 0} actifs`}
                    icon={UserGroupIcon}
                    color="bg-gradient-to-br from-blue-500 to-blue-700"
                />
                <StatCard
                    title="Abonnements Actifs"
                    value={overview.activeSubscriptions || 0}
                    subtitle={overview.expiringSubscriptions > 0 ? `${overview.expiringSubscriptions} expirent bientôt` : ''}
                    icon={ClipboardDocumentListIcon}
                    color="bg-gradient-to-br from-green-500 to-green-700"
                />
                <StatCard
                    title="Cours à Venir"
                    value={overview.upcomingCourses || 0}
                    subtitle={`${overview.todayCourses || 0} aujourd'hui`}
                    icon={CalendarDaysIcon}
                    color="bg-gradient-to-br from-orange-500 to-orange-700"
                />
                <StatCard
                    title="Revenu Mensuel"
                    value={`${(overview.monthlyRevenue || 0).toLocaleString('fr-FR')} DT`}
                    icon={CurrencyDollarIcon}
                    color="bg-gradient-to-br from-purple-500 to-purple-700"
                    trend={overview.revenueChange}
                />
            </div>

            {/* 📈 Statistiques Secondaires */}
            {memberStats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="shadow-lg">
                        <CardBody className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <CheckCircleIcon className="h-6 w-6 text-green-500" />
                                <Typography variant="h6" color="blue-gray">
                                    Taux de Présence
                                </Typography>
                            </div>
                            <Typography variant="h2" color="blue-gray" className="font-bold">
                                {overview.attendanceRate || 0}%
                            </Typography>
                            <Typography variant="small" className="text-gray-600 mt-2">
                                Ce mois-ci
                            </Typography>
                        </CardBody>
                    </Card>

                    <Card className="shadow-lg">
                        <CardBody className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <AcademicCapIcon className="h-6 w-6 text-blue-500" />
                                <Typography variant="h6" color="blue-gray">
                                    Occupation Cours
                                </Typography>
                            </div>
                            <Typography variant="h2" color="blue-gray" className="font-bold">
                                {overview.courseOccupancyRate || 0}%
                            </Typography>
                            <Typography variant="small" className="text-gray-600 mt-2">
                                Taux de remplissage
                            </Typography>
                        </CardBody>
                    </Card>

                    <Card className="shadow-lg">
                        <CardBody className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <UserGroupIcon className="h-6 w-6 text-purple-500" />
                                <Typography variant="h6" color="blue-gray">
                                    Nouveaux Membres
                                </Typography>
                            </div>
                            <Typography variant="h2" color="blue-gray" className="font-bold">
                                {overview.newMembersThisWeek || 0}
                            </Typography>
                            <Typography variant="small" className="text-gray-600 mt-2">
                                Cette semaine
                            </Typography>
                        </CardBody>
                    </Card>
                </div>
            )}

            {/* 📅 Prochains Cours & Nouveaux Membres */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Prochains Cours */}
                <Card className="shadow-lg">
                    <CardBody>
                        <div className="flex items-center justify-between mb-4">
                            <Typography variant="h5" color="blue-gray" className="font-bold">
                                Prochains Cours
                            </Typography>
                            <Button
                                variant="text"
                                color="blue"
                                size="sm"
                                onClick={() => navigate('/admin/courses')}
                            >
                                Voir tous
                            </Button>
                        </div>
                        
                        {upcomingCoursesDetails && upcomingCoursesDetails.length > 0 ? (
                            <div className="space-y-3">
                                {upcomingCoursesDetails.map((course) => (
                                    <UpcomingCourseCard
                                        key={course.id || course.course__id}
                                        course={course}
                                        onClick={() => navigate(`/admin/courses/${course.id || course.course__id}`)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <Typography className="text-center text-gray-500 py-8">
                                Aucun cours planifié
                            </Typography>
                        )}
                    </CardBody>
                </Card>

                {/* Nouveaux Membres */}
                {recentMembers && recentMembers.length > 0 && (
                    <Card className="shadow-lg">
                        <CardBody>
                            <div className="flex items-center justify-between mb-4">
                                <Typography variant="h5" color="blue-gray" className="font-bold">
                                    Nouveaux Membres
                                </Typography>
                                <Button
                                    variant="text"
                                    color="blue"
                                    size="sm"
                                    onClick={() => navigate('/admin/members')}
                                >
                                    Voir tous
                                </Button>
                            </div>
                            
                            <div className="space-y-3">
                                {recentMembers.map((member) => (
                                    <RecentMemberCard
                                        key={member.id}
                                        member={member}
                                        onClick={() => navigate(`/admin/members/${member.id}`)}
                                    />
                                ))}
                            </div>
                        </CardBody>
                    </Card>
                )}
            </div>

            {/* 💳 Plans Populaires */}
            {popularPlans && popularPlans.length > 0 && (
                <Card className="shadow-lg">
                    <CardBody>
                        <Typography variant="h5" color="blue-gray" className="font-bold mb-4">
                            Plans d'Abonnement Populaires
                        </Typography>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {popularPlans.map((plan, index) => (
                                <div key={index} className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                                    <Typography variant="h6" color="purple" className="font-bold">
                                        {plan.plan__name}
                                    </Typography>
                                    <Typography variant="small" className="text-gray-700 mt-1">
                                        {plan.plan__price} DT
                                    </Typography>
                                    <Typography variant="small" className="text-purple-600 font-semibold mt-2">
                                        {plan.count} abonnés
                                    </Typography>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>
            )}
        </div>
    );
};

export default Dashboard;