// Fichier: frontend/src/pages/admin/members/MemberList.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Card,
    CardBody,
    Typography,
    Button,
    Chip,
    Avatar,
    Input,
    Spinner,
    Alert,
    IconButton,
    Tooltip,
} from "@material-tailwind/react";
import { 
    MagnifyingGlassIcon, 
    UserPlusIcon,
    EyeIcon,
    PencilIcon,
    PhoneIcon,
    EnvelopeIcon,
} from "@heroicons/react/24/solid";
import PageContainer from "@/components/admin/PageContainer";
import api from "@/api/axiosInstance";

export function MemberList() {
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const response = await api.get("members/");
                const memberData = Array.isArray(response.data) 
                    ? response.data 
                    : (response.data.results || []);
                setMembers(memberData);
                setError(null);
            } catch (err) {
                console.error("Erreur de récupération des membres:", err);
                setError(err.response?.data?.detail || "Échec de la récupération des données.");
            } finally {
                setLoading(false);
            }
        };
        fetchMembers();
    }, []);

    const filteredMembers = Array.isArray(members) ? members.filter(member =>
        member.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.member_id?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    const getStatusChip = (status) => {
        const statusConfig = {
            'ACTIVE': { color: 'green', text: 'Actif' },
            'INACTIVE': { color: 'gray', text: 'Inactif' },
            'SUSPENDED': { color: 'orange', text: 'Suspendu' },
            'EXPIRED': { color: 'red', text: 'Expiré' },
        };
        const config = statusConfig[status] || { color: 'gray', text: status };
        return (
            <Chip 
                value={config.text} 
                color={config.color} 
                size="sm"
                className="font-semibold"
            />
        );
    };

    if (loading) {
        return (
            <PageContainer>
                <div className="flex justify-center items-center h-96">
                    <Spinner color="blue" className="h-12 w-12" />
                </div>
            </PageContainer>
        );
    }

    if (error) {
        return (
            <PageContainer>
                <Alert color="red">{error}</Alert>
                <Button className="mt-4" onClick={() => window.location.reload()}>
                    Réessayer
                </Button>
            </PageContainer>
        );
    }

    return (
        <PageContainer
            title="Gestion des Membres"
            subtitle={`${members.length} membre(s) enregistré(s)`}
            actions={
                <Button
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg hover:shadow-xl transition-all"
                    onClick={() => navigate('/admin/members/create')}
                >
                    <UserPlusIcon className="h-5 w-5" />
                    Nouveau Membre
                </Button>
            }
        >
            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="shadow-md hover:shadow-lg transition-shadow">
                    <CardBody className="p-4">
                        <Typography variant="small" className="text-gray-600">
                            Total
                        </Typography>
                        <Typography variant="h4" color="blue-gray" className="font-bold">
                            {members.length}
                        </Typography>
                    </CardBody>
                </Card>
                <Card className="shadow-md hover:shadow-lg transition-shadow">
                    <CardBody className="p-4">
                        <Typography variant="small" className="text-gray-600">
                            Actifs
                        </Typography>
                        <Typography variant="h4" color="green" className="font-bold">
                            {members.filter(m => m.status === 'ACTIVE').length}
                        </Typography>
                    </CardBody>
                </Card>
                <Card className="shadow-md hover:shadow-lg transition-shadow">
                    <CardBody className="p-4">
                        <Typography variant="small" className="text-gray-600">
                            Inactifs
                        </Typography>
                        <Typography variant="h4" color="gray" className="font-bold">
                            {members.filter(m => m.status === 'INACTIVE').length}
                        </Typography>
                    </CardBody>
                </Card>
                <Card className="shadow-md hover:shadow-lg transition-shadow">
                    <CardBody className="p-4">
                        <Typography variant="small" className="text-gray-600">
                            Suspendus
                        </Typography>
                        <Typography variant="h4" color="orange" className="font-bold">
                            {members.filter(m => m.status === 'SUSPENDED').length}
                        </Typography>
                    </CardBody>
                </Card>
            </div>

            <Card className="shadow-xl">
                <CardBody>
                    {/* Barre de recherche */}
                    <div className="mb-6">
                        <Input
                            label="Rechercher un membre..."
                            icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="!border-gray-300 focus:!border-blue-500"
                        />
                    </div>

                    {/* Tableau */}
                    {filteredMembers.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-max table-auto">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50">
                                        {["Membre", "Coordonnées", "Statut", "Date Adhésion", "Actions"].map((el) => (
                                            <th key={el} className="p-4 text-left">
                                                <Typography 
                                                    variant="small" 
                                                    className="font-bold uppercase text-gray-700"
                                                >
                                                    {el}
                                                </Typography>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMembers.map((member, key) => {
                                        const isLast = key === filteredMembers.length - 1;
                                        const className = `p-4 ${isLast ? "" : "border-b border-gray-100"}`;

                                        return (
                                            <tr 
                                                key={member.id}
                                                className="hover:bg-blue-50 transition-colors cursor-pointer"
                                                onClick={() => navigate(`/admin/members/${member.id}`)}
                                            >
                                                <td className={className}>
                                                    <div className="flex items-center gap-4">
                                                        <Avatar
                                                            src={member.photo || "/img/default-avatar.png"}
                                                            alt={`${member.first_name} ${member.last_name}`}
                                                            size="md"
                                                            variant="rounded"
                                                            className="ring-2 ring-blue-100"
                                                        />
                                                        <div>
                                                            <Typography 
                                                                variant="small" 
                                                                className="font-bold text-gray-900"
                                                            >
                                                                {member.first_name} {member.last_name}
                                                            </Typography>
                                                            <Typography 
                                                                variant="small" 
                                                                className="text-gray-600 font-mono"
                                                            >
                                                                {member.member_id}
                                                            </Typography>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className={className}>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                                                            <Typography 
                                                                variant="small" 
                                                                className="text-gray-700"
                                                            >
                                                                {member.email}
                                                            </Typography>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <PhoneIcon className="h-4 w-4 text-gray-400" />
                                                            <Typography 
                                                                variant="small" 
                                                                className="text-gray-700"
                                                            >
                                                                {member.phone}
                                                            </Typography>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className={className}>
                                                    {getStatusChip(member.status)}
                                                </td>
                                                <td className={className}>
                                                    <Typography 
                                                        variant="small" 
                                                        className="text-gray-600"
                                                    >
                                                        {new Date(member.join_date).toLocaleDateString('fr-FR')}
                                                    </Typography>
                                                </td>
                                                <td className={className}>
                                                    <div className="flex items-center gap-2">
                                                        <Tooltip content="Voir détails">
                                                            <IconButton
                                                                variant="text"
                                                                color="blue"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`/admin/members/${member.id}`);
                                                                }}
                                                            >
                                                                <EyeIcon className="h-4 w-4" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip content="Modifier">
                                                            <IconButton
                                                                variant="text"
                                                                color="green"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`/admin/members/${member.id}/edit`);
                                                                }}
                                                            >
                                                                <PencilIcon className="h-4 w-4" />
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
                            <Typography color="gray" className="text-lg">
                                {searchTerm ? '🔍 Aucun membre trouvé pour cette recherche.' : '📋 Aucun membre enregistré.'}
                            </Typography>
                            {!searchTerm && (
                                <Button
                                    className="mt-4"
                                    color="blue"
                                    onClick={() => navigate('/admin/members/create')}
                                >
                                    Créer le premier membre
                                </Button>
                            )}
                        </div>
                    )}
                </CardBody>
            </Card>
        </PageContainer>
    );
}

export default MemberList;