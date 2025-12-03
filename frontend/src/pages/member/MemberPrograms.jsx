// frontend/src/pages/member/MemberPrograms.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MemberLayout from '../../components/member/MemberLayout';
import { Card, CardBody, Typography, Button, Chip, Progress } from "@material-tailwind/react";
import { 
  CalendarDaysIcon, UserIcon, ClockIcon, 
  DocumentTextIcon, ArrowDownTrayIcon, EyeIcon,
  CheckCircleIcon, ExclamationCircleIcon, ChartBarIcon
} from "@heroicons/react/24/solid";
import api from '../../api/axiosInstance';

const MemberPrograms = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await api.get('/coaching/member/my-programs/');
      console.log('📋 Programmes chargés:', response.data);
      setPrograms(response.data);
    } catch (error) {
      console.error('❌ Erreur chargement programmes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async (programId, programTitle) => {
    try {
      setDownloadingId(programId);
      const response = await api.get(`/coaching/programs/${programId}/export_pdf/`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Programme_${programTitle}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('❌ Erreur export PDF:', error);
      alert('Erreur lors de l\'export PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'draft': 'gray',
      'active': 'green',
      'completed': 'blue',
      'archived': 'gray'
    };
    return colors[status] || 'gray';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'draft': 'Brouillon',
      'active': 'Actif',
      'completed': 'Terminé',
      'archived': 'Archivé'
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-blue-600" />;
      case 'draft':
        return <DocumentTextIcon className="h-5 w-5 text-gray-600" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <MemberLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <Typography className="text-gray-600">Chargement...</Typography>
          </div>
        </div>
      </MemberLayout>
    );
  }

  const activePrograms = programs.filter(p => p.status === 'active');
  const completedPrograms = programs.filter(p => p.status === 'completed');

  return (
    <MemberLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
          <Typography variant="h3" color="white" className="mb-2">
            Mes Programmes d'Entraînement
          </Typography>
          <Typography className="text-blue-100">
            Consultez vos programmes personnalisés créés par votre coach
          </Typography>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-blue-500">
            <CardBody className="flex items-center gap-4 p-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <Typography variant="h4" color="blue-gray">
                  {programs.length}
                </Typography>
                <Typography variant="small" color="gray">
                  Programme(s) total
                </Typography>
              </div>
            </CardBody>
          </Card>

          <Card className="border-l-4 border-green-500">
            <CardBody className="flex items-center gap-4 p-4">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <Typography variant="h4" color="blue-gray">
                  {activePrograms.length}
                </Typography>
                <Typography variant="small" color="gray">
                  Programme(s) actif(s)
                </Typography>
              </div>
            </CardBody>
          </Card>

          <Card className="border-l-4 border-purple-500">
            <CardBody className="flex items-center gap-4 p-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <Typography variant="h4" color="blue-gray">
                  {programs.reduce((sum, p) => sum + (p.workout_sessions?.length || 0), 0)}
                </Typography>
                <Typography variant="small" color="gray">
                  Session(s) totale(s)
                </Typography>
              </div>
            </CardBody>
          </Card>

          <Card className="border-l-4 border-amber-500">
            <CardBody className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <ClockIcon className="h-6 w-6 text-amber-600" />
                <Typography variant="small" color="gray">
                  Progression moyenne
                </Typography>
              </div>
              <Typography variant="h4" style={{ color: '#00357a' }}>
                {activePrograms.length > 0 ? '75%' : '0%'}
              </Typography>
            </CardBody>
          </Card>
        </div>

        {/* Liste des programmes */}
        {programs.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <Typography variant="h6" className="mb-2" style={{ color: '#00357a' }}>
                Aucun programme disponible
              </Typography>
              <Typography className="text-gray-600">
                Votre coach n'a pas encore créé de programme pour vous.
              </Typography>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4">
            {programs.map((program) => (
              <Card key={program.id} className="border border-gray-200 hover:shadow-lg transition-shadow">
                <CardBody>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Info programme */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          {getStatusIcon(program.status)}
                        </div>
                        <div>
                          <Typography variant="h6" color="blue-gray">
                            {program.title}
                          </Typography>
                          <div className="flex items-center gap-2 mt-1">
                            <Chip
                              value={getStatusLabel(program.status)}
                              color={getStatusColor(program.status)}
                              size="sm"
                              icon={getStatusIcon(program.status)}
                            />
                            {program.goal && (
                              <Chip
                                value={program.goal}
                                color="blue"
                                size="sm"
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Détails */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <Typography variant="small" className="text-gray-600 flex items-center gap-1">
                            <UserIcon className="h-4 w-4" />
                            Coach
                          </Typography>
                          <Typography className="font-semibold">
                            {program.coach_name || 'Non assigné'}
                          </Typography>
                        </div>

                        <div>
                          <Typography variant="small" className="text-gray-600 flex items-center gap-1">
                            <CalendarDaysIcon className="h-4 w-4" />
                            Période
                          </Typography>
                          <Typography className="font-semibold">
                            {new Date(program.start_date).toLocaleDateString('fr-FR')} - {' '}
                            {new Date(program.end_date).toLocaleDateString('fr-FR')}
                          </Typography>
                        </div>

                        <div>
                          <Typography variant="small" className="text-gray-600 flex items-center gap-1">
                            <ClockIcon className="h-4 w-4" />
                            Durée
                          </Typography>
                          <Typography className="font-semibold">
                            {program.duration_weeks} semaines
                          </Typography>
                        </div>

                        <div>
                          <Typography variant="small" className="text-gray-600 flex items-center gap-1">
                            <ChartBarIcon className="h-4 w-4" />
                            Sessions
                          </Typography>
                          <Typography className="font-bold text-lg" style={{ color: '#00357a' }}>
                            {program.workout_sessions?.length || 0}
                          </Typography>
                        </div>
                      </div>

                      {/* Description */}
                      {program.description && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <Typography variant="small" className="text-gray-600">
                            {program.description}
                          </Typography>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 md:w-48">
                      <Button
                        size="sm"
                        className="flex items-center justify-center gap-2"
                        style={{ backgroundColor: '#00357a' }}
                        onClick={() => navigate(`/portal/programs/${program.id}`)}
                      >
                        <EyeIcon className="h-4 w-4" />
                        Voir détails
                      </Button>

                      <Button
                        size="sm"
                        variant="outlined"
                        className="flex items-center justify-center gap-2"
                        onClick={() => handleExportPDF(program.id, program.title)}
                        disabled={downloadingId === program.id}
                      >
                        {downloadingId === program.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            Téléchargement...
                          </>
                        ) : (
                          <>
                            <ArrowDownTrayIcon className="h-4 w-4" />
                            Télécharger PDF
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {/* Informations */}
        <Card className="bg-blue-50 border border-blue-200">
          <CardBody>
            <Typography variant="h6" className="mb-3" style={{ color: '#00357a' }}>
              💪 Informations importantes
            </Typography>
            <div className="space-y-2 text-sm text-gray-700">
              <p>• Les programmes sont créés et supervisés par votre coach personnel</p>
              <p>• Suivez régulièrement votre progression dans l'onglet "Mon Progrès"</p>
              <p>• Contactez votre coach pour toute modification du programme</p>
              <p>• Téléchargez vos programmes pour les consulter hors ligne</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </MemberLayout>
  );
};

export default MemberPrograms;