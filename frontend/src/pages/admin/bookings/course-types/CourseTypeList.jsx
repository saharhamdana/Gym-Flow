// Fichier: frontend/src/pages/admin/bookings/course-types/CourseTypeList.jsx

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
} from '@material-tailwind/react';
import { MagnifyingGlassIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import PageContainer from '@/components/admin/PageContainer';
import DeleteCourseTypeModal from '@/components/bookings/DeleteCourseTypeModal';
import { courseTypeService } from '@/services/bookingService';

const CourseTypeList = () => {
    const navigate = useNavigate();
    const [courseTypes, setCourseTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteModal, setDeleteModal] = useState({ open: false, type: null });
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchCourseTypes();
    }, []);

    const fetchCourseTypes = async () => {
        try {
            const data = await courseTypeService.getAll();
            const typeData = Array.isArray(data) ? data : (data.results || []);
            setCourseTypes(typeData);
            setError(null);
        } catch (err) {
            console.error('Erreur:', err);
            setError('Impossible de charger les types de cours');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await courseTypeService.delete(deleteModal.type.id);
            setCourseTypes(courseTypes.filter(t => t.id !== deleteModal.type.id));
            setDeleteModal({ open: false, type: null });
        } catch (err) {
            console.error('Erreur:', err);
            alert('Erreur lors de la suppression');
        } finally {
            setDeleting(false);
        }
    };

    const filteredTypes = courseTypes.filter(type =>
        type.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        type.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
            title="Types de Cours"
            subtitle={`${courseTypes.length} type(s) de cours`}
            actions={
                <Button
                    className="flex items-center gap-2"
                    color="blue"
                    onClick={() => navigate('/admin/course-types/create')}
                >
                    <PlusIcon className="h-5 w-5" />
                    Nouveau Type
                </Button>
            }
        >
            <Card className="shadow-lg">
                <CardBody>
                    <div className="mb-6">
                        <Input
                            label="Rechercher un type..."
                            icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {filteredTypes.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-max table-auto">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        {['Nom', 'Couleur', 'Durée', 'Description', 'Statut', 'Actions'].map((head) => (
                                            <th key={head} className="p-4 text-left">
                                                <Typography variant="small" className="font-bold text-gray-700 uppercase">
                                                    {head}
                                                </Typography>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTypes.map((type, index) => {
                                        const isLast = index === filteredTypes.length - 1;
                                        const classes = isLast ? 'p-4' : 'p-4 border-b border-gray-100';

                                        return (
                                            <tr key={type.id} className="hover:bg-gray-50 transition-colors">
                                                <td className={classes}>
                                                    <Typography variant="small" className="font-bold">
                                                        {type.name}
                                                    </Typography>
                                                </td>
                                                <td className={classes}>
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-6 h-6 rounded-full border"
                                                            style={{ backgroundColor: type.color }}
                                                        />
                                                        <Typography variant="small" className="text-gray-600">
                                                            {type.color}
                                                        </Typography>
                                                    </div>
                                                </td>
                                                <td className={classes}>
                                                    <Typography variant="small">
                                                        {type.duration_minutes} min
                                                    </Typography>
                                                </td>
                                                <td className={classes}>
                                                    <Typography variant="small" className="text-gray-700 truncate max-w-xs">
                                                        {type.description || '-'}
                                                    </Typography>
                                                </td>
                                                <td className={classes}>
                                                    <Chip
                                                        value={type.is_active ? 'Actif' : 'Inactif'}
                                                        color={type.is_active ? 'green' : 'gray'}
                                                        size="sm"
                                                    />
                                                </td>
                                                <td className={classes}>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="text"
                                                            size="sm"
                                                            color="blue"
                                                            onClick={() => navigate(`/admin/bookings/course-types/${type.id}/edit`)}
                                                        >
                                                            <PencilIcon className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="text"
                                                            size="sm"
                                                            color="red"
                                                            onClick={() => setDeleteModal({ open: true, type })}
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
                                {searchTerm ? 'Aucun type trouvé.' : 'Aucun type de cours enregistré.'}
                            </Typography>
                        </div>
                    )}
                </CardBody>
            </Card>

            <DeleteCourseTypeModal
                open={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, type: null })}
                onConfirm={handleDelete}
                typeName={deleteModal.type?.name || ''}
                loading={deleting}
            />
        </PageContainer>
    );
};

export default CourseTypeList;