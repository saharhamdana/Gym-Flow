// frontend/src/pages/superadmin/GymCenterManagement.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardBody,
    Typography,
    Button,
    Chip,
    Input,
    Spinner,
    Alert,
    IconButton,
    Tooltip,
} from '@material-tailwind/react';
import {
    MagnifyingGlassIcon,
    PlusIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    BuildingOfficeIcon,
    UserGroupIcon,
} from '@heroicons/react/24/solid';
import api from '@/api/axiosInstance';

const GymCenterManagement = () => {
    const navigate = useNavigate();
    const [centers, setCenters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCenters();
    }, []);

    const fetchCenters = async () => {
        try {
            const response = await api.get('/auth/centers/');
            const data = Array.isArray(response.data) ? response.data : response.data.results || [];
            setCenters(data);
            setError(null);
        } catch (err) {
            console.error('Erreur:', err);
            setError('Impossible de charger les salles');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette salle ?')) return;

        try {
            await api.delete(`/auth/centers/${id}/`);
            setCenters(centers.filter(c => c.id !== id));
        } catch (err) {
            console.error('Erreur:', err);
            alert('Erreur lors de la suppression');
        }
    };

    const filteredCenters = centers.filter(center =>
        center.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        center.subdomain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        center.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spinner color="blue" className="h-12 w-12" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-10 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* En-tête */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Typography variant="h3" color="blue-gray" className="font-bold">
                            🏋️ Gestion des Salles de Sport
                        </Typography>
                        <Typography className="text-gray-600 mt-1">
                            {centers.length} salle(s) enregistrée(s)
                        </Typography>
                    </div>
                    <Button
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600"
                        onClick={() => navigate('/superadmin/gyms/create')}
                    >
                        <PlusIcon className="h-5 w-5" />
                        Nouvelle Salle
                    </Button>
                </div>
            </div>

            {error && <Alert color="red" className="mb-4">{error}</Alert>}

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="shadow-lg">
                    <CardBody className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
                        </div>
                        <div>
                            <Typography variant="small" className="text-gray-600">
                                Total Salles
                            </Typography>
                            <Typography variant="h4" color="blue-gray">
                                {centers.length}
                            </Typography>
                        </div>
                    </CardBody>
                </Card>

                <Card className="shadow-lg">
                    <CardBody className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-xl">
                            <BuildingOfficeIcon className="h-8 w-8 text-green-600" />
                        </div>
                        <div>
                            <Typography variant="small" className="text-gray-600">
                                Salles Actives
                            </Typography>
                            <Typography variant="h4" color="green">
                                {centers.filter(c => c.is_active).length}
                            </Typography>
                        </div>
                    </CardBody>
                </Card>

                <Card className="shadow-lg">
                    <CardBody className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-xl">
                            <UserGroupIcon className="h-8 w-8 text-purple-600" />
                        </div>
                        <div>
                            <Typography variant="small" className="text-gray-600">
                                Total Membres
                            </Typography>
                            <Typography variant="h4" color="purple">
                                {centers.reduce((acc, c) => acc + (c.members_count || 0), 0)}
                            </Typography>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Tableau */}
            <Card className="shadow-xl">
                <CardBody>
                    <div className="mb-6">
                        <Input
                            label="Rechercher une salle..."
                            icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {filteredCenters.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-max table-auto">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50">
                                        {['Nom', 'Sous-domaine', 'Propriétaire', 'Contact', 'Statut', 'Actions'].map((head) => (
                                            <th key={head} className="p-4 text-left">
                                                <Typography variant="small" className="font-bold uppercase text-gray-700">
                                                    {head}
                                                </Typography>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCenters.map((center, index) => {
                                        const isLast = index === filteredCenters.length - 1;
                                        const className = `p-4 ${isLast ? '' : 'border-b border-gray-100'}`;

                                        return (
                                            <tr key={center.id} className="hover:bg-blue-50 transition-colors">
                                                <td className={className}>
                                                    <div className="flex items-center gap-3">
                                                        {center.logo && (
                                                            <img
                                                                src={center.logo}
                                                                alt={center.name}
                                                                className="h-10 w-10 rounded-lg object-cover"
                                                            />
                                                        )}
                                                        <Typography variant="small" className="font-bold text-blue-gray-900">
                                                            {center.name}
                                                        </Typography>
                                                    </div>
                                                </td>
                                                <td className={className}>
                                                    <div>
                                                        <Typography variant="small" className="font-mono text-blue-600">
                                                            {center.subdomain}
                                                        </Typography>
                                                        <Typography variant="small" className="text-gray-600">
                                                            {center.full_url}
                                                        </Typography>
                                                    </div>
                                                </td>
                                                <td className={className}>
                                                    <Typography variant="small" className="text-gray-700">
                                                        {center.owner_name}
                                                    </Typography>
                                                </td>
                                                <td className={className}>
                                                    <div>
                                                        <Typography variant="small" className="text-gray-700">
                                                            {center.email}
                                                        </Typography>
                                                        <Typography variant="small" className="text-gray-600">
                                                            {center.phone}
                                                        </Typography>
                                                    </div>
                                                </td>
                                                <td className={className}>
                                                    <Chip
                                                        value={center.is_active ? 'Actif' : 'Inactif'}
                                                        color={center.is_active ? 'green' : 'gray'}
                                                        size="sm"
                                                    />
                                                </td>
                                                <td className={className}>
                                                    <div className="flex gap-2">
                                                        <Tooltip content="Voir détails">
                                                            <IconButton
                                                                variant="text"
                                                                color="blue"
                                                                size="sm"
                                                                onClick={() => navigate(`/superadmin/gyms/${center.id}`)}
                                                            >
                                                                <EyeIcon className="h-4 w-4" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip content="Modifier">
                                                            <IconButton
                                                                variant="text"
                                                                color="green"
                                                                size="sm"
                                                                onClick={() => navigate(`/superadmin/gyms/${center.id}/edit`)}
                                                            >
                                                                <PencilIcon className="h-4 w-4" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip content="Supprimer">
                                                            <IconButton
                                                                variant="text"
                                                                color="red"
                                                                size="sm"
                                                                onClick={() => handleDelete(center.id)}
                                                            >
                                                                <TrashIcon className="h-4 w-4" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Typography color="gray">
                                {searchTerm ? 'Aucune salle trouvée.' : 'Aucune salle enregistrée.'}
                            </Typography>
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    );
};

export default GymCenterManagement;