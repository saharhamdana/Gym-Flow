// Fichier: frontend/src/pages/admin/bookings/courses/CourseEdit.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    CardBody,
    Typography,
    Input,
    Textarea,
    Button,
    Select,
    Option,
    Alert,
    Spinner,
} from '@material-tailwind/react';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import PageContainer from '@/components/admin/PageContainer';
import { courseService, courseTypeService, roomService } from '@/services/bookingService';
import api from '@/api/axiosInstance';

const CourseEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [courseTypes, setCourseTypes] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [coaches, setCoaches] = useState([]);

    const [formData, setFormData] = useState({
        title: '',
        course_type: '',
        coach: '',
        room: '',
        date: '',
        start_time: '',
        end_time: '',
        max_participants: '',
        description: '',
        notes: '',
        status: 'SCHEDULED',
    });

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [courseData, typesData, roomsData, coachesData] = await Promise.all([
                courseService.getById(id),
                courseTypeService.getAll({ is_active: true }),
                roomService.getAll({ is_active: true }),
                api.get('/auth/users/?role=COACH'),
            ]);

            setCourseTypes(Array.isArray(typesData) ? typesData : typesData.results || []);
            setRooms(Array.isArray(roomsData) ? roomsData : roomsData.results || []);
            setCoaches(Array.isArray(coachesData.data) ? coachesData.data : coachesData.data.results || []);

            setFormData({
                title: courseData.title || '',
                course_type: courseData.course_type?.toString() || '',
                coach: courseData.coach?.toString() || '',
                room: courseData.room?.toString() || '',
                date: courseData.date || '',
                start_time: courseData.start_time || '',
                end_time: courseData.end_time || '',
                max_participants: courseData.max_participants || '',
                description: courseData.description || '',
                notes: courseData.notes || '',
                status: courseData.status || 'SCHEDULED',
            });
        } catch (err) {
            console.error('Erreur:', err);
            setError('Impossible de charger les données');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const dataToSend = {
                ...formData,
                course_type: parseInt(formData.course_type),
                coach: parseInt(formData.coach),
                room: parseInt(formData.room),
                max_participants: parseInt(formData.max_participants),
            };

            await courseService.update(id, dataToSend);
            
            setSuccess(true);
            setTimeout(() => {
                navigate(`/admin/courses/${id}`);
            }, 1500);
        } catch (err) {
            console.error('Erreur:', err);
            
            if (err.response?.data) {
                const errors = err.response.data;
                let errorMessage = 'Erreur de validation:\n';
                Object.keys(errors).forEach(key => {
                    const errorValue = Array.isArray(errors[key]) ? errors[key][0] : errors[key];
                    errorMessage += `• ${key}: ${errorValue}\n`;
                });
                setError(errorMessage);
            } else {
                setError('Erreur lors de la modification');
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

    return (
        <PageContainer>
            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="text"
                    className="flex items-center gap-2"
                    onClick={() => navigate(`/admin/courses/${id}`)}
                >
                    <ArrowLeftIcon className="h-4 w-4" /> Retour
                </Button>
                <Typography variant="h4" color="blue-gray">
                    Modifier le Cours
                </Typography>
            </div>

            {error && <Alert color="red" className="mb-4 whitespace-pre-line">{error}</Alert>}
            {success && <Alert color="green" className="mb-4">Cours modifié avec succès !</Alert>}

            <Card className="shadow-lg">
                <CardBody>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Mêmes champs que CourseCreate */}
                        <div>
                            <Typography variant="h6" color="blue-gray" className="mb-4">
                                Informations du Cours
                            </Typography>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Titre du Cours *"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                />

                                <Select
                                    label="Type de Cours *"
                                    value={formData.course_type}
                                    onChange={(value) => handleSelectChange('course_type', value)}
                                    required
                                >
                                    {courseTypes.map(type => (
                                        <Option key={type.id} value={type.id.toString()}>
                                            {type.name}
                                        </Option>
                                    ))}
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Typography variant="h6" color="blue-gray" className="mb-4">
                                Coach et Salle
                            </Typography>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Select
                                    label="Coach *"
                                    value={formData.coach}
                                    onChange={(value) => handleSelectChange('coach', value)}
                                    required
                                >
                                    {coaches.map(coach => (
                                        <Option key={coach.id} value={coach.id.toString()}>
                                            {coach.first_name} {coach.last_name}
                                        </Option>
                                    ))}
                                </Select>

                                <Select
                                    label="Salle *"
                                    value={formData.room}
                                    onChange={(value) => handleSelectChange('room', value)}
                                    required
                                >
                                    {rooms.map(room => (
                                        <Option key={room.id} value={room.id.toString()}>
                                            {room.name} (Cap: {room.capacity})
                                        </Option>
                                    ))}
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Typography variant="h6" color="blue-gray" className="mb-4">
                                Date et Horaires
                            </Typography>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Input
                                    label="Date *"
                                    name="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    required
                                />

                                <Input
                                    label="Heure de Début *"
                                    name="start_time"
                                    type="time"
                                    value={formData.start_time}
                                    onChange={handleChange}
                                    required
                                />

                                <Input
                                    label="Heure de Fin *"
                                    name="end_time"
                                    type="time"
                                    value={formData.end_time}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Typography variant="h6" color="blue-gray" className="mb-4">
                                Capacité
                            </Typography>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Nombre Maximum de Participants *"
                                    name="max_participants"
                                    type="number"
                                    min="1"
                                    value={formData.max_participants}
                                    onChange={handleChange}
                                    required
                                />

                                <Select
                                    label="Statut *"
                                    value={formData.status}
                                    onChange={(value) => handleSelectChange('status', value)}
                                    required
                                >
                                    <Option value="SCHEDULED">Planifié</Option>
                                    <Option value="ONGOING">En cours</Option>
                                    <Option value="COMPLETED">Terminé</Option>
                                    <Option value="CANCELLED">Annulé</Option>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Textarea
                                label="Description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                            />

                            <Textarea
                                label="Notes (internes)"
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows={2}
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
                                onClick={() => navigate(`/admin/courses/${id}`)}
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

export default CourseEdit;