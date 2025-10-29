// Fichier: frontend/src/pages/admin/MemberDetail.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardBody, Typography, Spinner, Button, Alert } from "@material-tailwind/react";
import api from "@/api/axiosInstance";

const MemberDetail = () => {
    const { userId } = useParams(); // ID du membre (user.pk)
    const navigate = useNavigate();
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMemberDetail = async () => {
            try {
                // Appel à l'API: /api/members/profiles/{pk}/
                const response = await api.get(`members/profiles/${userId}/`);
                setMember(response.data);
                setError(null);
            } catch (err) {
                console.error("Erreur lors de la récupération du détail du membre:", err);
                setError("Impossible de charger les informations du membre. Vérifiez les permissions.");
            } finally {
                setLoading(false);
            }
        };

        fetchMemberDetail();
    }, [userId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spinner color="blue" className="h-12 w-12" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4">
                <Alert color="red">{error}</Alert>
                <Button className="mt-4" onClick={() => navigate('/admin/members')}>Retour à la liste</Button>
            </div>
        );
    }

    if (!member) {
        return <Alert color="orange" className="p-4">Membre non trouvé.</Alert>;
    }

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    return (
        <div className="p-4 md:p-10 min-h-screen bg-gray-50">
            <Typography variant="h4" color="blue-gray" className="mb-6">
                Détail du Membre : {member.full_name}
            </Typography>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Informations Générales */}
                <Card className="col-span-1 lg:col-span-2">
                    <CardBody>
                        <Typography variant="h5" color="blue-gray" className="mb-4 border-b pb-2">
                            Informations de Contact et Adhésion
                        </Typography>
                        <div className="grid grid-cols-2 gap-4">
                            <Typography variant="small" className="font-semibold">Email:</Typography>
                            <Typography variant="small">{member.email}</Typography>
                            
                            <Typography variant="small" className="font-semibold">Date d'adhésion:</Typography>
                            <Typography variant="small">{formatDate(member.join_date)}</Typography>

                            <Typography variant="small" className="font-semibold">Statut Actuel (Niveau):</Typography>
                            <Typography variant="small" className="font-bold text-blue-600">
                                {member.current_status}
                            </Typography>
                        </div>

                        <Typography variant="h6" color="blue-gray" className="mt-6 mb-2">
                            Objectifs:
                        </Typography>
                        <Typography variant="small" className="italic">
                            {member.goals || "Aucun objectif défini."}
                        </Typography>
                    </CardBody>
                </Card>

                {/* Abonnements Actifs */}
                <Card>
                    <CardBody>
                        <Typography variant="h5" color="blue-gray" className="mb-4 border-b pb-2">
                            Abonnements Actifs
                        </Typography>
                        {member.active_subscriptions && member.active_subscriptions.length > 0 ? (
                            member.active_subscriptions.map((sub, index) => (
                                <div key={index} className="mb-3 p-3 border-l-4 border-light-blue-500 bg-light-blue-50/50">
                                    <Typography variant="small" className="font-bold">{sub.plan.name}</Typography>
                                    <Typography variant="small" className="text-xs">
                                        Du {formatDate(sub.start_date)} au {formatDate(sub.end_date)}
                                    </Typography>
                                </div>
                            ))
                        ) : (
                            <Typography variant="small" className="text-red-500">
                                Aucun abonnement actif trouvé.
                            </Typography>
                        )}
                        <Button color="blue" size="sm" className="mt-4">
                            Gérer Abonnement (À implémenter)
                        </Button>
                    </CardBody>
                </Card>
            </div>

            {/* Tableau: Métriques de Performance */}
            <Card className="mt-6">
                <CardBody>
                    <Typography variant="h5" color="blue-gray" className="mb-4 flex justify-between items-center">
                        Historique des Métriques de Performance
                        <Button color="green" size="sm">Ajouter une Métrique (À implémenter)</Button>
                    </Typography>
                    
                    {member.latest_metrics && member.latest_metrics.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {['Date', 'Poids (kg)', 'Taille (cm)', 'Masse Grasse (%)', 'Notes'].map((header) => (
                                            <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {member.latest_metrics.map((metric, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-gray-900">{formatDate(metric.date)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{metric.weight_kg || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{metric.height_cm || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{metric.body_fat_percentage || '-'}</td>
                                            <td className="px-6 py-4 whitespace-pre-wrap text-sm italic">{metric.notes || '...'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <Typography variant="small" className="text-gray-500 italic">
                            Aucune métrique de performance enregistrée pour ce membre.
                        </Typography>
                    )}
                </CardBody>
            </Card>

            <Button className="mt-6" onClick={() => navigate('/admin/members')}>
                ← Retour à la Liste des Membres
            </Button>
        </div>
    );
};

export default MemberDetail;