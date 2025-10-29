// Fichier: frontend/src/pages/admin/MemberList.jsx

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
} from "@material-tailwind/react";
import { MagnifyingGlassIcon, UserPlusIcon } from "@heroicons/react/24/solid";
import api from "../../api/axiosInstance";

// ----------------------------------------------------
// 💡 Composant pour la liste des membres (rôles Admin/Coach/Réceptionniste)
// ----------------------------------------------------
export function MemberList() {
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                // 🔑 CORRECTION N°1: Utiliser 'members/profiles/' pour correspondre au routage Django
                // L'URL complète devient : http://127.0.0.1:8000/api/members/profiles/
                const response = await api.get("members/profiles/"); 
                
                // Filtrer uniquement les utilisateurs avec le rôle 'MEMBER'
                const memberData = response.data.filter(user => user.role === 'MEMBER');

                setMembers(memberData);
                setLoading(false);
            } catch (err) {
                console.error("Erreur de récupération des membres:", err);
                // Si l'erreur est un 404 ou 403, cela sera affiché
                setError("Échec de la récupération des données de l'API. (Erreur de connexion ou d'autorisation)");
                setLoading(false);
            }
        };

        fetchMembers();
    }, []);

    const filteredMembers = members.filter(member =>
        member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusChip = (status) => {
        // Logique simplifiée pour les statuts d'abonnement (à connecter à l'API)
        const color = status ? "green" : "red";
        const text = status ? "Actif" : "Inactif";
        return <Chip value={text} color={color} className="text-xs font-bold" />;
    };

    if (loading) {
        return <Typography>Chargement des membres...</Typography>;
    }

    if (error) {
        return <Typography color="red">Erreur: {error}</Typography>;
    }

    return (
        <div className="mt-12 mb-8 flex flex-col gap-12">
            <Card>
                <CardHeader variant="gradient" color="blue" className="mb-8 p-6 flex justify-between items-center">
                    <Typography variant="h6" color="white">
                        Liste des Membres
                    </Typography>
                    
                    {/* 🔑 CORRECTION N°2: Lien du bouton "Créer Membre" pour la navigation */}
                    <Link to="/admin/members/create">
                        <Button className="flex items-center gap-3" color="white">
                            <UserPlusIcon strokeWidth={2} className="h-4 w-4" /> Créer Membre
                        </Button>
                    </Link>
                </CardHeader>

                <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                    <div className="w-full md:w-72 p-4">
                        <Input
                            label="Rechercher un membre..."
                            icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <table className="w-full min-w-[640px] table-auto">
                        <thead>
                            <tr>
                                {["Membre", "Email", "Statut", "Date Adhésion", "Actions"].map((el) => (
                                    <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                                        <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                                            {el}
                                        </Typography>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMembers.map(({ id, profile_picture_url, first_name, last_name, email, created_at, is_active }, key) => {
                                const className = `py-3 px-5 ${key === filteredMembers.length - 1 ? "" : "border-b border-blue-gray-50"}`;

                                return (
                                    <tr key={id}>
                                        <td className={className}>
                                            <div className="flex items-center gap-4">
                                                <Avatar src={profile_picture_url || "/img/profile.png"} alt={`${first_name} ${last_name}`} size="sm" variant="rounded" />
                                                <div>
                                                    <Typography variant="small" color="blue-gray" className="font-semibold">
                                                        {`${first_name} ${last_name}`}
                                                    </Typography>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={className}>
                                            <Typography variant="small" className="text-xs font-medium text-blue-gray-600">
                                                {email}
                                            </Typography>
                                        </td>
                                        <td className={className}>
                                            {getStatusChip(is_active)}
                                        </td>
                                        <td className={className}>
                                            <Typography variant="small" className="text-xs font-medium text-blue-gray-600">
                                                {new Date(created_at).toLocaleDateString()}
                                            </Typography>
                                        </td>
                                        <td className={className}>
                                            <Button 
                                                variant="text" 
                                                color="blue-gray" 
                                                className="font-medium text-xs"
                                                onClick={() => navigate(`/admin/members/${id}`)}
                                            >
                                                Voir
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {filteredMembers.length === 0 && (
                        <div className="p-4 text-center">
                            <Typography color="gray">
                                Aucun membre trouvé.
                            </Typography>
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    );
}

export default MemberList;