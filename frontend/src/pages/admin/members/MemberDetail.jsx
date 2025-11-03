import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Card, 
    CardBody, 
    CardHeader,
    Typography, 
    Spinner, 
    Button, 
    Alert,
    Chip,
    Avatar
} from "@material-tailwind/react";
import { ArrowLeftIcon, PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/solid";
import api from "@/api/axiosInstance";
import { DeleteMemberModal } from "@/components/profile/DeleteMemberModal";
import { AddMeasurementModal } from "@/components/profile/AddMeasurementModal";
import DownloadCardButton from "@/components/profile/DownloadCardButton";

const MemberDetail = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // États pour le modal de suppression
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    
    // États pour le modal d'ajout de mesure
    const [measurementModalOpen, setMeasurementModalOpen] = useState(false);
    const [addingMeasurement, setAddingMeasurement] = useState(false);

    // Fonction pour récupérer les détails
    const fetchMemberDetail = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`members/${userId}/`);
            setMember(response.data);
        } catch (err) {
            console.error("Erreur lors de la récupération du détail du membre:", err.response?.data || err.message);
            if (err.response?.status === 403) {
                 setError("Accès refusé. Vous n'avez pas les permissions pour voir ce membre.");
            } else {
                 setError(err.response?.data?.detail || "Impossible de charger les informations du membre.");
            }
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchMemberDetail();
    }, [fetchMemberDetail]);

    // LOGIQUE DE SUPPRESSION
    const handleDelete = async () => {
        setDeleting(true);
        setError(null);
        try {
            await api.delete(`members/${userId}/`);
            navigate('/admin/members', { 
                state: { message: `Le membre ${member?.first_name || ''} ${member?.last_name || ''} a été supprimé avec succès.` } 
            });
        } catch (err) {
            console.error("Erreur lors de la suppression:", err.response?.data || err.message);
            setError(`Erreur lors de la suppression du membre : ${err.response?.status || 'Erreur réseau'}`);
            setDeleteModalOpen(false);
        } finally {
            setDeleting(false);
        }
    };

    // Logique d'ajout de mesure
    const handleAddMeasurement = async (measurementData) => {
        setAddingMeasurement(true);
        try {
            await api.post(`members/${userId}/add_measurement/`, measurementData);
            await fetchMemberDetail(); 
            setMeasurementModalOpen(false);
        } catch (err) {
            console.error("Erreur lors de l'ajout de la mesure:", err);
            throw new Error(err.response?.data?.detail || "Erreur lors de l'ajout de la mesure");
        } finally {
            setAddingMeasurement(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spinner color="blue" className="h-12 w-12" />
            </div>
        );
    }

    if (error && !member) {
        return (
            <div className="p-4">
                <Alert color="red">{error}</Alert>
                <Button className="mt-4" onClick={() => navigate('/admin/members')}>
                    Retour à la liste
                </Button>
            </div>
        );
    }

    if (!member) {
        return <Alert color="orange" className="p-4">Membre non trouvé.</Alert>;
    }
    
    // Helper pour formater la date
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('fr-FR'); 
    };

    // Helper pour la puce de statut
    const getStatusChip = (status) => {
        const statusConfig = {
            'ACTIVE': { color: 'green', text: 'Actif' },
            'INACTIVE': { color: 'gray', text: 'Inactif' },
            'SUSPENDED': { color: 'orange', text: 'Suspendu' },
            'EXPIRED': { color: 'red', text: 'Expiré' },
        };
        const config = statusConfig[status] || { color: 'gray', text: status };
        return <Chip value={config.text} color={config.color} size="sm" />;
    };

    return (
        <div className="p-4 md:p-10 min-h-screen bg-gray-50">
            {error && (
                <Alert color="red" className="mb-4">{error}</Alert>
            )}

            {/* CARTE PRINCIPALE AVEC HEADER */}
            <Card className="mt-6">
                {/* EN-TÊTE AVEC BOUTONS */}
                <CardHeader 
                    floated={false} 
                    shadow={false} 
                    className="rounded-none bg-transparent p-4 md:p-6"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        {/* Bouton Retour */}
                        <Button 
                            variant="text" 
                            className="flex items-center gap-2 text-blue-gray-700 hover:text-blue-600"
                            onClick={() => navigate('/admin/members')}
                        >
                            <ArrowLeftIcon className="h-5 w-5" /> Retour
                        </Button>

                        {/* Boutons d'action */}
                        <div className="flex gap-2 justify-end flex-wrap">
                            <DownloadCardButton memberId={member.member_id} />
                            <Button
                                color="blue"
                                size="sm"
                                className="flex items-center gap-2"
                                onClick={() => navigate(`/admin/members/${userId}/edit`)}
                            >
                                <PencilIcon className="h-4 w-4" /> Modifier
                            </Button>
                            <Button
                                color="red"
                                size="sm"
                                className="flex items-center gap-2"
                                onClick={() => setDeleteModalOpen(true)}
                            >
                                <TrashIcon className="h-4 w-4" /> Supprimer
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                {/* CONTENU DU PROFIL */}
                <CardBody className="px-4 md:px-6 pb-6">
                    <div className="flex flex-col sm:flex-row items-start gap-6 mb-6">
                        <Avatar 
                            src={member.photo || "/img/default-avatar.png"} 
                            alt={`${member.first_name} ${member.last_name}`}
                            size="xxl"
                            variant="rounded"
                            className="shadow-lg"
                        />
                        <div className="flex-1">
                            <Typography variant="h4" color="blue-gray" className="mb-1">
                                {member.first_name} {member.last_name}
                            </Typography>
                            <Typography variant="small" className="text-gray-600 mb-2">
                                ID: {member.member_id}
                            </Typography>
                            {getStatusChip(member.status)}
                        </div>
                    </div>

                    {/* Informations en grille */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Typography variant="small" className="font-semibold text-gray-700">Email:</Typography>
                            <Typography variant="small" className="text-gray-600">{member.email}</Typography>
                        </div>
                        <div>
                            <Typography variant="small" className="font-semibold text-gray-700">Téléphone:</Typography>
                            <Typography variant="small" className="text-gray-600">{member.phone}</Typography>
                        </div>
                        <div>
                            <Typography variant="small" className="font-semibold text-gray-700">Date de naissance:</Typography>
                            <Typography variant="small" className="text-gray-600">{formatDate(member.date_of_birth)}</Typography>
                        </div>
                        <div>
                            <Typography variant="small" className="font-semibold text-gray-700">Genre:</Typography>
                            <Typography variant="small" className="text-gray-600">
                                {member.gender === 'M' ? 'Masculin' : member.gender === 'F' ? 'Féminin' : 'Autre'}
                            </Typography>
                        </div>
                        <div>
                            <Typography variant="small" className="font-semibold text-gray-700">Date d'adhésion:</Typography>
                            <Typography variant="small" className="text-gray-600">{formatDate(member.join_date)}</Typography>
                        </div>
                        <div>
                            <Typography variant="small" className="font-semibold text-gray-700">Contact d'urgence:</Typography>
                            <Typography variant="small" className="text-gray-600">
                                {member.emergency_contact_name} - {member.emergency_contact_phone}
                            </Typography>
                        </div>
                    </div>

                    {member.address && (
                        <div className="mt-4">
                            <Typography variant="small" className="font-semibold text-gray-700">Adresse:</Typography>
                            <Typography variant="small" className="text-gray-600">{member.address}</Typography>
                        </div>
                    )}

                    {member.medical_conditions && (
                        <div className="mt-4">
                            <Typography variant="small" className="font-semibold text-gray-700">Conditions médicales:</Typography>
                            <Typography variant="small" className="text-gray-600">{member.medical_conditions}</Typography>
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* CARTE MESURES PHYSIQUES */}
            <Card className="mt-6">
                <CardBody>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                        <Typography variant="h5" color="blue-gray">
                            Historique des Mesures
                        </Typography>
                        <Button 
                            color="green" 
                            size="sm"
                            className="flex items-center gap-2"
                            onClick={() => setMeasurementModalOpen(true)}
                        >
                            <PlusIcon className="h-4 w-4" /> Ajouter une Mesure
                        </Button>
                    </div>
                    
                    {member.measurements && member.measurements.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {['Date', 'Poids (kg)', 'Masse Grasse (%)', 'Masse Musculaire (kg)', 'Tour de poitrine (cm)', 'Tour de taille (cm)', 'Tour de hanches (cm)', 'Notes'].map((header) => (
                                            <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {member.measurements.map((measurement, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(measurement.date)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{measurement.weight || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{measurement.body_fat_percentage || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{measurement.muscle_mass || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{measurement.chest || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{measurement.waist || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{measurement.hips || '-'}</td>
                                            <td className="px-6 py-4 text-sm italic text-gray-500">{measurement.notes || '...'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <Typography variant="small" className="text-gray-500 italic text-center py-4">
                            Aucune mesure enregistrée pour ce membre.
                        </Typography>
                    )}
                </CardBody>
            </Card>

            {/* MODALS */}
            {deleteModalOpen && (
                <DeleteMemberModal
                    open={deleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={handleDelete}
                    memberName={`${member.first_name} ${member.last_name}`}
                    loading={deleting}
                />
            )}

            {measurementModalOpen && (
                <AddMeasurementModal
                    open={measurementModalOpen}
                    onClose={() => setMeasurementModalOpen(false)}
                    onSubmit={handleAddMeasurement}
                    loading={addingMeasurement}
                />
            )}
        </div>
    );
};

export default MemberDetail;