// Fichier: frontend/src/pages/receptionist/checkin/CheckIn.jsx

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  Typography,
  Button,
  Input,
  Chip,
  Avatar,
  Alert,
  Badge,
} from "@material-tailwind/react";
import {
  QrCodeIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserGroupIcon,
  PlayCircleIcon,
} from "@heroicons/react/24/solid";
import api from '@/api/axiosInstance';

const CheckIn = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [stats, setStats] = useState({
    todayCheckins: 0,
    currentlyPresent: 0,
    ongoingCourses: 0
  });

  // Charger les statistiques au montage
  useEffect(() => {
    fetchStats();
  }, []);

  // Recherche des membres
  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchMembers();
    } else {
      setMembers([]);
    }
  }, [searchTerm]);

  const fetchStats = async () => {
    try {
      const response = await api.get('bookings/receptionist/checkin-stats/');
      setStats(response.data);
    } catch (err) {
      console.error("Erreur chargement stats:", err);
    }
  };

  const searchMembers = async () => {
    try {
      setLoading(true);
      const response = await api.get(`bookings/receptionist/search-member/?q=${searchTerm}`);
      setMembers(response.data.results || []);
    } catch (err) {
      console.error("Erreur recherche membres:", err);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (memberId, courseId) => {
    try {
      const response = await api.post('bookings/check-in/quick/', {
        member_id: memberId,
        course_id: courseId
      });

      setMessage({
        type: 'success',
        text: response.data.message
      });

      // Recharger les données
      searchMembers();
      fetchStats(); // Mettre à jour les statistiques
      
      // Auto-supprimer le message après 3 secondes
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.error || 'Erreur lors du check-in'
      });
    }
  };

  const handleManualCheckIn = async (memberId) => {
    try {
      const response = await api.post('bookings/check-in/manual/', {
        member_id: memberId
      });

      setMessage({
        type: 'success',
        text: response.data.message || 'Check-in manuel réussi'
      });

      searchMembers();
      fetchStats();
      
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.error || 'Erreur lors du check-in manuel'
      });
    }
  };

  const getSubscriptionStatus = (member) => {
    if (!member.has_active_subscription) {
      return { label: 'Abonnement inactif', color: 'red' };
    }
    
    if (member.subscription_expires_soon) {
      return { label: 'Expire bientôt', color: 'orange' };
    }
    
    return { label: 'Abonnement actif', color: 'green' };
  };

  const getCourseStatus = (course) => {
    const now = new Date();
    const courseTime = new Date(`${course.date} ${course.start_time}`);
    const endTime = new Date(`${course.date} ${course.end_time}`);
    
    if (now < courseTime) return { label: 'À venir', color: 'blue' };
    if (now > endTime) return { label: 'Terminé', color: 'gray' };
    return { label: 'En cours', color: 'green' };
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h3" color="blue-gray" className="font-bold">
            Check-in des Membres
          </Typography>
          <Typography className="text-gray-600">
            Scan QR code ou recherche manuelle
          </Typography>
        </div>
        <Badge content={stats.currentlyPresent} withBorder>
          <Button 
            color="blue" 
            className="flex items-center gap-2"
            onClick={() => document.getElementById('qr-scanner').click()}
          >
            <QrCodeIcon className="h-5 w-5" />
            Scanner QR Code
          </Button>
        </Badge>
      </div>

      {/* Message d'alerte */}
      {message && (
        <Alert 
          color={message.type === 'success' ? 'green' : 'red'} 
          className="mb-4 animate-fade-in"
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}

      {/* Statistiques en temps réel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-md border-l-4 border-l-blue-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h3" color="blue-gray" className="font-bold">
                  {stats.todayCheckins}
                </Typography>
                <Typography variant="small" className="text-gray-600">
                  Check-ins aujourd'hui
                </Typography>
              </div>
              <div className="rounded-full p-3 bg-blue-100 text-blue-600">
                <CheckCircleIcon className="h-6 w-6" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-md border-l-4 border-l-green-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h3" color="blue-gray" className="font-bold">
                  {stats.currentlyPresent}
                </Typography>
                <Typography variant="small" className="text-gray-600">
                  Présents actuellement
                </Typography>
              </div>
              <div className="rounded-full p-3 bg-green-100 text-green-600">
                <UserGroupIcon className="h-6 w-6" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-md border-l-4 border-l-orange-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h3" color="blue-gray" className="font-bold">
                  {stats.ongoingCourses}
                </Typography>
                <Typography variant="small" className="text-gray-600">
                  Cours en cours
                </Typography>
              </div>
              <div className="rounded-full p-3 bg-orange-100 text-orange-600">
                <PlayCircleIcon className="h-6 w-6" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recherche */}
      <Card className="shadow-md">
        <CardBody className="p-6">
          <div className="mb-6">
            <Input
              label="Rechercher un membre (nom, ID, email, téléphone)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              className="text-lg"
            />
          </div>

          {/* Résultats de recherche */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <ClockIcon className="w-6 h-6 animate-spin text-blue-500 mr-2" />
              <Typography className="text-gray-600">Recherche en cours...</Typography>
            </div>
          )}

          {members.length > 0 && (
            <div className="space-y-4">
              <Typography variant="h6" color="blue-gray" className="font-semibold">
                {members.length} membre(s) trouvé(s)
              </Typography>
              
              {members.map(member => {
                const subscriptionStatus = getSubscriptionStatus(member);
                
                return (
                  <Card key={member.id} className="border border-gray-200 hover:border-blue-300 transition-colors">
                    <CardBody className="p-6">
                      {/* En-tête membre */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <Avatar
                            src={member.photo || '/img/default-avatar.png'}
                            alt={member.full_name}
                            size="lg"
                            className="border-2 border-gray-200"
                          />
                          <div>
                            <Typography variant="h5" className="font-bold">
                              {member.full_name}
                            </Typography>
                            <Typography variant="small" className="text-gray-600">
                              ID: {member.member_id} • {member.email}
                            </Typography>
                            {member.phone && (
                              <Typography variant="small" className="text-gray-600">
                                📞 {member.phone}
                              </Typography>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <Chip
                            value={subscriptionStatus.label}
                            color={subscriptionStatus.color}
                            size="sm"
                          />
                          {member.is_checked_in && (
                            <Chip
                              value="Actuellement présent"
                              color="green"
                              size="sm"
                              icon={<CheckCircleIcon className="h-4 w-4" />}
                            />
                          )}
                        </div>
                      </div>

                      {/* Cours du jour */}
                      <div className="border-t pt-4">
                        {member.today_bookings && member.today_bookings.length > 0 ? (
                          <div className="space-y-3">
                            <Typography variant="small" className="font-semibold text-gray-700 uppercase">
                              Cours réservés aujourd'hui:
                            </Typography>
                            {member.today_bookings.map(booking => {
                              const courseStatus = getCourseStatus(booking);
                              
                              return (
                                <div
                                  key={booking.id}
                                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <Typography variant="h6" className="font-semibold">
                                        {booking.course_title}
                                      </Typography>
                                      <Chip
                                        value={courseStatus.label}
                                        color={courseStatus.color}
                                        size="sm"
                                      />
                                    </div>
                                    <Typography variant="small" className="text-gray-600">
                                      🕐 {booking.start_time} - {booking.end_time}
                                    </Typography>
                                    {booking.instructor && (
                                      <Typography variant="small" className="text-gray-600">
                                        👤 {booking.instructor}
                                      </Typography>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-3">
                                    {booking.checked_in ? (
                                      <Chip
                                        value="Check-in effectué"
                                        color="green"
                                        size="sm"
                                        icon={<CheckCircleIcon className="h-4 w-4" />}
                                      />
                                    ) : courseStatus.color === 'blue' ? (
                                      <Typography variant="small" className="text-gray-500">
                                        Check-in disponible à {booking.start_time}
                                      </Typography>
                                    ) : courseStatus.color === 'gray' ? (
                                      <Chip
                                        value="Cours terminé"
                                        color="gray"
                                        size="sm"
                                      />
                                    ) : (
                                      <Button
                                        size="sm"
                                        color="green"
                                        onClick={() => handleCheckIn(member.member_id, booking.course_id)}
                                        disabled={!member.has_active_subscription}
                                      >
                                        Check-in
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <CalendarDaysIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <Typography className="text-gray-500 mb-3">
                              Aucun cours réservé aujourd'hui
                            </Typography>
                            {member.has_active_subscription && (
                              <Button
                                size="sm"
                                color="blue"
                                variant="outlined"
                                onClick={() => handleManualCheckIn(member.member_id)}
                              >
                                Check-in manuel
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          )}

          {searchTerm.length >= 2 && members.length === 0 && !loading && (
            <div className="text-center py-12">
              <MagnifyingGlassIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <Typography variant="h6" color="gray" className="mb-2">
                Aucun membre trouvé
              </Typography>
              <Typography className="text-gray-500">
                Aucun résultat pour "{searchTerm}". Vérifiez l'orthographe ou essayez d'autres termes.
              </Typography>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Scanner QR Code (caché pour l'instant) */}
      <input type="file" id="qr-scanner" accept="image/*" capture="environment" className="hidden" />
    </div>
  );
};

export default CheckIn;