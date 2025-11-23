// frontend/src/pages/member/MemberPrograms.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MemberLayout from '../../components/member/MemberLayout';
import { Card, CardBody, Typography, Button, Chip } from "@material-tailwind/react";
import { 
  Dumbbell, Calendar, Target, Clock, User, 
  Download, Eye, TrendingUp, AlertCircle 
} from 'lucide-react';
import api from '../../api/axiosInstance';

const MemberPrograms = () => {
    const navigate = useNavigate();
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPrograms();
    }, []);

    const fetchPrograms = async () => {
        try {
            setLoading(true);
            const response = await api.get('/coaching/member/my-programs/');
            console.log('Programmes récupérés:', response.data);
            setPrograms(response.data);
        } catch (err) {
            console.error('Erreur chargement programmes:', err);
            setError('Impossible de charger vos programmes');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            draft: 'amber',
            active: 'green',
            completed: 'blue',
            archived: 'gray'
        };
        return colors[status] || 'gray';
    };

    const getStatusLabel = (status) => {
        const labels = {
            draft: 'Brouillon',
            active: 'Actif',
            completed: 'Terminé',
            archived: 'Archivé'
        };
        return labels[status] || status;
    };

    const handleExportPDF = async (programId) => {
        try {
            const response = await api.get(`/coaching/programs/${programId}/export_pdf/`, {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `programme-${programId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erreur export PDF:', error);
            alert('Erreur lors de l\'export PDF');
        }
    };

    if (loading) {
        return (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Chargement de vos programmes...</p>
                    </div>
                </div>
        );
    }

    if (error) {
        return (
                <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 max-w-md mx-auto">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-center mb-2" style={{ color: '#00357a' }}>
                        Erreur de chargement
                    </h3>
                    <p className="text-gray-600 text-center mb-4">{error}</p>
                    <button
                        onClick={fetchPrograms}
                        className="w-full text-white px-4 py-2 rounded-lg hover:opacity-90 transition-colors"
                        style={{ backgroundColor: '#9b0e16' }}
                    >
                        Réessayer
                    </button>
                </div>
        );
    }

    return (
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <Typography variant="h3" style={{ color: "#00357a" }}>
                        Mes Programmes d'Entraînement
                    </Typography>
                    <Typography variant="small" className="text-gray-600 mt-2">
                        Consultez vos programmes personnalisés créés par votre coach
                    </Typography>
                </div>

                {/* Liste des programmes */}
                {programs.length === 0 ? (
                    <Card>
                        <CardBody className="text-center py-12">
                            <Dumbbell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <Typography variant="h6" className="mb-2" style={{ color: '#00357a' }}>
                                Aucun programme disponible
                            </Typography>
                            <Typography className="text-gray-600">
                                Votre coach n'a pas encore créé de programme pour vous.
                            </Typography>
                        </CardBody>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {programs.map((program) => (
                            <Card key={program.id} className="hover:shadow-lg transition-shadow">
                                <CardBody>
                                    {/* En-tête */}
                                    <div className="flex items-start justify-between mb-4">
                                        <Typography variant="h5" style={{ color: '#00357a' }} className="flex-1">
                                            {program.title}
                                        </Typography>
                                        <Chip
                                            size="sm"
                                            value={getStatusLabel(program.status)}
                                            color={getStatusColor(program.status)}
                                        />
                                    </div>

                                    {/* Description */}
                                    {program.description && (
                                        <Typography className="text-gray-600 text-sm mb-4 line-clamp-3">
                                            {program.description}
                                        </Typography>
                                    )}

                                    {/* Informations */}
                                    <div className="space-y-3 mb-4">
                                        {/* Coach */}
                                        <div className="flex items-center text-sm text-gray-600">
                                            <User className="w-4 h-4 mr-2" style={{ color: '#9b0e16' }} />
                                            <span>Coach: {program.coach_name || 'Non assigné'}</span>
                                        </div>

                                        {/* Dates */}
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Calendar className="w-4 h-4 mr-2" style={{ color: '#9b0e16' }} />
                                            <span>
                                                {new Date(program.start_date).toLocaleDateString('fr-FR')} - 
                                                {new Date(program.end_date).toLocaleDateString('fr-FR')}
                                            </span>
                                        </div>

                                        {/* Durée */}
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Clock className="w-4 h-4 mr-2" style={{ color: '#9b0e16' }} />
                                            <span>{program.duration_weeks} semaines</span>
                                        </div>

                                        {/* Objectif */}
                                        {program.goal && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Target className="w-4 h-4 mr-2" style={{ color: '#9b0e16' }} />
                                                <span className="line-clamp-1">{program.goal}</span>
                                            </div>
                                        )}

                                        {/* Sessions */}
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Dumbbell className="w-4 h-4 mr-2" style={{ color: '#9b0e16' }} />
                                            <span>{program.workout_sessions?.length || 0} sessions d'entraînement</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => navigate(`/portal/programs/${program.id}`)}
                                            className="flex-1 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-colors flex items-center justify-center text-sm"
                                            style={{ backgroundColor: '#00357a' }}
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            Voir détails
                                        </button>
                                        <button
                                            onClick={() => handleExportPDF(program.id)}
                                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                            title="Télécharger PDF"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Statistiques */}
                {programs.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        <Card>
                            <CardBody className="text-center">
                                <Dumbbell className="w-8 h-8 mx-auto mb-2" style={{ color: '#9b0e16' }} />
                                <Typography variant="h4" style={{ color: '#00357a' }}>
                                    {programs.length}
                                </Typography>
                                <Typography variant="small" className="text-gray-600">
                                    Programme(s) total
                                </Typography>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardBody className="text-center">
                                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
                                <Typography variant="h4" style={{ color: '#00357a' }}>
                                    {programs.filter(p => p.status === 'active').length}
                                </Typography>
                                <Typography variant="small" className="text-gray-600">
                                    Programme(s) actif(s)
                                </Typography>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardBody className="text-center">
                                <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                                <Typography variant="h4" style={{ color: '#00357a' }}>
                                    {programs.reduce((sum, p) => sum + (p.workout_sessions?.length || 0), 0)}
                                </Typography>
                                <Typography variant="small" className="text-gray-600">
                                    Session(s) totale(s)
                                </Typography>
                            </CardBody>
                        </Card>
                    </div>
                )}
            </div>
    );
};

export default MemberPrograms;