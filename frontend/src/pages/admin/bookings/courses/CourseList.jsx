// Fichier: frontend/src/pages/admin/bookings/courses/CourseList.jsx

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
} from '@material-tailwind/react';
import { 
    MagnifyingGlassIcon, 
    PlusIcon, 
    PencilIcon, 
    TrashIcon,
    EyeIcon,
    CalendarIcon,
} from '@heroicons/react/24/solid';
import PageContainer from '@/components/admin/PageContainer';
import DeleteCourseModal from '@/components/bookings/DeleteCourseModal';
import { courseService } from '@/services/bookingService';

const CourseList = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [deleteModal, setDeleteModal] = useState({ open: false, course: null });
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, [statusFilter]);

    const fetchCourses = async () => {
        try {
            const params = statusFilter !== 'all' ? { status: statusFilter } : {};
            const data = await courseService.getAll(params);
            const courseData = Array.isArray(data) ? data : (data.results || []);
            setCourses(courseData);
            setError(null);
        } catch (err) {
            console.error('Erreur:', err);
            setError('Impossible de charger les cours');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await courseService.delete(deleteModal.course.id);
            setCourses(courses.filter(c => c.id !== deleteModal.course.id));
            setDeleteModal({ open: false, course: null });
        } catch (err) {
            console.error('Erreur:', err);
            alert('Erreur lors de la suppression');
        } finally {
            setDeleting(false);
        }
    };

    const handleCancelCourse = async (courseId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir annuler ce cours ?')) return;
        
        try {
            await courseService.cancel(courseId);
            fetchCourses();
        } catch (err) {
            console.error('Erreur:', err);
            alert('Erreur lors de l\'annulation');
        }
    };

    const filteredCourses = courses.filter(course =>
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.course_type_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.coach_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
            title="Gestion des Cours"
            subtitle={`${courses.length} cours planifié(s)`}
            actions={
                <div className="flex gap-2">
                    <Button
                        variant="outlined"
                        color="blue"
                        className="flex items-center gap-2"
                        onClick={() => navigate('/admin/bookings/courses/calendar')}
                    >
                        <CalendarIcon className="h-5 w-5" />
                        Calendrier
                    </Button>
                    <Button
                        className="flex items-center gap-2"
                        color="blue"
                        onClick={() => navigate('/admin/bookings/courses/create')}
                    >
                        <PlusIcon className="h-5 w-5" />
                        Nouveau Cours
                    </Button>
                </div>
            }
        >
            <Card className="shadow-lg">
                <CardBody>
                    {/* Filtres */}
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Rechercher un cours..."
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
                            <Option value="SCHEDULED">Planifié</Option>
                            <Option value="ONGOING">En cours</Option>
                            <Option value="COMPLETED">Terminé</Option>
                            <Option value="CANCELLED">Annulé</Option>
                        </Select>
                    </div>

                    {/* Tableau */}
                    {filteredCourses.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-max table-auto">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        {['Cours', 'Type', 'Coach', 'Salle', 'Date/Heure', 'Places', 'Statut', 'Actions'].map((head) => (
                                            <th key={head} className="p-4 text-left">
                                                <Typography variant="small" className="font-bold text-gray-700 uppercase">
                                                    {head}
                                                </Typography>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCourses.map((course, index) => {
                                        const isLast = index === filteredCourses.length - 1;
                                        const classes = isLast ? 'p-4' : 'p-4 border-b border-gray-100';

                                        return (
                                            <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                                                <td className={classes}>
                                                    <Typography variant="small" className="font-bold text-blue-600">
                                                        {course.title}
                                                    </Typography>
                                                </td>
                                                <td className={classes}>
                                                    <Typography variant="small">
                                                        {course.course_type_name}
                                                    </Typography>
                                                </td>
                                                <td className={classes}>
                                                    <Typography variant="small">
                                                        {course.coach_name}
                                                    </Typography>
                                                </td>
                                                <td className={classes}>
                                                    <Typography variant="small">
                                                        {course.room_name}
                                                    </Typography>
                                                </td>
                                                <td className={classes}>
                                                    <Typography variant="small" className="font-medium">
                                                        {new Date(course.date).toLocaleDateString('fr-FR')}
                                                    </Typography>
                                                    <Typography variant="small" className="text-gray-600">
                                                        {course.start_time} - {course.end_time}
                                                    </Typography>
                                                </td>
                                                <td className={classes}>
                                                    <Typography variant="small">
                                                        {course.bookings_count} / {course.max_participants}
                                                    </Typography>
                                                    {course.is_full && (
                                                        <Chip value="Complet" color="orange" size="sm" className="mt-1" />
                                                    )}
                                                </td>
                                                <td className={classes}>
                                                    {getStatusChip(course.status)}
                                                </td>
                                                <td className={classes}>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            variant="text"
                                                            size="sm"
                                                            color="blue"
                                                            onClick={() => navigate(`/admin/bookings/courses/${course.id}`)}
                                                        >
                                                            <EyeIcon className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="text"
                                                            size="sm"
                                                            color="blue"
                                                            onClick={() => navigate(`/admin/bookings/courses/${course.id}/edit`)}
                                                            disabled={course.status === 'COMPLETED' || course.status === 'CANCELLED'}
                                                        >
                                                            <PencilIcon className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="text"
                                                            size="sm"
                                                            color="red"
                                                            onClick={() => setDeleteModal({ open: true, course })}
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
                                {searchTerm ? 'Aucun cours trouvé.' : 'Aucun cours planifié.'}
                            </Typography>
                        </div>
                    )}
                </CardBody>
            </Card>

            <DeleteCourseModal
                open={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, course: null })}
                onConfirm={handleDelete}
                courseTitle={deleteModal.course?.title || ''}
                loading={deleting}
            />
        </PageContainer>
    );
};

export default CourseList;