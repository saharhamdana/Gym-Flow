// Fichier: frontend/src/pages/admin/bookings/courses/CourseDetail.jsx

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
    PencilIcon, 
    TrashIcon,
    UsersIcon,
    ClockIcon,
    MapPinIcon,
} from '@heroicons/react/24/solid';
import PageContainer from '@/components/admin/PageContainer';
import DeleteCourseModal from '@/components/bookings/DeleteCourseModal';
import { courseService } from '@/services/bookingService';

const CourseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchCourseData();
    }, [id]);

    const fetchCourseData = async () => {
        try {
            const [courseData, bookingsData] = await Promise.all([
                courseService.getById(id),
                courseService.getBookings(id),
            ]);

            setCourse(courseData);
            setBookings(Array.isArray(bookingsData) ? bookingsData : []);
            setError(null);
        } catch (err) {
            console.error('Erreur:', err);
            setError('Impossible de charger le cours');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await courseService.delete(id);
            navigate('/admin/courses');
        } catch (err) {
            console.error('Erreur:', err);
            alert('Erreur lors de la suppression');
        } finally {
            setDeleting(false);
            setDeleteModal(false);
        }
    };

    const handleCancelCourse = async () => {
        if (!window.confirm('Êtes-vous sûr de vouloir annuler ce cours ? Toutes les réservations seront annulées.')) {
            return;
        }

        try {
            await courseService.cancel(id);
            fetchCourseData();
        } catch (err) {
            console.error('Erreur:', err);
            alert('Erreur lors de l\'annulation');
        }
    };

    const getStatusChip = (status) => {
        const config = {
            'SCHEDULED': { color: 'blue', text: 'Planifié' },
            'ONGOING': { color: 'green', text: 'En cours' },
            'COMPLETED': { color: 'gray', text: 'Terminé' },
            'CANCELLED': { color: 'red', text: 'Annulé' },
        };
        
        const statusConfig = config[status] || { color: 'gray', text: status };
        return <Chip value={statusConfig.text} color={statusConfig.color} size="sm" />;
    };

    const getBookingStatusChip = (status) => {
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
                <Button className="mt-4" onClick={() => navigate('/admin/courses')}>
                    Retour
                </Button>
            </PageContainer>
        );
    }

    if (!course) {
        return (
            <PageContainer>
                <Alert color="orange">Cours non trouvé.</Alert>
            </PageContainer>
        );
    }

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
            {/* En-tête avec Actions */}
            <div className="flex items-center justify-between mb-6">
                <Button
                    variant="text"
                    className="flex items-center gap-2"
                    onClick={() => navigate('/admin/courses')}
                >
                    <ArrowLeftIcon className="h-4 w-4" /> Retour
                </Button>

                <div className="flex gap-2">
                    {course.status === 'SCHEDULED' && (
                        <>
                            <Button
                                color="blue"
                                className="flex items-center gap-2"
                                onClick={() => navigate(`/admin/courses/${id}/edit`)}
                            >
                                <PencilIcon className="h-4 w-4" />
                                Modifier
                            </Button>
                            <Button
                                color="orange"
                                variant="outlined"
                                onClick={handleCancelCourse}
                            >
                                Annuler le cours
                            </Button>
                        </>
                    )}
                    <Button
                        color="red"
                        variant="outlined"
                        className="flex items-center gap-2"
                        onClick={() => setDeleteModal(true)}
                    >
                        <TrashIcon className="h-4 w-4" />
                        Supprimer
                    </Button>
                </div>
            </div>

            {/* Informations du Cours */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <Card className="lg:col-span-2">
                    <CardBody>
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <Typography variant="h4" color="blue-gray" className="mb-2">
                                    {course.title}
                                </Typography>
                                <Typography variant="small" className="text-gray-600">
                                    {course.course_type_details?.name}
                                </Typography>
                            </div>
                            {getStatusChip(course.status)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <ClockIcon className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <Typography variant="small" className="font-semibold text-gray-700">
                                        Date et Heure
                                    </Typography>
                                    <Typography variant="small" className="text-gray-600">
                                        {formatDate(course.date)}
                                    </Typography>
                                    <Typography variant="small" className="text-gray-600">
                                        {course.start_time} - {course.end_time}
                                    </Typography>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-50 rounded-lg">
                                    <MapPinIcon className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <Typography variant="small" className="font-semibold text-gray-700">
                                        Salle
                                    </Typography>
                                    <Typography variant="small" className="text-gray-600">
                                        {course.room_details?.name}
                                    </Typography>
                                    <Typography variant="small" className="text-gray-600">
                                        Capacité: {course.room_details?.capacity} personnes
                                    </Typography>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-50 rounded-lg">
                                    <UsersIcon className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <Typography variant="small" className="font-semibold text-gray-700">
                                        Coach
                                    </Typography>
                                    <Typography variant="small" className="text-gray-600">
                                        {course.coach_name}
                                    </Typography>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-50 rounded-lg">
                                    <UsersIcon className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <Typography variant="small" className="font-semibold text-gray-700">
                                        Participants
                                    </Typography>
                                    <Typography variant="small" className="text-gray-600">
                                        {course.available_spots} / {course.max_participants} places disponibles
                                    </Typography>
                                    {course.is_full && (
                                        <Chip value="Complet" color="orange" size="sm" className="mt-1" />
                                    )}
                                </div>
                            </div>
                        </div>

                        {course.description && (
                            <div className="mt-6">
                                <Typography variant="h6" color="blue-gray" className="mb-2">
                                    Description
                                </Typography>
                                <Typography variant="small" className="text-gray-700">
                                    {course.description}
                                </Typography>
                            </div>
                        )}

                        {course.notes && (
                            <div className="mt-4">
                                <Typography variant="h6" color="blue-gray" className="mb-2">
                                    Notes Internes
                                </Typography>
                                <Typography variant="small" className="text-gray-700 italic">
                                    {course.notes}
                                </Typography>
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Statistiques */}
                <Card>
                    <CardBody>
                        <Typography variant="h6" color="blue-gray" className="mb-4">
                            Statistiques
                        </Typography>

                        <div className="space-y-4">
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <Typography variant="small" className="text-gray-600">
                                    Total Réservations
                                </Typography>
                                <Typography variant="h4" color="blue">
                                    {bookings.length}
                                </Typography>
                            </div>

                            <div className="p-4 bg-green-50 rounded-lg">
                                <Typography variant="small" className="text-gray-600">
                                    Confirmées
                                </Typography>
                                <Typography variant="h4" color="green">
                                    {bookings.filter(b => b.status === 'CONFIRMED').length}
                                </Typography>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg">
                                <Typography variant="small" className="text-gray-600">
                                    Check-in
                                </Typography>
                                <Typography variant="h4" color="blue-gray">
                                    {bookings.filter(b => b.checked_in).length}
                                </Typography>
                            </div>

                            <div className="p-4 bg-red-50 rounded-lg">
                                <Typography variant="small" className="text-gray-600">
                                    Annulées
                                </Typography>
                                <Typography variant="h4" color="red">
                                    {bookings.filter(b => b.status === 'CANCELLED').length}
                                </Typography>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Liste des Réservations */}
            <Card>
                <CardBody>
                    <div className="flex justify-between items-center mb-4">
                        <Typography variant="h5" color="blue-gray">
                            Réservations ({bookings.length})
                        </Typography>
                        {course.status === 'SCHEDULED' && !course.is_full && (
                            <Button
                                color="green"
                                size="sm"
                                onClick={() => navigate(`/admin/bookings/create?course=${id}`)}
                            >
                                Ajouter une Réservation
                            </Button>
                        )}
                    </div>

                    {bookings.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-max table-auto">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        {['Membre', 'Statut', 'Date de Réservation', 'Check-in', 'Actions'].map((head) => (
                                            <th key={head} className="p-4 text-left">
                                                <Typography variant="small" className="font-bold text-gray-700 uppercase">
                                                    {head}
                                                </Typography>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((booking, index) => {
                                        const isLast = index === bookings.length - 1;
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
                                                    {getBookingStatusChip(booking.status)}
                                                </td>
                                                <td className={classes}>
                                                    <Typography variant="small">
                                                        {new Date(booking.booking_date).toLocaleString('fr-FR')}
                                                    </Typography>
                                                </td>
                                                <td className={classes}>
                                                    {booking.checked_in ? (
                                                        <Chip value="Présent" color="green" size="sm" />
                                                    ) : (
                                                        <Chip value="Non présent" color="gray" size="sm" />
                                                    )}
                                                </td>
                                                <td className={classes}>
                                                    <Button
                                                        variant="text"
                                                        size="sm"
                                                        onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                                                    >
                                                        Détails
                                                    </Button>
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
                                Aucune réservation pour ce cours.
                            </Typography>
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Modal de Suppression */}
            <DeleteCourseModal
                open={deleteModal}
                onClose={() => setDeleteModal(false)}
                onConfirm={handleDelete}
                courseTitle={course.title}
                loading={deleting}
            />
        </PageContainer>
    );
};

export default CourseDetail;