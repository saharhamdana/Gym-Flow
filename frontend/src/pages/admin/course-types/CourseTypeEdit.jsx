// Fichier: frontend/src/pages/admin/course-types/CourseTypeEdit.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    CardBody,
    Typography,
    Input,
    Button,
    Textarea,
    Alert,
    Spinner,
    Switch,
} from '@material-tailwind/react';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import PageContainer from '@/components/admin/PageContainer';
import { courseTypeService } from '@/services/bookingService';

const CourseTypeEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: '#3B82F6',
        duration_minutes: 60,
        is_active: true,
    });

    useEffect(() => {
        if (!id || id === 'undefined') {
            setError('ID du type de cours invalide');
            setLoading(false);
            return;
        }
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const courseTypeData = await courseTypeService.getById(id);
            
            setFormData({
                name: courseTypeData.name || '',
                description: courseTypeData.description || '',
                color: courseTypeData.color || '#3B82F6',
                duration_minutes: courseTypeData.duration_minutes || 60,
                is_active: courseTypeData.is_active !== false,
            });
            
        } catch (err) {
            console.error('Erreur:', err);
            setError('Impossible de charger le type de cours. Vérifiez votre connexion.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSwitchChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        const errors = {};
        
        if (!formData.name.trim()) {
            errors.name = 'Le nom est requis';
        }
        
        if (!formData.duration_minutes || formData.duration_minutes < 1) {
            errors.duration_minutes = 'La durée doit être supérieure à 0';
        }
        
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            setError('Veuillez corriger les erreurs dans le formulaire.');
            return;
        }
        
        setSubmitting(true);
        setError(null);

        try {
            const dataToSend = {
                ...formData,
                duration_minutes: parseInt(formData.duration_minutes),
            };

            await courseTypeService.update(id, dataToSend);
            
            setSuccess(true);
            setTimeout(() => {
                navigate(`/admin/course-types/${id}`);
            }, 1500);
        } catch (err) {
            console.error('Erreur:', err);
            
            if (err.response?.data) {
                const errors = err.response.data;
                if (typeof errors === 'object') {
                    let errorMessage = 'Erreur de validation:\n';
                    Object.keys(errors).forEach(key => {
                        const errorValue = Array.isArray(errors[key]) ? errors[key][0] : errors[key];
                        errorMessage += `• ${key}: ${errorValue}\n`;
                    });
                    setError(errorMessage);
                } else {
                    setError(err.response.data.message || 'Erreur lors de la modification');
                }
            } else {
                setError('Erreur lors de la modification du type de cours. Vérifiez votre connexion.');
            }
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

    if (error && !formData.name) {
        return (
            <PageContainer>
                <Alert color="red" className="mb-4">{error}</Alert>
                <Button 
                    color="blue" 
                    onClick={() => navigate('/admin/course-types')}
                    className="mt-4"
                >
                    Retour à la liste
                </Button>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="text"
                    className="flex items-center gap-2"
                    onClick={() => navigate(`/admin/course-types/${id}`)}
                >
                    <ArrowLeftIcon className="h-4 w-4" /> Retour
                </Button>
                <Typography variant="h4" color="blue-gray">
                    Modifier le Type de Cours
                </Typography>
            </div>

            {error && <Alert color="red" className="mb-4 whitespace-pre-line">{error}</Alert>}
            {success && <Alert color="green" className="mb-4">Type de cours modifié avec succès !</Alert>}

            <Card className="shadow-lg">
                <CardBody>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Nom *"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />

                            <Input
                                label="Durée (minutes) *"
                                name="duration_minutes"
                                type="number"
                                min="1"
                                value={formData.duration_minutes}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Typography variant="small" className="mb-2 block">
                                    Couleur
                                </Typography>
                                <Input
                                    type="color"
                                    name="color"
                                    value={formData.color}
                                    onChange={handleChange}
                                    className="w-full h-10 cursor-pointer"
                                />
                            </div>

                            <div>
                                <Typography variant="small" className="mb-2 block">
                                    Statut
                                </Typography>
                                <Switch
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => handleSwitchChange('is_active', e.target.checked)}
                                    label={formData.is_active ? "Actif" : "Inactif"}
                                />
                            </div>
                        </div>

                        <Textarea
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                        />

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
                                onClick={() => navigate(`/admin/course-types/${id}`)}
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

export default CourseTypeEdit;