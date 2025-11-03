import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardHeader, 
    CardBody,
    Typography,
    Button,
    Select,
    Option,
    Input,
    Spinner,
    Alert,
} from '@material-tailwind/react';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import api from '@/api/axiosInstance';

const STAFF_ROLES = ['ADMIN', 'COACH', 'RECEPTIONIST'];

// EXPORTATION NOMMÉE
export const StaffList = () => { 
    const navigate = useNavigate();
    const [users, setUsers] = useState([]); 
    const [statistics, setStatistics] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const calculateStatistics = (staffUsers) => {
        const safeUsers = staffUsers || []; 
        const total = safeUsers.length;
        const admins = safeUsers.filter(user => user.role === 'ADMIN').length;
        const coaches = safeUsers.filter(user => user.role === 'COACH').length;
        const receptionists = safeUsers.filter(user => user.role === 'RECEPTIONIST').length;
        return { total, admins, coaches, receptionists };
    };

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
            setStatistics(calculateStatistics(staffUsers));
            setError(null);
        } catch (err) {
            console.error('Erreur:', err);
            setError('Impossible de charger la liste du personnel');
            setUsers([]); 
            setStatistics(calculateStatistics([]));
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
            setStatistics(calculateStatistics(updatedUsers));
        } catch (err) {
            console.error('Erreur lors du changement de rôle:', err);
            alert('Erreur lors du changement de rôle');
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'ADMIN': return 'text-red-500 font-bold';
            case 'COACH': return 'text-green-500 font-bold';
            case 'RECEPTIONIST': return 'text-blue-500 font-bold';
            default: return 'text-gray-500';
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
            <div className="flex justify-center items-center h-96">
                <Spinner className="h-12 w-12" color="blue" />
            </div>
        );
    }

    if (error) {
        return (
            <Alert color="red" className="m-4">{error}</Alert>
        );
    }

    return (
        <> 
            {/* 🎯 Cartes de Statistiques */}
            {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card style={{ backgroundColor: '#00357a' }}><CardBody className="text-center py-4"><Typography variant="h3" color="white">{statistics.total}</Typography><Typography color="white" className="mt-2 text-sm">Total Personnel</Typography></CardBody></Card>
                    <Card style={{ backgroundColor: '#ef4444' }}><CardBody className="text-center py-4"><Typography variant="h3" color="white">{statistics.admins}</Typography><Typography color="white" className="mt-2 text-sm">Administrateurs</Typography></CardBody></Card>
                    <Card style={{ backgroundColor: '#10b981' }}><CardBody className="text-center py-4"><Typography variant="h3" color="white">{statistics.coaches}</Typography><Typography color="white" className="mt-2 text-sm">Coachs</Typography></CardBody></Card>
                    <Card style={{ backgroundColor: '#6b7280' }}><CardBody className="text-center py-4"><Typography variant="h3" color="white">{statistics.receptionists}</Typography><Typography color="white" className="mt-2 text-sm">Réceptionnistes</Typography></CardBody></Card>
                </div>
            )}
            
            {/* 🎯 CardHeader Bleu */}
            <CardHeader
                variant="gradient"
                style={{ background: 'linear-gradient(87deg, #00357a 0, #0056b3 100%)' }}
                className="mx-4 rounded-xl mt-6 p-6 shadow-blue-gray-900/10" 
            >
                <div className="flex items-center justify-between">
                    <Typography variant="h6" color="white">
                        Gestion du Personnel ({users.length} membres)
                    </Typography>
                    <Button
                        size="sm"
                        color="white"
                        className="flex items-center gap-2"
                        onClick={() => navigate('/admin/staff/create')} 
                    >
                        <PlusIcon className="h-4 w-4" />
                        Ajouter un Employé
                    </Button>
                </div>
            </CardHeader>
            <CardBody className="overflow-x-scroll px-0 pt-0 pb-2"> 
                <div className="mb-6 p-4">
                    <Input
                        label="Rechercher un membre du personnel..."
                        icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-max table-auto text-left">
                        <thead>
                            <tr>
                                {["Nom", "Email", "Rôle", "Actions"].map((head) => (
                                    <th key={head} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                                        <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                                            {head}
                                        </Typography>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user, index) => {
                                const isLast = index === filteredUsers.length - 1;
                                const classes = isLast ? "py-3 px-5" : "py-3 px-5 border-b border-blue-gray-50";
                                return (
                                    <tr key={user.id}>
                                        <td className={classes}><Typography variant="small" color="blue-gray" className="font-semibold">{user.first_name} {user.last_name}</Typography></td>
                                        <td className={classes}><Typography variant="small" color="blue-gray" className="font-normal">{user.email}</Typography></td>
                                        <td className={classes}><Typography variant="small" className={getRoleColor(user.role)}>{user.role}</Typography></td>
                                        <td className={classes}>
                                            <Select value={user.role} onChange={(value) => handleRoleChange(user.id, value)} className="w-48" label="Changer le rôle">
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
        </>
    );
};