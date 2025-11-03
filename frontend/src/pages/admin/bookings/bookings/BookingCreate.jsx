// Fichier: frontend/src/pages/admin/bookings/bookings/BookingCreate.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Card,
    CardBody,
    Typography,
    Button,
    Select,
    Option,
    Textarea,
    Alert,
    Spinner,
} from '@material-tailwind/react';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import PageContainer from '@/components/admin/PageContainer';
import { bookingService, courseService } from '@/services/bookingService';
import api from '@/api/axiosInstance';

const BookingCreate = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const courseIdFromUrl = searchParams.get('course');

    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [courses, setCourses] = useState([]);
    const [members, setMembers] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);

    const [formData, setFormData] = useState({
        course: courseIdFromUrl || '',
        member: '',
        notes: '',
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [coursesData, membersData] = await Promise.all([
                courseService.getUpcoming(),
                api.get('/members/'),
            ]);

            setCourses(Array.isArray(coursesData) ? coursesData : []);
            setMembers(Array.isArray(membersData.data) ? membersData.data : membersData.data.results || []);

            if (courseIdFromUrl) {
                const course = coursesData.find(c => c.id === parseInt(courseIdFromUrl));
                setSelectedCourse(course);
            }
        } catch (err) {
            console.error('Erreur:', err);
            setError('Impossible de charger les données');
        } finally {
            setDataLoading(false);
        }
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'course') {
            const course = courses.find(c => c.id === parseInt(value));
            setSelectedCourse(course);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const dataToSend = {
                course: parseInt(formData.course),
                member: parseInt(formData.member),
                notes: formData.notes,
            };

            const response = await bookingService.create(dataToSend);
            
            setSuccess(true);
            setTimeout(() => {
                navigate(`/admin/bookings/bookings/${response.id}`);
            }, 1500);
        } catch (err) {
            console.error('Erreur:', err);
            
            if (err.response?.data) {
                const errors = err.response.data;
                let errorMessage = '';
                
                if (typeof errors === 'string') {
                    errorMessage = errors;
                } else {
                    Object.keys(errors).forEach(key => {
                        const errorValue = Array.isArray(errors[key]) ? errors[key][0] : errors[key];
                        errorMessage += `${errorValue}\n`;
                    });
                }
                setError(errorMessage);
            } else {
                setError('Erreur lors de la création de la réservation');
            }
        } finally {
            setLoading(false);
        }
    };

    if (dataLoading) {
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
                    onClick={() => navigate('/admin/bookings/bookings')}
                >
                    <ArrowLeftIcon className="h-4 w-4" /> Retour
                </Button>
                <Typography variant="h4" color="blue-gray">
                    Créer une Réservation
                </Typography>
            </div>

            {error && <Alert color="red" className="mb-4 whitespace-pre-line">{error}</Alert>}
            {success && <Alert color="green" className="mb-4">Réservation créée avec succès !</Alert>}

            <Card className="shadow-lg">
                <CardBody>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Select
                                label="Cours *"
                                value={formData.course}
                                onChange={(value) => handleSelectChange('course', value)}
                                required
                            >
                                <Option value="">Sélectionner un cours</Option>
                                {courses.map(course => (
                                    <Option 
                                        key={course.id} 
                                        value={course.id.toString()}
                                        disabled={course.is_full}
                                    >
                                        {course.title} - {new Date(course.date).toLocaleDateString('fr-FR')} {course.start_time}
                                        {course.is_full && ' (Complet)'}
                                    </Option>
                                ))}
                            </Select>

                            <Select
                                label="Membre *"
                                value={formData.member}
                                onChange={(value) => handleSelectChange('member', value)}
                                required
                            >
                                <Option value="">Sélectionner un membre</Option>
                                {members.map(member => (
                                    <Option key={member.id} value={member.id.toString()}>
                                        {member.first_name} {member.last_name} - {member.member_id}
                                    </Option>
                                ))}
                            </Select>
                        </div>

                        {selectedCourse && (
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <Typography variant="h6" color="blue-gray" className="mb-2">
                                    Informations du Cours
                                </Typography>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="font-semibold">Type:</span> {selectedCourse.course_type_name}
                                    </div>
                                    <div>
                                        <span className="font-semibold">Coach:</span> {selectedCourse.coach_name}
                                    </div>
                                    <div>
                                        <span className="font-semibold">Salle:</span> {selectedCourse.room_name}
                                    </div>
                                    <div>
                                        <span className="font-semibold">Places disponibles:</span> {selectedCourse.available_spots} / {selectedCourse.max_participants}
                                    </div>
                                </div>
                            </div>
                        )}

                        <Textarea
                            label="Notes (optionnel)"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={3}
                        />

                        <div className="flex gap-4">
                            <Button
                                type="submit"
                                color="blue"
                                disabled={loading}
                                className="flex-1"
                            >
                                {loading ? 'Création...' : 'Créer la Réservation'}
                            </Button>
                            <Button
                                type="button"
                                variant="outlined"
                                onClick={() => navigate('/admin/bookings/bookings')}
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

export default BookingCreate;