// Fichier: frontend/src/pages/admin/bookings/rooms/RoomEdit.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    CardBody,
    Typography,
    Input,
    Textarea,
    Button,
    Switch,
    Alert,
    Spinner,
} from '@material-tailwind/react';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import PageContainer from '@/components/admin/PageContainer';
import { roomService } from '@/services/bookingService';

const RoomEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        capacity: '',
        description: '',
        is_active: true,
    });

    useEffect(() => {
        fetchRoom();
    }, [id]);

    const fetchRoom = async () => {
        try {
            const data = await roomService.getById(id);
            setFormData({
                name: data.name || '',
                capacity: data.capacity || '',
                description: data.description || '',
                is_active: data.is_active,
            });
            setError(null);
        } catch (err) {
            console.error('Erreur:', err);
            setError('Impossible de charger la salle');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            await roomService.update(id, {
                ...formData,
                capacity: parseInt(formData.capacity),
            });

            setSuccess(true);
            setTimeout(() => {
                navigate('/admin/bookings/rooms');
            }, 1500);
        } catch (err) {
            console.error('Erreur:', err);
            setError('Erreur lors de la modification');
        } finally {
            setSubmitting(false);
        }
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

    return (
        <PageContainer>
            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="text"
                    className="flex items-center gap-2"
                    onClick={() => navigate('/admin/bookings/rooms')}
                >
                    <ArrowLeftIcon className="h-4 w-4" /> Retour
                </Button>
                <Typography variant="h4" color="blue-gray">
                    Modifier la Salle
                </Typography>
            </div>

            {error && <Alert color="red" className="mb-4">{error}</Alert>}
            {success && <Alert color="green" className="mb-4">Salle modifiée avec succès !</Alert>}

            <Card className="shadow-lg">
                <CardBody>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Nom de la Salle *"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />

                            <Input
                                label="Capacité *"
                                name="capacity"
                                type="number"
                                min="1"
                                value={formData.capacity}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <Textarea
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                        />

                        <div className="flex items-center gap-3">
                            <Switch
                                checked={formData.is_active}
                                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                                label="Salle Active"
                            />
                        </div>

                        <div className="flex gap-4">
                            <Button
                                type="submit"
                                color="blue"
                                disabled={submitting}
                                className="flex-1"
                            >
                                {submitting ? 'Modification...' : 'Sauvegarder'}
                            </Button>
                            <Button
                                type="button"
                                variant="outlined"
                                onClick={() => navigate('/admin/bookings/rooms')}
                                disabled={submitting}
                            >
                                Annuler
                            </Button>
                        </div>
                    </form>
                </CardBody>
            </Card>
        </PageContainer>
    );
};

export default RoomEdit;