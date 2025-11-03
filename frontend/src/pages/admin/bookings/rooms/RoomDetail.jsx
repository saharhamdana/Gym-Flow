// Fichier: frontend/src/pages/admin/bookings/rooms/RoomDetail.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Card, 
    CardBody, 
    Typography, 
    Spinner, 
    Button, 
    Alert,
    Chip,
} from "@material-tailwind/react";
import { ArrowLeftIcon, PencilIcon, TrashIcon, HomeModernIcon } from "@heroicons/react/24/solid";
import api from "@/api/axiosInstance";

const RoomDetail = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRoomDetail();
    }, [roomId]);

    const fetchRoomDetail = async () => {
        try {
            const response = await api.get(`rooms/${roomId}/`);
            setRoom(response.data);
            setError(null);
        } catch (err) {
            console.error("Erreur:", err);
            setError("Impossible de charger les détails de la salle.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Voulez-vous vraiment supprimer cette salle ?")) return;
        
        try {
            await api.delete(`rooms/${roomId}/`);
            navigate('/admin/rooms', { 
                state: { message: 'Salle supprimée avec succès' } 
            });
        } catch (err) {
            console.error("Erreur:", err);
            setError("Erreur lors de la suppression");
        }
    };

    const toggleStatus = async () => {
        try {
            await api.patch(`rooms/${roomId}/`, { 
                is_active: !room.is_active 
            });
            fetchRoomDetail();
        } catch (err) {
            console.error("Erreur:", err);
            alert("Impossible de modifier le statut");
        }
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
                <Button className="mt-4" onClick={() => navigate('/admin/rooms')}>
                    Retour à la liste
                </Button>
            </div>
        );
    }

    if (!room) {
        return <Alert color="orange" className="p-4">Salle non trouvée.</Alert>;
    }

    return (
        <div className="p-4 md:p-10 min-h-screen bg-gray-50">
            {/* En-tête */}
            <div className="flex items-center justify-between mb-6">
                <Button 
                    variant="text" 
                    className="flex items-center gap-2"
                    onClick={() => navigate('/admin/rooms')}
                >
                    <ArrowLeftIcon className="h-4 w-4" /> Retour
                </Button>

                <div className="flex gap-2">
                    <Button
                        color="blue"
                        className="flex items-center gap-2"
                        onClick={() => navigate(`/admin/rooms/${roomId}/edit`)}
                    >
                        <PencilIcon className="h-4 w-4" /> Modifier
                    </Button>
                    <Button
                        color="red"
                        className="flex items-center gap-2"
                        onClick={handleDelete}
                    >
                        <TrashIcon className="h-4 w-4" /> Supprimer
                    </Button>
                </div>
            </div>

            {/* Carte Principale */}
            <Card>
                <CardBody>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <HomeModernIcon className="h-8 w-8 text-blue-500" />
                            <div>
                                <Typography variant="h4" color="blue-gray">
                                    {room.name}
                                </Typography>
                                <Typography variant="small" className="text-gray-600">
                                    {room.location || 'Emplacement non spécifié'}
                                </Typography>
                            </div>
                        </div>
                        <Chip 
                            value={room.is_active ? "Active" : "Inactive"} 
                            color={room.is_active ? "green" : "gray"} 
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Typography variant="small" className="font-semibold text-gray-700">
                                Capacité:
                            </Typography>
                            <Typography variant="h6" color="blue-gray">
                                {room.capacity} personnes
                            </Typography>
                        </div>

                        {room.equipment && room.equipment.length > 0 && (
                            <div className="md:col-span-2">
                                <Typography variant="small" className="font-semibold text-gray-700 mb-2">
                                    Équipements:
                                </Typography>
                                <div className="flex flex-wrap gap-2">
                                    {room.equipment.map((item, index) => (
                                        <Chip key={index} value={item} size="sm" color="blue" />
                                    ))}
                                </div>
                            </div>
                        )}

                        {room.description && (
                            <div className="md:col-span-2">
                                <Typography variant="small" className="font-semibold text-gray-700 mb-2">
                                    Description:
                                </Typography>
                                <Typography variant="small" className="text-gray-600">
                                    {room.description}
                                </Typography>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <Button
                            color={room.is_active ? "red" : "green"}
                            variant="outlined"
                            onClick={toggleStatus}
                        >
                            {room.is_active ? "Désactiver" : "Activer"} la salle
                        </Button>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default RoomDetail;