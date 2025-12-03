// Fichier: frontend/src/pages/receptionist/dashboard/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardBody,
    Typography,
    Button,
    Chip,
    Input,
} from "@material-tailwind/react";
import {
    UserGroupIcon,
    ClipboardDocumentListIcon,
    CalendarDaysIcon,
    CurrencyDollarIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    CheckCircleIcon,
    ClockIcon,
    BuildingStorefrontIcon,
} from "@heroicons/react/24/solid";
import api from '../../../api/axiosInstance';

// 📊 Composant Carte Statistique
const StatCard = ({ title, value, subtitle, icon: Icon, action }) => (
    <Card className="shadow-md hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-blue-500">
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
                </div>
                <div className="rounded-xl p-3 bg-blue-50 text-blue-600">
                    <Icon className="h-7 w-7" />
                </div>
            </div>
        </CardBody>
    </Card>
);

// ⚡ Composant Actions Rapides
const QuickAction = ({ title, icon: Icon, onClick }) => (
    <Button
        className="flex items-center justify-start gap-3 w-full py-4 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm"
        onClick={onClick}
    >
        <div className="rounded-lg p-2 bg-blue-100 text-blue-600">
            <Icon className="h-5 w-5" />
        </div>
        <Typography variant="small" className="font-semibold">
            {title}
        </Typography>
    </Button>
);

const ReceptionistDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const response = await api.get('members/dashboard-stats/');
            setStats(response.data);
        } catch (err) {
            console.error("❌ Erreur dashboard:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/receptionist/members?search=${searchTerm}`);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <ClockIcon className="w-8 h-8 animate-spin text-blue-500 mr-3" />
                <Typography variant="h5" color="blue-gray">
                    Chargement...
                </Typography>
            </div>
        );
    }

    const { center, overview } = stats || { overview: {} };

    return (
        <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
            {/* 🏢 En-tête */}
            <div className="flex items-center justify-between">
                <div>
                    <Typography variant="h3" color="blue-gray" className="font-bold">
                        Tableau de Bord
                    </Typography>
                    <Typography className="text-gray-600 mt-1">
                        {center?.name || 'GymFlow'} • {new Date().toLocaleDateString('fr-FR', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </Typography>
                </div>
                <div className="flex items-center gap-3">
                    {center?.logo ? (
                        <img 
                            src={center.logo} 
                            alt={center.name} 
                            className="h-12 w-auto object-contain"
                        />
                    ) : (
                        <BuildingStorefrontIcon className="h-10 w-10 text-gray-400" />
                    )}
                </div>
            </div>

            {/* 🔍 Barre de Recherche Rapide */}
            <Card className="shadow-md bg-white">
                <CardBody className="p-6">
                    <form onSubmit={handleSearch}>
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <Input
                                    size="lg"
                                    placeholder="Rechercher un membre (nom, email, ID membre)..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="!border-gray-300 focus:!border-blue-500"
                                    labelProps={{
                                        className: "text-gray-700"
                                    }}
                                    icon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
                                />
                            </div>
                            <Button 
                                type="submit"
                                size="lg" 
                                color="blue" 
                                className="flex items-center gap-2"
                            >
                                <MagnifyingGlassIcon className="h-4 w-4" />
                                Rechercher
                            </Button>
                        </div>
                    </form>
                </CardBody>
            </Card>

            {/* ⚡ Actions Rapides */}
            <div>
                <Typography variant="h5" color="blue-gray" className="font-bold mb-4">
                    Actions Rapides
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <QuickAction
                        title="Nouvel Abonnement"
                        icon={PlusIcon}
                        onClick={() => navigate('/receptionist/subscriptions/create')}
                    />
                    <QuickAction
                        title="Réserver un Cours"
                        icon={CalendarDaysIcon}
                        onClick={() => navigate('/receptionist/bookings/create')}
                    />
                    <QuickAction
                        title="Check-in Membre"
                        icon={CheckCircleIcon}
                        onClick={() => navigate('/receptionist/bookings/checkin')}
                    />
                    <QuickAction
                        title="Enregistrer Paiement"
                        icon={CurrencyDollarIcon}
                        onClick={() => navigate('/receptionist/billing')}
                    />
                </div>
            </div>

            {/* 📊 Statistiques Principales */}
            <div>
                <Typography variant="h5" color="blue-gray" className="font-bold mb-4">
                    Aperçu du Centre
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Membres Total"
                        value={overview.totalMembers || 0}
                        subtitle={`${overview.activeMembers || 0} actifs`}
                        icon={UserGroupIcon}
                        action={() => navigate('/receptionist/members')}
                    />
                    <StatCard
                        title="Abonnements Actifs"
                        value={overview.activeSubscriptions || 0}
                        subtitle={overview.expiringSubscriptions > 0 ? `${overview.expiringSubscriptions} expirent bientôt` : 'Tous stables'}
                        icon={ClipboardDocumentListIcon}
                        action={() => navigate('/receptionist/subscriptions')}
                    />
                    <StatCard
                        title="Cours Aujourd'hui"
                        value={overview.todayCourses || 0}
                        subtitle={`${overview.upcomingCourses || 0} à venir cette semaine`}
                        icon={CalendarDaysIcon}
                        action={() => navigate('/receptionist/bookings')}
                    />
                    <StatCard
                        title="Revenu du Jour"
                        value={`${((overview.monthlyRevenue || 0) / 30).toFixed(0)} DT`}
                        subtitle="Estimation journalière"
                        icon={CurrencyDollarIcon}
                        action={() => navigate('/receptionist/billing')}
                    />
                </div>
            </div>

            {/* 📅 Aperçu du Jour */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cours du Jour */}
                <Card className="shadow-md border-t-4 border-t-blue-500">
                    <CardBody className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <Typography variant="h5" color="blue-gray" className="font-bold">
                                Cours d'Aujourd'hui
                            </Typography>
                            <Button
                                variant="text"
                                color="blue"
                                size="sm"
                                onClick={() => navigate('/receptionist/bookings')}
                            >
                                Voir tous
                            </Button>
                        </div>
                        
                        {stats?.upcomingCoursesDetails && stats.upcomingCoursesDetails.length > 0 ? (
                            <div className="space-y-3">
                                {stats.upcomingCoursesDetails.filter(course => 
                                    new Date(course.date || course.course__date).toDateString() === new Date().toDateString()
                                ).map((course) => (
                                    <div 
                                        key={course.id}
                                        className="p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer border border-gray-200"
                                        onClick={() => navigate(`/receptionist/bookings/courses/${course.id}`)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Typography variant="h6" color="blue-gray" className="font-semibold">
                                                    {course.title}
                                                </Typography>
                                                <Typography variant="small" className="text-gray-600">
                                                    {course.start_time} - {course.end_time} • {course.instructor}
                                                </Typography>
                                            </div>
                                            <Chip 
                                                value={`${course.registered_participants || 0}/${course.max_participants}`}
                                                size="sm" 
                                                color={course.registered_participants >= course.max_participants ? "red" : "blue"}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <CalendarDaysIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <Typography className="text-gray-500">
                                    Aucun cours prévu aujourd'hui
                                </Typography>
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Alertes et Rappels */}
                <Card className="shadow-md border-t-4 border-t-orange-500">
                    <CardBody className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <Typography variant="h5" color="blue-gray" className="font-bold">
                                Alertes et Rappels
                            </Typography>
                            <Button
                                variant="text"
                                color="orange"
                                size="sm"
                                onClick={() => navigate('/receptionist/subscriptions?filter=expiring')}
                            >
                                Gérer
                            </Button>
                        </div>
                        
                        <div className="space-y-4">
                            {overview.expiringSubscriptions > 0 && (
                                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-full p-2 bg-orange-100">
                                            <ClipboardDocumentListIcon className="h-5 w-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <Typography variant="h6" color="orange" className="font-semibold">
                                                {overview.expiringSubscriptions} abonnement(s) expirent bientôt
                                            </Typography>
                                            <Typography variant="small" className="text-orange-700">
                                                À renouveler dans les 7 jours
                                            </Typography>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {overview.pendingPayments > 0 && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-full p-2 bg-red-100">
                                            <CurrencyDollarIcon className="h-5 w-5 text-red-600" />
                                        </div>
                                        <div>
                                            <Typography variant="h6" color="red" className="font-semibold">
                                                {overview.pendingPayments} paiement(s) en attente
                                            </Typography>
                                            <Typography variant="small" className="text-red-700">
                                                À régulariser
                                            </Typography>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {overview.expiringSubscriptions === 0 && overview.pendingPayments === 0 && (
                                <div className="text-center py-8">
                                    <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto mb-3" />
                                    <Typography className="text-gray-500">
                                        Aucune alerte pour le moment
                                    </Typography>
                                    <Typography variant="small" className="text-gray-400">
                                        Tout est à jour
                                    </Typography>
                                </div>
                            )}
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* 💡 Conseils du Jour */}
            <Card className="shadow-md bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200">
                <CardBody className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full p-2 bg-blue-100">
                            <ClipboardDocumentListIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <Typography variant="h6" color="blue-gray" className="font-semibold">
                                Bonnes pratiques
                            </Typography>
                            <Typography className="text-gray-700">
                                Vérifiez régulièrement les abonnements expirant et contactez les membres 3 jours avant la date d'expiration.
                            </Typography>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default ReceptionistDashboard;