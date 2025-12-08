// Fichier: frontend/src/pages/admin/bookings/rooms/RoomList.jsx

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
} from '@material-tailwind/react';
import { MagnifyingGlassIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import PageContainer from '@/components/admin/PageContainer';
import DeleteRoomModal from '@/components/bookings/DeleteRoomModal';
import { roomService } from '@/services/bookingService';

const RoomList = () => {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteModal, setDeleteModal] = useState({ open: false, room: null });
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const data = await roomService.getAll();
            const roomData = Array.isArray(data) ? data : (data.results || []);
            setRooms(roomData);
            setError(null);
        } catch (err) {
            console.error('Erreur:', err);
            setError('Impossible de charger les salles');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await roomService.delete(deleteModal.room.id);
            setRooms(rooms.filter(r => r.id !== deleteModal.room.id));
            setDeleteModal({ open: false, room: null });
        } catch (err) {
            console.error('Erreur:', err);
            alert('Erreur lors de la suppression');
        } finally {
            setDeleting(false);
        }
    };

    const filteredRooms = rooms.filter(room =>
        room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.description?.toLowerCase().includes(searchTerm.toLowerCase())
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

    if (error) {
        return (
            <PageContainer>
                <Alert color="red">{error}</Alert>
            </PageContainer>
        );
    }

    return (
        <PageContainer
            title="Gestion des Salles"
            subtitle={`${rooms.length} salle(s) enregistrée(s)`}
            actions={
                <Button
                    className="flex items-center gap-2"
                    color="blue"
                    onClick={() => navigate('/admin/rooms/create')}
                >
                    <PlusIcon className="h-5 w-5" />
                    Nouvelle Salle
                </Button>
            }
        >
            <Card className="shadow-lg">
                <CardBody>
                    {/* Barre de Recherche */}
                    <div className="mb-6">
                        <Input
                            label="Rechercher une salle..."
                            icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Tableau */}
                    {filteredRooms.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-max table-auto">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        {['Nom', 'Capacité', 'Description', 'Statut', 'Cours actifs', 'Actions'].map((head) => (
                                            <th key={head} className="p-4 text-left">
                                                <Typography variant="small" className="font-bold text-gray-700 uppercase">
                                                    {head}
                                                </Typography>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRooms.map((room, index) => {
                                        const isLast = index === filteredRooms.length - 1;
                                        const classes = isLast ? 'p-4' : 'p-4 border-b border-gray-100';

                                        return (
                                            <tr key={room.id} className="hover:bg-gray-50 transition-colors">
                                                <td className={classes}>
                                                    <Typography variant="small" className="font-bold text-blue-600">
                                                        {room.name}
                                                    </Typography>
                                                </td>
                                                <td className={classes}>
                                                    <Typography variant="small" className="font-semibold">
                                                        {room.capacity} personnes
                                                    </Typography>
                                                </td>
                                                <td className={classes}>
                                                    <Typography variant="small" className="text-gray-700 truncate max-w-xs">
                                                        {room.description || '-'}
                                                    </Typography>
                                                </td>
                                                <td className={classes}>
                                                    <Chip
                                                        value={room.is_active ? 'Active' : 'Inactive'}
                                                        color={room.is_active ? 'green' : 'gray'}
                                                        size="sm"
                                                    />
                                                </td>
                                                <td className={classes}>
                                                    <Typography variant="small">
                                                        {room.courses_count || 0}
                                                    </Typography>
                                                </td>
                                                <td className={classes}>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="text"
                                                            size="sm"
                                                            color="blue"
                                                            onClick={() => navigate(`/admin/rooms/${room.id}/edit`)}
                                                        >
                                                            <PencilIcon className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="text"
                                                            size="sm"
                                                            color="red"
                                                            onClick={() => setDeleteModal({ open: true, room })}
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </Button>
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

            {/* Modal de Suppression */}
            <DeleteRoomModal
                open={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, room: null })}
                onConfirm={handleDelete}
                roomName={deleteModal.room?.name || ''}
                loading={deleting}
            />
        </PageContainer>
    );
};

export default RoomList;