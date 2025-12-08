// Fichier: frontend/src/pages/admin/BookingEdit.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    CardBody,
    Typography,
    Input,
    Button,
    Select,
    Option,
    Alert,
    Spinner,
} from "@material-tailwind/react";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import api from "@/api/axiosInstance";

const BookingEdit = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    
    const [members, setMembers] = useState([]);
    const [courses, setCourses] = useState([]);

    const [formData, setFormData] = useState({
        member: '',
        course: '',
        booking_date: '',
        status: 'CONFIRMED',
        notes: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bookingRes, membersRes, coursesRes] = await Promise.all([
                    api.get(`bookings/${bookingId}/`),
                    api.get('members/'),
                    api.get('courses/')
                ]);
                
                const booking = bookingRes.data;
                setFormData({
                    member: booking.member?.toString() || '',
                    course: booking.course?.toString() || '',
                    booking_date: booking.booking_date ? booking.booking_date.slice(0, 16) : '',
                    status: booking.status || 'CONFIRMED',
                    notes: booking.notes || ''
                });
                
                setMembers(Array.isArray(membersRes.data) ? membersRes.data : membersRes.data.results || []);
                setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : coursesRes.data.results || []);
            } catch (err) {
                console.error("Erreur:", err);
                setError("Impossible de charger les données");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [bookingId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            await api.patch(`bookings/${bookingId}/`, {
                member: parseInt(formData.member),
                course: parseInt(formData.course),
                booking_date: formData.booking_date,
                status: formData.status,
                notes: formData.notes
            });
            
            setSuccess(true);
            setTimeout(() => {
                navigate(`/admin/bookings/${bookingId}`);
            }, 1500);
        } catch (err) {
            console.error("Erreur:", err);
            
            if (err.response?.data) {
                const errors = err.response.data;
                let errorMessage = "Erreur de validation:\n";
                
                Object.keys(errors).forEach(key => {
                    const errorValue = Array.isArray(errors[key]) ? errors[key][0] : errors[key];
                    errorMessage += `• ${key}: ${errorValue}\n`;
                });
                
                setError(errorMessage);
            } else {
                setError("Erreur lors de la modification");
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spinner color="blue" className="h-12 w-12" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-10 min-h-screen bg-gray-50">
            <div className="flex items-center justify-between mb-6">
                <Button
                    variant="text"
                    className="flex items-center gap-2"
                    onClick={() => navigate(`/admin/bookings/${bookingId}`)}
                >
                    <ArrowLeftIcon className="h-4 w-4" /> Retour
                </Button>
            </div>

            <Typography variant="h4" color="blue-gray" className="mb-6">
                Modifier la Réservation
            </Typography>

            {error && (
                <Alert color="red" className="mb-4 whitespace-pre-line">
                    {error}
                </Alert>
            )}

            {success && (
                <Alert color="green" className="mb-4">
                    Réservation modifiée avec succès ! Redirection...
                </Alert>
            )}

            <Card>
                <CardBody>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <Select
                                    label="Membre *"
                                    value={formData.member}
                                    onChange={(value) => handleSelectChange('member', value)}
                                    required
                                >
                                    {members.map((member) => (
                                        <Option key={member.id} value={member.id.toString()}>
                                            {member.first_name} {member.last_name}
                                        </Option>
                                    ))}
                                </Select>
                            </div>

                            <div className="md:col-span-2">
                                <Select
                                    label="Cours *"
                                    value={formData.course}
                                    onChange={(value) => handleSelectChange('course', value)}
                                    required
                                >
                                    {courses.map((course) => (
                                        <Option key={course.id} value={course.id.toString()}>
                                            {course.name}
                                        </Option>
                                    ))}
                                </Select>
                            </div>

                            <Input
                                label="Date de Réservation *"
                                type="datetime-local"
                                name="booking_date"
                                value={formData.booking_date}
                                onChange={handleChange}
                                required
                            />

                            <Select
                                label="Statut *"
                                value={formData.status}
                                onChange={(value) => handleSelectChange('status', value)}
                            >
                                <Option value="CONFIRMED">Confirmée</Option>
                                <Option value="PENDING">En Attente</Option>
                                <Option value="CANCELLED">Annulée</Option>
                                <Option value="COMPLETED">Complétée</Option>
                            </Select>

                            <div className="md:col-span-2">
                                <Input
                                    label="Notes"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-6">
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
                                onClick={() => navigate(`/admin/bookings/${bookingId}`)}
                                disabled={submitting}
                            >
                                Annuler
                            </Button>
                        </div>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
};

export default BookingEdit;