// Fichier: frontend/src/pages/admin/bookings/bookings/BookingDetail.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    CardBody,
    Typography,
    Button,
    Chip,
    Alert,
    Spinner,
    Avatar,
} from '@material-tailwind/react';
import { 
    ArrowLeftIcon,
    CheckIcon,
    XMarkIcon,
    ClockIcon,
    MapPinIcon,
    UserIcon,
} from '@heroicons/react/24/solid';
import PageContainer from '@/components/admin/PageContainer';
import CancelBookingModal from '@/components/bookings/CancelBookingModal';
import CheckInModal from '@/components/bookings/CheckInModal';
import { bookingService } from '@/services/bookingService';

const BookingDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cancelModal, setCancelModal] = useState(false);
    const [checkInModal, setCheckInModal] = useState(false);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchBooking();
    }, [id]);

    const fetchBooking = async () => {
        try {
            const data = await bookingService.getById(id);
            setBooking(data);
            setError(null);
        } catch (err) {
            console.error('Erreur:', err);
            setError('Impossible de charger la réservation');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        setProcessing(true);
        try {
            await bookingService.cancel(id);
            fetchBooking();
            setCancelModal(false);
        } catch (err) {
            console.error('Erreur:', err);
            alert('Erreur lors de l\'annulation');
        } finally {
            setProcessing(false);
        }
    };

    const handleCheckIn = async () => {
        setProcessing(true);
        try {
            await bookingService.checkIn(id);
            fetchBooking();
            setCheckInModal(false);
        } catch (err) {
            console.error('Erreur:', err);
            alert('Erreur lors du check-in');
        } finally {
            setProcessing(false);
        }
    };

    const getStatusChip = (status) => {
        const config = {
            'PENDING': { color: 'orange', text: 'En attente' },
            'CONFIRMED': { color: 'green', text: 'Confirmé' },
            'CANCELLED': { color: 'red', text: 'Annulé' },
            'COMPLETED': { color: 'blue', text: 'Complété' },
            'NO_SHOW': { color: 'gray', text: 'Absent' },
        };
        
        const statusConfig = config[status] || { color: 'gray', text: status };
        return <Chip value={statusConfig.text} color={statusConfig.color} />;
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

    if (error) {
        return (
            <PageContainer>
                <Alert color="red">{error}</Alert>
                <Button className="mt-4" onClick={() => navigate('/admin/bookings')}>
                    Retour
                </Button>
            </PageContainer>
        );
    }

    if (!booking) {
        return (
            <PageContainer>
                <Alert color="orange">Réservation non trouvée.</Alert>
            </PageContainer>
        );
    }

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('fr-FR');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <PageContainer>
            {/* En-tête */}
            <div className="flex items-center justify-between mb-6">
                <Button
                    variant="text"
                    className="flex items-center gap-2"
                    onClick={() => navigate('/admin/bookings')}
                >
                    <ArrowLeftIcon className="h-4 w-4" /> Retour
                </Button>

                <div className="flex gap-2">
                    {booking.status === 'CONFIRMED' && !booking.checked_in && (
                        <Button
                            color="green"
                            className="flex items-center gap-2"
                            onClick={() => setCheckInModal(true)}
                        >
                            <CheckIcon className="h-4 w-4" />
                            Check-in
                        </Button>
                    )}
                    {booking.status === 'CONFIRMED' && (
                        <Button
                            color="red"
                            variant="outlined"
                            className="flex items-center gap-2"
                            onClick={() => setCancelModal(true)}
                        >
                            <XMarkIcon className="h-4 w-4" />
                            Annuler
                        </Button>
                    )}
                </div>
            </div>

            {/* Informations de la Réservation */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Carte Principale */}
                <Card className="lg:col-span-2">
                    <CardBody>
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <Typography variant="h4" color="blue-gray" className="mb-2">
                                    Réservation #{booking.id}
                                </Typography>
                                <Typography variant="small" className="text-gray-600">
                                    Réservée le {formatDateTime(booking.booking_date)}
                                </Typography>
                            </div>
                            {getStatusChip(booking.status)}
                        </div>

                        {/* Informations du Membre */}
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-3 mb-3">
                                <UserIcon className="h-5 w-5 text-blue-600" />
                                <Typography variant="h6" color="blue-gray">
                                    Membre
                                </Typography>
                            </div>
                            {booking.member_details && (
                                <div className="flex items-center gap-4">
                                    <Avatar
                                        src={booking.member_details.photo || '/img/default-avatar.png'}
                                        alt={booking.member_details.full_name}
                                        size="lg"
                                    />
                                    <div>
                                        <Typography variant="h6" color="blue-gray">
                                            {booking.member_details.full_name}
                                        </Typography>
                                        <Typography variant="small" className="text-gray-600">
                                            ID: {booking.member_details.member_id}
                                        </Typography>
                                        <Typography variant="small" className="text-gray-600">
                                            Email: {booking.member_details.email}
                                        </Typography>
                                        <Typography variant="small" className="text-gray-600">
                                            Tél: {booking.member_details.phone}
                                        </Typography>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Informations du Cours */}
                        <div className="p-4 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-3 mb-3">
                                <ClockIcon className="h-5 w-5 text-green-600" />
                                <Typography variant="h6" color="blue-gray">
                                    Cours
                                </Typography>
                            </div>
                            {booking.course_details && (
                                <div className="space-y-2">
                                    <div>
                                        <Typography variant="h6" color="blue-gray">
                                            {booking.course_details.title}
                                        </Typography>
                                        <Typography variant="small" className="text-gray-600">
                                            {booking.course_details.course_type_name}
                                        </Typography>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <Typography variant="small" className="font-semibold text-gray-700">
                                                Date
                                            </Typography>
                                            <Typography variant="small" className="text-gray-600">
                                                {formatDate(booking.course_details.date)}
                                            </Typography>
                                        </div>
                                        <div>
                                            <Typography variant="small" className="font-semibold text-gray-700">
                                                Horaire
                                            </Typography>
                                            <Typography variant="small" className="text-gray-600">
                                                {booking.course_details.start_time} - {booking.course_details.end_time}
                                            </Typography>
                                        </div>
                                        <div>
                                            <Typography variant="small" className="font-semibold text-gray-700">
                                                Coach
                                            </Typography>
                                            <Typography variant="small" className="text-gray-600">
                                                {booking.course_details.coach_name}
                                            </Typography>
                                        </div>
                                        <div>
                                            <Typography variant="small" className="font-semibold text-gray-700">
                                                Salle
                                            </Typography>
                                            <Typography variant="small" className="text-gray-600">
                                                {booking.course_details.room_name}
                                            </Typography>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <Button
                                            size="sm"
                                            variant="outlined"
                                            onClick={() => navigate(`/admin/courses/${booking.course}`)}
                                        >
                                            Voir le cours complet
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Notes */}
                        {booking.notes && (
                            <div className="mt-6">
                                <Typography variant="h6" color="blue-gray" className="mb-2">
                                    Notes
                                </Typography>
                                <Typography variant="small" className="text-gray-700 italic">
                                    {booking.notes}
                                </Typography>
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Carte Statut */}
                <Card>
                    <CardBody>
                        <Typography variant="h6" color="blue-gray" className="mb-4">
                            Informations
                        </Typography>

                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <Typography variant="small" className="text-gray-600 mb-1">
                                    Statut
                                </Typography>
                                {getStatusChip(booking.status)}
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg">
                                <Typography variant="small" className="text-gray-600 mb-1">
                                    Check-in
                                </Typography>
                                {booking.checked_in ? (
                                    <>
                                        <Chip value="Présent" color="green" className="mb-2" />
                                        {booking.check_in_time && (
                                            <Typography variant="small" className="text-gray-700">
                                                à {new Date(booking.check_in_time).toLocaleTimeString('fr-FR')}
                                            </Typography>
                                        )}
                                    </>
                                ) : (
                                    <Chip value="Non présent" color="gray" />
                                )}
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg">
                                <Typography variant="small" className="text-gray-600 mb-1">
                                    Date de réservation
                                </Typography>
                                <Typography variant="small" className="font-medium">
                                    {formatDateTime(booking.booking_date)}
                                </Typography>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg">
                                <Typography variant="small" className="text-gray-600 mb-1">
                                    Dernière modification
                                </Typography>
                                <Typography variant="small" className="font-medium">
                                    {formatDateTime(booking.updated_at)}
                                </Typography>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Modals */}
            <CancelBookingModal
                open={cancelModal}
                onClose={() => setCancelModal(false)}
                onConfirm={handleCancel}
                bookingInfo={booking}
                loading={processing}
            />

            <CheckInModal
                open={checkInModal}
                onClose={() => setCheckInModal(false)}
                onConfirm={handleCheckIn}
                bookingInfo={booking}
                loading={processing}
            />
        </PageContainer>
    );
};

export default BookingDetail;