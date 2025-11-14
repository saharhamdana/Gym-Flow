import React from 'react';
import api from '../../../api/axiosInstance';
import {
    Card,
    CardBody,
    Typography,
    Alert,
} from "@material-tailwind/react";
import {
    UserGroupIcon,
    ClipboardDocumentListIcon,
    CalendarDaysIcon,
    CurrencyDollarIcon,
    ClockIcon,
} from "@heroicons/react/24/solid";

const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card>
        <CardBody className="p-4">
            <div className="flex items-center gap-4">
                <div className={`rounded-lg p-3 ${color}`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                    <Typography variant="small" color="blue-gray" className="font-medium">
                        {title}
                    </Typography>
                    <Typography variant="h4" color="blue-gray">
                        {value}
                    </Typography>
                </div>
            </div>
        </CardBody>
    </Card>
);

const Dashboard = () => {
    const [stats, setStats] = React.useState({
        totalMembers: 0,
        activeSubscriptions: 0,
        upcomingCourses: 0,
        monthlyRevenue: 0,
        recentMembers: [],
        upcomingCoursesDetails: [],
    });
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await api.get('members/dashboard-stats/');

                if (response.data) {
                    setStats({
                        totalMembers: response.data.totalMembers || 0,
                        activeSubscriptions: response.data.activeSubscriptions || 0,
                        upcomingCourses: response.data.upcomingCourses || 0,
                        monthlyRevenue: response.data.monthlyRevenue || 0,
                        recentMembers: response.data.recentMembers || [],
                        upcomingCoursesDetails: response.data.upcomingCoursesDetails || [],
                    });
                }
                
            } catch (err) {
                console.error("❌ Erreur dashboard:", err);
                
                // ✅ GESTION DÉTAILLÉE DES ERREURS
                if (err.response) {
                    // Erreur HTTP (4xx, 5xx)
                    if (err.response.status === 403) {
                        setError("🔒 Accès refusé. Vous n'avez pas les permissions nécessaires.");
                    } else if (err.response.status === 401) {
                        setError("🔑 Non authentifié. Veuillez vous reconnecter.");
                    } else {
                        setError(`❌ Erreur serveur (${err.response.status}): ${err.response.data?.detail || 'Erreur inconnue'}`);
                    }
                } else if (err.request) {
                    // Requête envoyée, mais pas de réponse
                    setError("🌐 Erreur réseau: Le serveur backend est injoignable. Vérifiez qu'il est démarré sur http://localhost:8000");
                } else {
                    // Autre erreur
                    setError(`⚠️ Erreur: ${err.message}`);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-40">
                <ClockIcon className="w-8 h-8 animate-spin text-blue-500 mr-3" />
                <Typography variant="h5" color="blue-gray">
                    Chargement des statistiques...
                </Typography>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4">
                <Alert color="red" className="mb-4">
                    <div className="flex flex-col gap-2">
                        <Typography variant="h6" color="white">
                            Erreur de Chargement
                        </Typography>
                        <Typography variant="small" color="white">
                            {error}
                        </Typography>
                    </div>
                </Alert>
                
                {/* ✅ AIDE AU DÉBOGAGE */}
                <Alert color="blue">
                    <Typography variant="h6" className="mb-2">
                        💡 Solutions possibles :
                    </Typography>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Vérifiez que le serveur Django est démarré : <code>python manage.py runserver</code></li>
                        <li>Vérifiez votre token JWT (déconnexion/reconnexion)</li>
                        <li>Vérifiez les permissions de votre rôle utilisateur</li>
                        <li>Consultez la console du navigateur (F12) pour plus de détails</li>
                    </ul>
                </Alert>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <Typography variant="h4" color="blue-gray">
                    Tableau de bord
                </Typography>
                <Typography color="gray" className="mt-1 font-normal">
                    Vue d'ensemble de votre salle de sport
                </Typography>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatCard
                    title="Membres Total"
                    value={stats.totalMembers}
                    icon={UserGroupIcon}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Abonnements Actifs"
                    value={stats.activeSubscriptions}
                    icon={ClipboardDocumentListIcon}
                    color="bg-green-500"
                />
                <StatCard
                    title="Cours à Venir"
                    value={stats.upcomingCourses}
                    icon={CalendarDaysIcon}
                    color="bg-orange-500"
                />
                <StatCard
                    title="Revenu Mensuel"
                    value={`${stats.monthlyRevenue.toLocaleString('fr-FR')} DT`}
                    icon={CurrencyDollarIcon}
                    color="bg-purple-500"
                />
            </div>

            {/* TODO: Ajouter les widgets pour recentMembers et upcomingCoursesDetails */}
        </div>
    );
};

export default Dashboard;