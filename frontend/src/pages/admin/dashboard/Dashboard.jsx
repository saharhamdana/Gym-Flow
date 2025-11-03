import React from 'react';
// CORRECTION DU CHEMIN D'IMPORTATION (dépend de la structure de votre projet)
import api from '../../../api/axiosInstance'; 
import {
    Card,
    CardBody,
    Typography,
} from "@material-tailwind/react";
import {
    UserGroupIcon,
    ClipboardDocumentListIcon,
    CalendarDaysIcon,
    CurrencyDollarIcon,
    ClockIcon,
} from "@heroicons/react/24/solid";

// Composant pour afficher les cartes de statistiques (StatCard)
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

// Composant principal du tableau de bord (Dashboard)
const Dashboard = () => {
    const [stats, setStats] = React.useState({
        totalMembers: 0,
        activeSubscriptions: 0,
        upcomingCourses: 0,
        monthlyRevenue: 0,
        // Les détails des listes ne sont pas dans le state principal pour les cartes, mais sont bien dans l'API
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
                // Utilisation de l'URL sans le préfixe /api/ car il est déjà dans baseURL
                const response = await api.get('members/dashboard-stats/');

                if (response.data) {
                    setStats({
                        // 🟢 CORRECTION : Utilisation des clés camelCase pour correspondre au JSON renvoyé par le backend
                        totalMembers: response.data.totalMembers || 0,
                        activeSubscriptions: response.data.activeSubscriptions || 0,
                        upcomingCourses: response.data.upcomingCourses || 0,
                        monthlyRevenue: response.data.monthlyRevenue || 0,
                        recentMembers: response.data.recentMembers || [],
                        upcomingCoursesDetails: response.data.upcomingCoursesDetails || [],
                    });
                }
                
            } catch (err) {
                console.error("Erreur lors de la récupération des statistiques:", err.response || err);
                
                if (err.response && err.response.status !== 401) {
                   setError("Impossible de charger les données. Vérifiez l'endpoint API ou les permissions.");
                } else if (!err.response) {
                   setError("Erreur réseau: API Backend injoignable.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    // Affichage du chargement ou de l'erreur
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
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                <Typography variant="h6">{error}</Typography>
            </div>
        );
    }
    
    // Rendu du tableau de bord avec les données chargées
    return (
        <div>
            <div className="mb-8">
                <Typography variant="h4" color="blue-gray">
                    Tableau de bord
                </Typography>
                <Typography color="gray" className="mt-1 font-normal">
                    Vue d'overview de votre salle de sport
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
                    // Assurez-vous que toLocaleString gère le formatage monétaire si nécessaire
                    value={`${stats.monthlyRevenue.toLocaleString('fr-FR')} DT`} 
                    icon={CurrencyDollarIcon}
                    color="bg-purple-500"
                />
            </div>

            {/* TODO: Add more dashboard widgets here (using recentMembers and upcomingCoursesDetails) */}
        </div>
    );
};

export default Dashboard;