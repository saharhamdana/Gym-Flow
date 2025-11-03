// Fichier: frontend/src/pages/admin/bookings/course-types/CourseTypeCreate.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardBody,
    Typography,
    Input,
    Textarea,
    Button,
    Switch,
    Alert,
} from '@material-tailwind/react';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import PageContainer from '@/components/admin/PageContainer';
import { courseTypeService } from '@/services/bookingService';

const CourseTypeCreate = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: '#3B82F6',
        duration_minutes: 60,
        is_active: true,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await courseTypeService.create({
                ...formData,
                duration_minutes: parseInt(formData.duration_minutes),
            });

            setSuccess(true);
            setTimeout(() => {
                navigate('/admin/bookings/course-types');
            }, 1500);
        } catch (err) {
            console.error('Erreur:', err);
            setError(err.response?.data?.detail || 'Erreur lors de la création');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageContainer>
            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="text"
                    className="flex items-center gap-2"
                    onClick={() => navigate('/admin/bookings/course-types')}
                >
                    <ArrowLeftIcon className="h-4 w-4" /> Retour
                </Button>
                <Typography variant="h4" color="blue-gray">
                    Créer un Type de Cours
                </Typography>
            </div>

            {error && <Alert color="red" className="mb-4">{error}</Alert>}
            {success && <Alert color="green" className="mb-4">Type créé avec succès !</Alert>}

            <Card className="shadow-lg">
                <CardBody>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Nom du Type *"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />

                            <Input
                                label="Durée par défaut (minutes) *"
                                name="duration_minutes"
                                type="number"
                                min="15"
                                step="15"
                                value={formData.duration_minutes}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Typography variant="small" className="mb-2 font-medium">
                                    Couleur *
                                </Typography>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        name="color"
                                        value={formData.color}
                                        onChange={handleChange}
                                        className="h-10 w-20 rounded cursor-pointer border border-gray-300"
                                    />
                                    <Input
                                        value={formData.color}
                                        onChange={handleChange}
                                        name="color"
                                        placeholder="#3B82F6"
                                    />
                                </div>
                            </div>
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
                                label="Type Actif"
                            />
                        </div>

                        <div className="flex gap-4">
                            <Button
                                type="submit"
                                color="blue"
                                disabled={loading}
                                className="flex-1"
                            >
                                {loading ? 'Création...' : 'Créer le Type'}
                            </Button>
                            <Button
                                type="button"
                                variant="outlined"
                                onClick={() => navigate('/admin/bookings/course-types')}
                                disabled={loading}
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

export default CourseTypeCreate;