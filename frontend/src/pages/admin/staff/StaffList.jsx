// frontend/src/pages/admin/staff/StaffList.jsx
import React, { useState, useEffect } from 'react';
import {
    Card,
    CardBody,
    Typography,
    Button,
    Select,
    Option,
    Input,
    Spinner,
    Alert,
} from '@material-tailwind/react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import PageContainer from '@/components/admin/PageContainer';
import api from '@/api/axiosInstance';

const StaffList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/auth/users/');
            setUsers(response.data);
            setError(null);
        } catch (err) {
            console.error('Erreur:', err);
            setError('Impossible de charger la liste du personnel');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await api.patch(`/auth/users/${userId}/`, { role: newRole });
            // Mettre à jour la liste des utilisateurs
            const updatedUsers = users.map(user => 
                user.id === userId ? { ...user, role: newRole } : user
            );
            setUsers(updatedUsers);
        } catch (err) {
            console.error('Erreur lors du changement de rôle:', err);
            alert('Erreur lors du changement de rôle');
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'ADMIN':
                return 'text-red-500';
            case 'COACH':
                return 'text-green-500';
            case 'RECEPTIONIST':
                return 'text-blue-500';
            default:
                return 'text-gray-500';
        }
    };

    const filteredUsers = users.filter(user =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <PageContainer>
                <div className="flex justify-center items-center h-96">
                    <Spinner className="h-12 w-12" color="blue" />
                </div>
            </PageContainer>
        );
    }

    if (error) {
        return (
            <PageContainer>
                <Alert color="red">{error}</Alert>
            </PageContainer>
        );
    }

    return (
        <PageContainer
            title="Gestion du Personnel"
            subtitle={`${users.length} membre(s) du personnel`}
        >
            <Card className="h-full w-full">
                <CardBody>
                    {/* Barre de recherche */}
                    <div className="mb-6">
                        <Input
                            label="Rechercher un membre du personnel..."
                            icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Tableau des utilisateurs */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-max table-auto text-left">
                            <thead>
                                <tr>
                                    {["Nom", "Email", "Rôle", "Actions"].map((head) => (
                                        <th key={head} className="border-b border-gray-100 bg-gray-50/50 p-4">
                                            <Typography
                                                variant="small"
                                                color="blue-gray"
                                                className="font-normal leading-none opacity-70"
                                            >
                                                {head}
                                            </Typography>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user, index) => {
                                    const isLast = index === filteredUsers.length - 1;
                                    const classes = isLast ? "p-4" : "p-4 border-b border-gray-50";

                                    return (
                                        <tr key={user.id}>
                                            <td className={classes}>
                                                <Typography variant="small" color="blue-gray" className="font-normal">
                                                    {user.first_name} {user.last_name}
                                                </Typography>
                                            </td>
                                            <td className={classes}>
                                                <Typography variant="small" color="blue-gray" className="font-normal">
                                                    {user.email}
                                                </Typography>
                                            </td>
                                            <td className={classes}>
                                                <Typography
                                                    variant="small"
                                                    className={`font-medium ${getRoleColor(user.role)}`}
                                                >
                                                    {user.role}
                                                </Typography>
                                            </td>
                                            <td className={classes}>
                                                <Select
                                                    value={user.role}
                                                    onChange={(value) => handleRoleChange(user.id, value)}
                                                    className="w-48"
                                                >
                                                    <Option value="ADMIN">Administrateur</Option>
                                                    <Option value="COACH">Coach</Option>
                                                    <Option value="RECEPTIONIST">Réceptionniste</Option>
                                                    <Option value="MEMBER">Membre</Option>
                                                </Select>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardBody>
            </Card>
        </PageContainer>
    );
};

export default StaffList;