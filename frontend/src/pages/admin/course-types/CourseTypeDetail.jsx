// Fichier: frontend/src/pages/admin/bookings/course-types/CourseTypeDetail.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Card, 
    CardBody, 
    Typography, 
    Spinner, 
    Button, 
    Alert,
    Chip,
} from "@material-tailwind/react";
import { 
    ArrowLeftIcon, 
    PencilIcon, 
    TrashIcon,
    ClockIcon,
    UsersIcon,
    CurrencyDollarIcon,
    AcademicCapIcon,
} from "@heroicons/react/24/solid";
import { courseTypeService } from '@/services/bookingService';

const CourseTypeDetail = () => {
    const { typeId } = useParams();
    const navigate = useNavigate();
    const [courseType, setCourseType] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCourseTypeDetail();
    }, [typeId]);

    const fetchCourseTypeDetail = async () => {
        try {
            const data = await courseTypeService.getById(typeId);
            setCourseType(data);
            setError(null);
        } catch (err) {
            console.error('Erreur:', err);
            setError('Impossible de charger les détails du type de cours.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Voulez-vous vraiment supprimer ce type de cours ? Tous les cours associés seront également supprimés.')) {
            return;
        }
        
        try {
            await courseTypeService.delete(typeId);
            navigate('/admin/course-types', { 
                state: { message: 'Type de cours supprimé avec succès' } 
            });
        } catch (err) {
            console.error('Erreur:', err);
            setError('Erreur lors de la suppression');
        }
    };

    const toggleStatus = async () => {
        try {
            await courseTypeService.update(typeId, { 
                is_active: !courseType.is_active 
            });
            fetchCourseTypeDetail();
        } catch (err) {
            console.error('Erreur:', err);
            alert('Impossible de modifier le statut');
        }
    };

    if (loading) {
        return (
            <div className="p-4 md:p-10 min-h-screen bg-gray-50">
                <div className="flex justify-center items-center h-96">
                    <Spinner color="blue" className="h-12 w-12" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 md:p-10 min-h-screen bg-gray-50">
                <Alert color="red">{error}</Alert>
                <Button className="mt-4" onClick={() => navigate('/admin/course-types')}>
                    Retour à la liste
                </Button>
            </div>
        );
    }

    if (!courseType) {
        return (
            <div className="p-4 md:p-10 min-h-screen bg-gray-50">
                <Alert color="orange">Type de cours non trouvé.</Alert>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-10 min-h-screen bg-gray-50">
            {/* En-tête */}
            <div className="flex items-center justify-between mb-6">
                <Button 
                    variant="text" 
                    className="flex items-center gap-2"
                    onClick={() => navigate('/admin/course-types')}
                >
                    <ArrowLeftIcon className="h-4 w-4" /> Retour
                </Button>

                <div className="flex gap-2">
                    <Button
                        color="blue"
                        className="flex items-center gap-2"
                        onClick={() => navigate(`/admin/course-types/${typeId}/edit`)}
                    >
                        <PencilIcon className="h-4 w-4" /> Modifier
                    </Button>
                    <Button
                        color="red"
                        className="flex items-center gap-2"
                        onClick={handleDelete}
                    >
                        <TrashIcon className="h-4 w-4" /> Supprimer
                    </Button>
                </div>
            </div>

            {/* Carte Principale */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardBody>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <AcademicCapIcon className="h-8 w-8 text-blue-600" />
                                </div>
                                <div>
                                    <Typography variant="h4" color="blue-gray">
                                        {courseType.name}
                                    </Typography>
                                    <Typography variant="small" className="text-gray-600">
                                        Type de Cours
                                    </Typography>
                                </div>
                            </div>
                            <Chip 
                                value={courseType.is_active ? "Actif" : "Inactif"} 
                                color={courseType.is_active ? "green" : "gray"} 
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                                <div className="p-2 bg-blue-200 rounded">
                                    <ClockIcon className="h-6 w-6 text-blue-700" />
                                </div>
                                <div>
                                    <Typography variant="small" className="text-gray-600">
                                        Durée
                                    </Typography>
                                    <Typography variant="h6" color="blue-gray">
                                        {courseType.duration_minutes} min
                                    </Typography>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                                <div className="p-2 bg-green-200 rounded">
                                    <UsersIcon className="h-6 w-6 text-green-700" />
                                </div>
                                <div>
                                    <Typography variant="small" className="text-gray-600">
                                        Capacité Max
                                    </Typography>
                                    <Typography variant="h6" color="blue-gray">
                                        {courseType.max_participants || 'N/A'}
                                    </Typography>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                                <div className="p-2 bg-purple-200 rounded">
                                    <CurrencyDollarIcon className="h-6 w-6 text-purple-700" />
                                </div>
                                <div>
                                    <Typography variant="small" className="text-gray-600">
                                        Prix
                                    </Typography>
                                    <Typography variant="h6" color="blue-gray">
                                        {courseType.price ? `${courseType.price} DT` : 'Gratuit'}
                                    </Typography>
                                </div>
                            </div>
                        </div>

                        {courseType.description && (
                            <div className="mt-6">
                                <Typography variant="h6" color="blue-gray" className="mb-2">
                                    Description
                                </Typography>
                                <Typography variant="small" className="text-gray-700">
                                    {courseType.description}
                                </Typography>
                            </div>
                        )}

                        {courseType.requirements && (
                            <div className="mt-4">
                                <Typography variant="h6" color="blue-gray" className="mb-2">
                                    Prérequis
                                </Typography>
                                <Typography variant="small" className="text-gray-700">
                                    {courseType.requirements}
                                </Typography>
                            </div>
                        )}

                        {courseType.equipment && courseType.equipment.length > 0 && (
                            <div className="mt-4">
                                <Typography variant="h6" color="blue-gray" className="mb-2">
                                    Équipements Nécessaires
                                </Typography>
                                <div className="flex flex-wrap gap-2">
                                    {courseType.equipment.map((item, index) => (
                                        <Chip key={index} value={item} size="sm" color="blue" />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <Button
                                color={courseType.is_active ? "red" : "green"}
                                variant="outlined"
                                onClick={toggleStatus}
                            >
                                {courseType.is_active ? "Désactiver" : "Activer"} ce type de cours
                            </Button>
                        </div>
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
                                    Cours Planifiés
                                </Typography>
                                <Typography variant="h4" color="blue">
                                    {courseType.total_courses || 0}
                                </Typography>
                            </div>

                            <div className="p-4 bg-green-50 rounded-lg">
                                <Typography variant="small" className="text-gray-600">
                                    Cours Complétés
                                </Typography>
                                <Typography variant="h4" color="green">
                                    {courseType.completed_courses || 0}
                                </Typography>
                            </div>

                            <div className="p-4 bg-purple-50 rounded-lg">
                                <Typography variant="small" className="text-gray-600">
                                    Participants Total
                                </Typography>
                                <Typography variant="h4" color="purple">
                                    {courseType.total_participants || 0}
                                </Typography>
                            </div>

                            <div className="p-4 bg-orange-50 rounded-lg">
                                <Typography variant="small" className="text-gray-600">
                                    Taux de Remplissage
                                </Typography>
                                <Typography variant="h4" color="orange">
                                    {courseType.fill_rate ? `${courseType.fill_rate}%` : 'N/A'}
                                </Typography>
                            </div>
                        </div>

                        {/* Informations Supplémentaires */}
                        <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                            <div>
                                <Typography variant="small" className="text-gray-600">
                                    Créé le
                                </Typography>
                                <Typography variant="small" className="font-semibold">
                                    {courseType.created_at 
                                        ? new Date(courseType.created_at).toLocaleDateString('fr-FR')
                                        : 'N/A'}
                                </Typography>
                            </div>
                            <div>
                                <Typography variant="small" className="text-gray-600">
                                    Dernière modification
                                </Typography>
                                <Typography variant="small" className="font-semibold">
                                    {courseType.updated_at 
                                        ? new Date(courseType.updated_at).toLocaleDateString('fr-FR')
                                        : 'N/A'}
                                </Typography>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Cours Associés */}
            {courseType.recent_courses && courseType.recent_courses.length > 0 && (
                <Card className="mt-6">
                    <CardBody>
                        <div className="flex justify-between items-center mb-4">
                            <Typography variant="h5" color="blue-gray">
                                Cours Récents
                            </Typography>
                            <Button
                                variant="text"
                                color="blue"
                                size="sm"
                                onClick={() => navigate('/admin/courses', { 
                                    state: { courseType: typeId } 
                                })}
                            >
                                Voir tous les cours
                            </Button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-max table-auto">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        {['Titre', 'Date', 'Coach', 'Participants', 'Statut'].map((head) => (
                                            <th key={head} className="p-4 text-left">
                                                <Typography variant="small" className="font-bold text-gray-700 uppercase">
                                                    {head}
                                                </Typography>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {courseType.recent_courses.map((course, index) => {
                                        const isLast = index === courseType.recent_courses.length - 1;
                                        const classes = isLast ? 'p-4' : 'p-4 border-b border-gray-100';

                                        return (
                                            <tr 
                                                key={course.id} 
                                                className="hover:bg-gray-50 cursor-pointer transition-colors"
                                                onClick={() => navigate(`/admin/courses/${course.id}`)}
                                            >
                                                <td className={classes}>
                                                    <Typography variant="small" className="font-semibold">
                                                        {course.title}
                                                    </Typography>
                                                </td>
                                                <td className={classes}>
                                                    <Typography variant="small">
                                                        {new Date(course.date).toLocaleDateString('fr-FR')}
                                                    </Typography>
                                                </td>
                                                <td className={classes}>
                                                    <Typography variant="small">
                                                        {course.coach_name}
                                                    </Typography>
                                                </td>
                                                <td className={classes}>
                                                    <Typography variant="small">
                                                        {course.bookings_count}/{course.max_participants}
                                                    </Typography>
                                                </td>
                                                <td className={classes}>
                                                    <Chip 
                                                        value={course.status} 
                                                        color={course.status === 'SCHEDULED' ? 'blue' : 'gray'} 
                                                        size="sm" 
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </CardBody>
                </Card>
            )}
        </div>
    );
};

export default CourseTypeDetail;