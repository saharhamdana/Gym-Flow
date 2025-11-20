import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Button,
    Chip,
    Avatar,
    Input,
    Spinner,
    Alert,
} from "@material-tailwind/react";
import { MagnifyingGlassIcon, UserPlusIcon } from "@heroicons/react/24/solid";
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

    // useEffect(() => {
    //     const fetchMembers = async () => {
    //         try {
    //             // ✅ Log pour debug
    //             console.log("🌐 Hostname:", window.location.hostname);
    //             console.log("🌐 Subdomain détecté:", window.location.hostname.split('.')[0]);

    //             const response = await api.get("members/");
    //             console.log("📊 Headers envoyés:", response.config.headers);
    //             console.log("📊 Réponse brute:", response);
    //             console.log("📊 Membres reçus:", response.data);

    //             const memberData = Array.isArray(response.data)
    //                 ? response.data
    //                 : (response.data.results || []);

    //             console.log("📊 Membres traités:", memberData);
    //             setMembers(memberData);
    //             setError(null);
    //         } catch (err) {
    //             console.error("❌ Erreur:", err);
    //             setError(err.response?.data?.detail || "Échec de la récupération.");
    //         } finally {
    //             setLoading(false);
    //         }
    //     };
    //     fetchMembers();
    // }, []);

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
        return <Chip value={config.text} color={config.color} className="text-xs font-bold" />;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spinner color="blue" className="h-12 w-12" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4">
                <Alert color="red">{error}</Alert>
                <Button className="mt-4" onClick={() => window.location.reload()}>
                    Réessayer
                </Button>
            </div>
        );
    }

    return (
        <div className="mt-12 mb-8 flex flex-col gap-12">
            {/* CARTE PRINCIPALE AVEC HEADER CORRIGÉ */}
            <Card>
                {/* EN-TÊTE AVEC BOUTON CRÉER */}
                <CardHeader
                    floated={false}
                    shadow={false}
                    className="rounded-none bg-gradient-to-r from-blue-500 to-blue-600 p-4 md:p-6"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <Typography variant="h6" color="white" className="font-bold">
                            Liste des Membres ({members.length})
                        </Typography>

                        {/* BOUTON CRÉER MEMBRE – MAINTENANT CLIQUABLE */}
                        <Link to="/admin/members/create">
                            <Button
                                className="flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 shadow-md"
                                size="sm"
                            >
                                <UserPlusIcon className="h-4 w-4" />
                                Créer Membre
                            </Button>
                        </Link>
                    </div>
                </CardHeader>

                {/* CORPS DE LA CARTE */}
                <CardBody className="px-0 pt-0 pb-2">
                    {/* Barre de recherche */}
                    <div className="w-full md:w-72 p-4">
                        <Input
                            label="Rechercher un membre..."
                            icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Tableau */}
                    {filteredMembers.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[640px] table-auto">
                                <thead>
                                    <tr>
                                        {["ID Membre", "Nom Complet", "Email", "Téléphone", "Statut", "Date Adhésion", "Actions"].map((el) => (
                                            <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                                                <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                                                    {el}
                                                </Typography>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMembers.map((member, key) => {
                                        const className = `py-3 px-5 ${key === filteredMembers.length - 1 ? "" : "border-b border-blue-gray-50"}`;

                                        return (
                                            <tr key={member.id}>
                                                <td className={className}>
                                                    <Typography variant="small" className="text-xs font-bold text-blue-600">
                                                        {member.member_id}
                                                    </Typography>
                                                </td>
                                                <td className={className}>
                                                    <div className="flex items-center gap-4">
                                                        <Avatar
                                                            src={member.photo || "/img/default-avatar.png"}
                                                            alt={`${member.first_name} ${member.last_name}`}
                                                            size="sm"
                                                            variant="rounded"
                                                        />
                                                        <Typography variant="small" color="blue-gray" className="font-semibold">
                                                            {member.first_name} {member.last_name}
                                                        </Typography>
                                                    </div>
                                                </td>
                                                <td className={className}>
                                                    <Typography variant="small" className="text-xs font-medium text-blue-gray-600">
                                                        {member.email}
                                                    </Typography>
                                                </td>
                                                <td className={className}>
                                                    <Typography variant="small" className="text-xs font-medium text-blue-gray-600">
                                                        {member.phone}
                                                    </Typography>
                                                </td>
                                                <td className={className}>
                                                    {getStatusChip(member.status)}
                                                </td>
                                                <td className={className}>
                                                    <Typography variant="small" className="text-xs font-medium text-blue-gray-600">
                                                        {new Date(member.join_date).toLocaleDateString('fr-FR')}
                                                    </Typography>
                                                </td>
                                                <td className={className}>
                                                    <Button
                                                        variant="text"
                                                        color="blue-gray"
                                                        className="font-medium text-xs"
                                                        onClick={() => navigate(`/admin/members/${member.id}`)}
                                                    >
                                                        Voir Détails
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <Typography color="gray">
                                {searchTerm ? "Aucun membre trouvé pour cette recherche." : "Aucun membre enregistré."}
                            </Typography>
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    );
}

export default MemberList;