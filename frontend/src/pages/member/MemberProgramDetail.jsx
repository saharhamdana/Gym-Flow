// frontend/src/pages/member/MemberProgramDetail.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MemberLayout from '../../components/member/MemberLayout';
import { Card, CardBody, Typography, Chip } from "@material-tailwind/react";
import {
    User, Calendar, Target, Clock, Dumbbell,
    ArrowLeft, Download, ChevronDown, ChevronUp
} from 'lucide-react';
import api from '../../api/axiosInstance';

const MemberProgramDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [program, setProgram] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedWeeks, setExpandedWeeks] = useState({});

    useEffect(() => {
        fetchProgramDetail();
    }, [id]);

    const fetchProgramDetail = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/coaching/member/programs/${id}/`);
            setProgram(response.data);

            // Expand all weeks by default
            if (response.data.workout_sessions) {
                const weeks = {};
                response.data.workout_sessions.forEach(session => {
                    weeks[session.week_number] = true;
                });
                setExpandedWeeks(weeks);
            }
        } catch (err) {
            console.error('Erreur:', err);
            setError('Programme non trouvé');
        } finally {
            setLoading(false);
        }
    };

    const toggleWeek = (weekNum) => {
        setExpandedWeeks(prev => ({
            ...prev,
            [weekNum]: !prev[weekNum]
        }));
    };

    const handleExportPDF = async () => {
        try {
            const response = await api.get(`/coaching/programs/${id}/export_pdf/`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `programme-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erreur export PDF:', error);
            alert('Erreur lors de l\'export PDF');
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

    const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

    // Organiser sessions par semaine
    const sessionsByWeek = program?.workout_sessions?.reduce((acc, session) => {
        const week = session.week_number;
        if (!acc[week]) acc[week] = [];
        acc[week].push(session);
        return acc;
    }, {}) || {};

    if (loading) {
        return (

            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>

        );
    }

    if (error || !program) {
        return (

            <div className="text-center py-12">
                <Typography variant="h5" className="text-red-500 mb-4">
                    {error || 'Programme non trouvé'}
                </Typography>
                <button
                    onClick={() => navigate('/portal/programs')}
                    className="text-white px-6 py-2 rounded-lg hover:opacity-90"
                    style={{ backgroundColor: '#00357a' }}
                >
                    Retour aux programmes
                </button>
            </div>

        );
    }

    return (

        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/portal/programs')}
                    className="flex items-center text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Retour
                </button>
                <button
                    onClick={handleExportPDF}
                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger PDF
                </button>
            </div>

            {/* Titre et statut */}
            <Card>
                <CardBody>
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <Typography variant="h3" style={{ color: '#00357a' }} className="mb-2">
                                {program.title}
                            </Typography>
                            <Typography className="text-gray-600">
                                {program.description}
                            </Typography>
                        </div>
                        <Chip
                            value={getStatusLabel(program.status)}
                            color={getStatusColor(program.status)}
                        />
                    </div>

                    {/* Informations principales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                            <User className="w-8 h-8 mr-3" style={{ color: '#9b0e16' }} />
                            <div>
                                <Typography variant="small" className="text-gray-600">
                                    Coach
                                </Typography>
                                <Typography className="font-semibold">
                                    {program.coach_name || 'Non assigné'}
                                </Typography>
                            </div>
                        </div>

                        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                            <Calendar className="w-8 h-8 mr-3" style={{ color: '#9b0e16' }} />
                            <div>
                                <Typography variant="small" className="text-gray-600">
                                    Dates
                                </Typography>
                                <Typography className="font-semibold text-sm">
                                    {new Date(program.start_date).toLocaleDateString('fr-FR')} -
                                    {new Date(program.end_date).toLocaleDateString('fr-FR')}
                                </Typography>
                            </div>
                        </div>

                        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                            <Clock className="w-8 h-8 mr-3" style={{ color: '#9b0e16' }} />
                            <div>
                                <Typography variant="small" className="text-gray-600">
                                    Durée
                                </Typography>
                                <Typography className="font-semibold">
                                    {program.duration_weeks} semaines
                                </Typography>
                            </div>
                        </div>

                        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                            <Dumbbell className="w-8 h-8 mr-3" style={{ color: '#9b0e16' }} />
                            <div>
                                <Typography variant="small" className="text-gray-600">
                                    Sessions
                                </Typography>
                                <Typography className="font-semibold">
                                    {program.workout_sessions?.length || 0}
                                </Typography>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Objectif */}
            {program.goal && (
                <Card>
                    <CardBody>
                        <div className="flex items-start">
                            <Target className="w-6 h-6 mr-3 mt-1" style={{ color: '#9b0e16' }} />
                            <div className="flex-1">
                                <Typography variant="h6" className="mb-2" style={{ color: '#00357a' }}>
                                    Objectif du programme
                                </Typography>
                                <Typography className="text-gray-700">
                                    {program.goal}
                                </Typography>
                            </div>
                        </div>

                        {(program.target_weight || program.target_body_fat) && (
                            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                                {program.target_weight && (
                                    <div>
                                        <Typography variant="small" className="text-gray-600">
                                            Poids cible
                                        </Typography>
                                        <Typography className="font-semibold text-lg" style={{ color: '#00357a' }}>
                                            {program.target_weight} kg
                                        </Typography>
                                    </div>
                                )}
                                {program.target_body_fat && (
                                    <div>
                                        <Typography variant="small" className="text-gray-600">
                                            Masse grasse cible
                                        </Typography>
                                        <Typography className="font-semibold text-lg" style={{ color: '#00357a' }}>
                                            {program.target_body_fat}%
                                        </Typography>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardBody>
                </Card>
            )}

            {/* Sessions d'entraînement */}
            <Card>
                <CardBody>
                    <Typography variant="h5" className="mb-4" style={{ color: '#00357a' }}>
                        Sessions d'entraînement
                    </Typography>

                    {Object.keys(sessionsByWeek).length === 0 ? (
                        <Typography className="text-gray-600 text-center py-8">
                            Aucune session d'entraînement
                        </Typography>
                    ) : (
                        <div className="space-y-4">
                            {Object.keys(sessionsByWeek).sort((a, b) => parseInt(a) - parseInt(b)).map(week => (
                                <div key={week} className="border border-gray-200 rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => toggleWeek(week)}
                                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                                    >
                                        <Typography className="font-semibold" style={{ color: '#00357a' }}>
                                            Semaine {week}
                                        </Typography>
                                        {expandedWeeks[week] ? (
                                            <ChevronUp className="w-5 h-5" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5" />
                                        )}
                                    </button>

                                    {expandedWeeks[week] && (
                                        <div className="divide-y divide-gray-200">
                                            {sessionsByWeek[week].map((session, idx) => (
                                                <div key={idx} className="p-4">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div>
                                                            <Typography className="font-semibold text-gray-900">
                                                                {session.title}
                                                            </Typography>
                                                            <Typography variant="small" className="text-gray-600">
                                                                {dayNames[session.day_of_week - 1]} • {session.duration_minutes} min
                                                            </Typography>
                                                        </div>
                                                    </div>

                                                    {session.notes && (
                                                        <div className="mb-3 p-2 bg-yellow-50 rounded">
                                                            <Typography variant="small" className="text-gray-700">
                                                                📝 {session.notes}
                                                            </Typography>
                                                        </div>
                                                    )}

                                                    {/* Exercices */}
                                                    {session.exercises && session.exercises.length > 0 && (
                                                        <div className="space-y-2">
                                                            <Typography variant="small" className="font-semibold text-gray-700">
                                                                Exercices ({session.exercises.length})
                                                            </Typography>
                                                            {session.exercises.map((ex, exIdx) => (
                                                                <div key={exIdx} className="p-3 bg-gray-50 rounded-lg">
                                                                    <Typography className="font-medium text-gray-900 mb-1">
                                                                        {ex.exercise_name}
                                                                    </Typography>
                                                                    {ex.exercise_category && (
                                                                        <Typography variant="small" className="text-gray-600 mb-2">
                                                                            {ex.exercise_category}
                                                                        </Typography>
                                                                    )}
                                                                    <div className="flex flex-wrap gap-3 text-sm text-gray-700">
                                                                        <span>🔢 {ex.sets} séries</span>
                                                                        <span>🔁 {ex.reps} reps</span>
                                                                        {ex.weight && <span>⚖️ {ex.weight}</span>}
                                                                        <span>⏱️ {ex.rest_seconds}s repos</span>
                                                                    </div>
                                                                    {ex.notes && (
                                                                        <Typography variant="small" className="text-gray-600 mt-2 italic">
                                                                            💡 {ex.notes}
                                                                        </Typography>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Notes du coach */}
            {program.notes && (
                <Card>
                    <CardBody>
                        <Typography variant="h6" className="mb-3" style={{ color: '#00357a' }}>
                            Notes du coach
                        </Typography>
                        <Typography className="text-gray-700 whitespace-pre-wrap">
                            {program.notes}
                        </Typography>
                    </CardBody>
                </Card>
            )}
        </div>

    );
};

export default MemberProgramDetail;