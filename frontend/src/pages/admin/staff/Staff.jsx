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
    Select,
    Option,
} from '@material-tailwind/react';
import { 
    MagnifyingGlassIcon, 
    PlusIcon,
    PencilIcon,
    TrashIcon,
} from '@heroicons/react/24/solid';
import PageContainer from '@/components/admin/PageContainer';
import api from '@/api/axiosInstance';

const STAFF_ROLES = ['ADMIN', 'COACH', 'RECEPTIONIST'];

export const Staff = () => { 
    const navigate = useNavigate();
    const [users, setUsers] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/auth/users/');
            const allUsers = Array.isArray(response.data) ? response.data : []; 
            
            // Filtre : N'afficher que le personnel
            const staffUsers = allUsers.filter(user => STAFF_ROLES.includes(user.role));
            
            setUsers(staffUsers);
            setError(null);
        } catch (err) {
            console.error('Erreur:', err);
            setError('Impossible de charger la liste du personnel');
            setUsers([]); 
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await api.patch(`/auth/users/${userId}/`, { role: newRole });
            
            let updatedUsers;
            if (newRole === 'MEMBER') {
                 // Retire l'utilisateur s'il devient simple membre
                 updatedUsers = users.filter(user => user.id !== userId);
            } else {
                 // Met à jour le rôle
                 updatedUsers = users.map(user => 
                    user.id === userId ? { ...user, role: newRole } : user
                );
            }
            
            setUsers(updatedUsers);
        } catch (err) {
            console.error('Erreur lors du changement de rôle:', err);
            alert('Erreur lors du changement de rôle');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce membre du personnel ?')) {
            try {
                await api.delete(`/auth/users/${id}/`);
                fetchUsers();
            } catch (error) {
                console.error('Error deleting staff:', error);
                alert('Erreur lors de la suppression du membre du personnel');
            }
        }
    };

    const getStatusColor = (role) => {
        const colors = {
            'ADMIN': 'red',
            'COACH': 'green',
            'RECEPTIONIST': 'blue',
        };
        return colors[role] || 'gray';
    };

    const getStatusLabel = (role) => {
        const labels = {
            'ADMIN': 'ADMINISTRATEUR',
            'COACH': 'COACH', 
            'RECEPTIONIST': 'RÉCEPTIONNISTE',
        };
        return labels[role] || role;
    };

    const filteredUsers = users.filter(user =>
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <PageContainer>
                <div className="flex justify-center items-center h-96">
                    <Spinner color="blue" className="h-12 w-12" />
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer
            title="Gestion du Personnel"
            subtitle={`${users.length} membre(s) du personnel`}
            actions={
                <Button
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg hover:shadow-xl transition-all"
                    onClick={() => navigate('/admin/staff/create')}
                >
                    <PlusIcon className="h-5 w-5" />
                    Nouveau Membre
                </Button>
            }
        >
            {error && <Alert color="red" className="mb-4">{error}</Alert>}

            <Card className="shadow-lg">
                <CardBody className="p-6">
                    {/* Barre de Recherche */}
                    <div className="mb-6">
                        <Input
                            label="Rechercher un membre du personnel..."
                            icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Tableau */}
                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <Spinner color="blue" className="h-8 w-8" />
                        </div>
                    ) : filteredUsers.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-max table-auto">
                                <thead>
                                    <tr>
                                        <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                            <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                                Nom
                                            </Typography>
                                        </th>
                                        <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                            <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                                Email
                                            </Typography>
                                        </th>
                                        <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                            <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                                Téléphone
                                            </Typography>
                                        </th>
                                        <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                            <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                                Rôle
                                            </Typography>
                                        </th>
                                        <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                            <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                                Actions
                                            </Typography>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user, index) => (
                                        <tr key={user.id || index} className="hover:bg-blue-gray-50">
                                            <td className="p-4 border-b border-blue-gray-50">
                                                <Typography variant="small" color="blue-gray" className="font-normal">
                                                    {user.first_name} {user.last_name}
                                                </Typography>
                                            </td>
                                            <td className="p-4 border-b border-blue-gray-50">
                                                <Typography variant="small" color="blue-gray" className="font-normal">
                                                    {user.email || 'N/A'}
                                                </Typography>
                                            </td>
                                            <td className="p-4 border-b border-blue-gray-50">
                                                <Typography variant="small" color="blue-gray" className="font-normal">
                                                    {user.phone || 'Non renseigné'}
                                                </Typography>
                                            </td>
                                            <td className="p-4 border-b border-blue-gray-50">
                                                <Chip
                                                    variant="ghost"
                                                    size="sm"
                                                    value={getStatusLabel(user.role)}
                                                    color={getStatusColor(user.role)}
                                                />
                                            </td>
                                            <td className="p-4 border-b border-blue-gray-50">
                                                <div className="flex items-center gap-2">
                                                    <Select 
                                                        value={user.role} 
                                                        onChange={(value) => handleRoleChange(user.id, value)}
                                                        className="w-48" 
                                                        label="Changer le rôle"
                                                    >
                                                        <Option value="ADMIN">Administrateur</Option>
                                                        <Option value="COACH">Coach</Option>
                                                        <Option value="RECEPTIONIST">Réceptionniste</Option>
                                                        <Option value="MEMBER">Membre</Option>
                                                    </Select>
                                                    <Button
                                                        variant="text"
                                                        color="blue"
                                                        size="sm"
                                                        onClick={() => navigate(`/admin/staff/edit/${user.id}`)}
                                                    >
                                                        <PencilIcon className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="text"
                                                        color="red"
                                                        size="sm"
                                                        onClick={() => handleDelete(user.id)}
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Typography color="gray">
                                {searchQuery ? 'Aucun membre du personnel trouvé.' : 'Aucun membre du personnel enregistré.'}
                            </Typography>
                        </div>
                    )}
                </CardBody>
            </Card>
        </PageContainer>
    );
};

export default Staff;