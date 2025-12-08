// Fichier: frontend/src/pages/admin/bookings/bookings/BookingList.jsx

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
    Select,
    Option,
    Avatar,
} from '@material-tailwind/react';
import { 
    MagnifyingGlassIcon, 
    PlusIcon,
    EyeIcon,
    XMarkIcon,
    CheckIcon,
} from '@heroicons/react/24/solid';
import PageContainer from '@/components/admin/PageContainer';
import CancelBookingModal from '@/components/bookings/CancelBookingModal';
import CheckInModal from '@/components/bookings/CheckInModal';
import { bookingService } from '@/services/bookingService';

const BookingList = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [cancelModal, setCancelModal] = useState({ open: false, booking: null });
    const [checkInModal, setCheckInModal] = useState({ open: false, booking: null });
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchBookings();
    }, [statusFilter]);

    const fetchBookings = async () => {
        try {
            const params = statusFilter !== 'all' ? { status: statusFilter } : {};
            const data = await bookingService.getAll(params);
            const bookingData = Array.isArray(data) ? data : (data.results || []);
            setBookings(bookingData);
            setError(null);
        } catch (err) {
            console.error('Erreur:', err);
            setError('Impossible de charger les réservations');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        setProcessing(true);
        try {
            await bookingService.cancel(cancelModal.booking.id);
            fetchBookings();
            setCancelModal({ open: false, booking: null });
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
            await bookingService.checkIn(checkInModal.booking.id);
            fetchBookings();
            setCheckInModal({ open: false, booking: null });
        } catch (err) {
            console.error('Erreur:', err);
            alert('Erreur lors du check-in');
        } finally {
            setProcessing(false);
        }
    };

    const filteredBookings = bookings.filter(booking =>
        booking.member_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.course_title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusChip = (status) => {
        const config = {
            'PENDING': { color: 'orange', text: 'En attente' },
            'CONFIRMED': { color: 'green', text: 'Confirmé' },
            'CANCELLED': { color: 'red', text: 'Annulé' },
            'COMPLETED': { color: 'blue', text: 'Complété' },
            'NO_SHOW': { color: 'gray', text: 'Absent' },
        };
        
        const statusConfig = config[status] || { color: 'gray', text: status };
        return <Chip value={statusConfig.text} color={statusConfig.color} size="sm" />;
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
            </PageContainer>
        );
    }

    return (
        <PageContainer
            title="Gestion des Réservations"
            subtitle={`${bookings.length} réservation(s) enregistrée(s)`}
            actions={
                <Button
                    className="flex items-center gap-2"
                    color="blue"
                    onClick={() => navigate('/admin/bookings/create')}
                >
                    <PlusIcon className="h-5 w-5" />
                    Nouvelle Réservation
                </Button>
            }
        >
            <Card className="shadow-lg">
                <CardBody>
                    {/* Filtres */}
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Rechercher une réservation..."
                            icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Select
                            label="Filtrer par statut"
                            value={statusFilter}
                            onChange={(value) => setStatusFilter(value)}
                        >
                            <Option value="all">Tous les statuts</Option>
                            <Option value="PENDING">En attente</Option>
                            <Option value="CONFIRMED">Confirmé</Option>
                            <Option value="CANCELLED">Annulé</Option>
                            <Option value="COMPLETED">Complété</Option>
                            <Option value="NO_SHOW">Absent</Option>
                        </Select>
                    </div>

                    {/* Tableau */}
                    {filteredBookings.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-max table-auto">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        {['Membre', 'Cours', 'Date du Cours', 'Heure', 'Statut', 'Check-in', 'Actions'].map((head) => (
                                            <th key={head} className="p-4 text-left">
                                                <Typography variant="small" className="font-bold text-gray-700 uppercase">
                                                    {head}
                                                </Typography>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredBookings.map((booking, index) => {
                                        const isLast = index === filteredBookings.length - 1;
                                        const classes = isLast ? 'p-4' : 'p-4 border-b border-gray-100';

                                        return (
                                            <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                                <td className={classes}>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar
                                                            src="/img/default-avatar.png"
                                                            alt={booking.member_name}
                                                            size="sm"
                                                        />
                                                        <Typography variant="small" className="font-semibold">
                                                            {booking.member_name}
                                                        </Typography>
                                                    </div>
                                                </td>
                                                <td className={classes}>
                                                    <Typography variant="small" className="font-medium text-blue-600">
                                                        {booking.course_title}
                                                    </Typography>
                                                </td>
                                                <td className={classes}>
                                                    <Typography variant="small">
                                                        {new Date(booking.course_date).toLocaleDateString('fr-FR')}
                                                    </Typography>
                                                </td>
                                                <td className={classes}>
                                                    <Typography variant="small">
                                                        {booking.course_start_time}
                                                    </Typography>
                                                </td>
                                                <td className={classes}>
                                                    {getStatusChip(booking.status)}
                                                </td>
                                                <td className={classes}>
                                                    {booking.checked_in ? (
                                                        <Chip value="Présent" color="green" size="sm" />
                                                    ) : (
                                                        <Chip value="Non présent" color="gray" size="sm" />
                                                    )}
                                                </td>
                                                <td className={classes}>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            variant="text"
                                                            size="sm"
                                                            color="blue"
                                                            onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                                                        >
                                                            <EyeIcon className="h-4 w-4" />
                                                        </Button>
                                                        {booking.status === 'CONFIRMED' && !booking.checked_in && (
                                                            <Button
                                                                variant="text"
                                                                size="sm"
                                                                color="green"
                                                                onClick={() => setCheckInModal({ open: true, booking })}
                                                            >
                                                                <CheckIcon className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        {booking.status === 'CONFIRMED' && (
                                                            <Button
                                                                variant="text"
                                                                size="sm"
                                                                color="red"
                                                                onClick={() => setCancelModal({ open: true, booking })}
                                                            >
                                                                <XMarkIcon className="h-4 w-4" />
                                                            </Button>
                                                        )}
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
                                {searchTerm ? 'Aucune réservation trouvée.' : 'Aucune réservation enregistrée.'}
                            </Typography>
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Modals */}
            <CancelBookingModal
                open={cancelModal.open}
                onClose={() => setCancelModal({ open: false, booking: null })}
                onConfirm={handleCancel}
                bookingInfo={cancelModal.booking}
                loading={processing}
            />

            <CheckInModal
                open={checkInModal.open}
                onClose={() => setCheckInModal({ open: false, booking: null })}
                onConfirm={handleCheckIn}
                bookingInfo={checkInModal.booking}
                loading={processing}
            />
        </PageContainer>
    );
};

export default BookingList;