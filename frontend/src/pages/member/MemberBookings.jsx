// frontend/src/pages/member/MemberBookings.jsx

import React, { useState, useEffect } from 'react';
import MemberLayout from '../../components/member/MemberLayout';
import { Card, CardBody, Typography, Button, Chip, Tabs, TabsHeader, TabsBody, Tab, TabPanel } from "@material-tailwind/react";
import { 
  CalendarDaysIcon, ClockIcon, UserIcon, MapPinIcon,
  CheckCircleIcon, XCircleIcon, ExclamationCircleIcon
} from "@heroicons/react/24/solid";
import api from '../../api/axiosInstance';

const MemberBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, coursesRes] = await Promise.all([
        api.get('/bookings/bookings/my_bookings/'),
        api.get('/bookings/courses/upcoming/')
      ]);
      
      setBookings(bookingsRes.data);
      setCourses(coursesRes.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      return;
    }

    setCancellingId(bookingId);
    try {
      await api.post(`/bookings/bookings/${bookingId}/cancel/`);
      await fetchData();
      alert('Réservation annulée avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'annulation');
    } finally {
      setCancellingId(null);
    }
  };

  const handleBookCourse = async (courseId) => {
    try {
      await api.post('/bookings/bookings/', {
        course: courseId,
        notes: ''
      });
      await fetchData();
      alert('Réservation effectuée avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      alert(error.response?.data?.detail || 'Erreur lors de la réservation');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'CONFIRMED': 'green',
      'PENDING': 'amber',
      'CANCELLED': 'red',
      'COMPLETED': 'blue',
      'NO_SHOW': 'gray'
    };
    return colors[status] || 'gray';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'CONFIRMED': 'Confirmé',
      'PENDING': 'En attente',
      'CANCELLED': 'Annulé',
      'COMPLETED': 'Complété',
      'NO_SHOW': 'Absent'
    };
    return labels[status] || status;
  };

  const upcomingBookings = bookings.filter(b => 
    ['CONFIRMED', 'PENDING'].includes(b.status) && 
    new Date(b.course_date) >= new Date()
  );

  const pastBookings = bookings.filter(b => 
    new Date(b.course_date) < new Date() || 
    ['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(b.status)
  );

  if (loading) {
    return (
     
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    
    );
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
          <Typography variant="h3" color="white" className="mb-2">
            Mes Réservations
          </Typography>
          <Typography className="text-blue-100">
            Gérez vos réservations de cours et découvrez les cours disponibles
          </Typography>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-green-500">
            <CardBody className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <Typography variant="h4" color="blue-gray">
                  {upcomingBookings.length}
                </Typography>
                <Typography variant="small" color="gray">
                  Réservations à venir
                </Typography>
              </div>
            </CardBody>
          </Card>

          <Card className="border-l-4 border-blue-500">
            <CardBody className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <CalendarDaysIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <Typography variant="h4" color="blue-gray">
                  {courses.length}
                </Typography>
                <Typography variant="small" color="gray">
                  Cours disponibles
                </Typography>
              </div>
            </CardBody>
          </Card>

          <Card className="border-l-4 border-purple-500">
            <CardBody className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <CheckCircleIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <Typography variant="h4" color="blue-gray">
                  {bookings.filter(b => b.status === 'COMPLETED').length}
                </Typography>
                <Typography variant="small" color="gray">
                  Séances complétées
                </Typography>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Onglets */}
        <Card>
          <CardBody>
            <Tabs value={activeTab}>
              <TabsHeader
                className="rounded-none border-b border-blue-gray-50 bg-transparent p-0"
                indicatorProps={{
                  className: "bg-transparent border-b-2 border-blue-600 shadow-none rounded-none",
                }}
              >
                <Tab
                  value="upcoming"
                  onClick={() => setActiveTab("upcoming")}
                  className={activeTab === "upcoming" ? "text-blue-600" : ""}
                >
                  <div className="flex items-center gap-2">
                    <CalendarDaysIcon className="h-5 w-5" />
                    À venir ({upcomingBookings.length})
                  </div>
                </Tab>
                <Tab
                  value="available"
                  onClick={() => setActiveTab("available")}
                  className={activeTab === "available" ? "text-blue-600" : ""}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5" />
                    Cours disponibles ({courses.length})
                  </div>
                </Tab>
                <Tab
                  value="history"
                  onClick={() => setActiveTab("history")}
                  className={activeTab === "history" ? "text-blue-600" : ""}
                >
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-5 w-5" />
                    Historique ({pastBookings.length})
                  </div>
                </Tab>
              </TabsHeader>

              <TabsBody>
                {/* Onglet Réservations à venir */}
                <TabPanel value="upcoming">
                  {upcomingBookings.length === 0 ? (
                    <div className="text-center py-12">
                      <CalendarDaysIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <Typography variant="h6" color="gray" className="mb-2">
                        Aucune réservation à venir
                      </Typography>
                      <Typography variant="small" color="gray" className="mb-4">
                        Découvrez nos cours disponibles et réservez votre place
                      </Typography>
                      <Button 
                        color="blue"
                        onClick={() => setActiveTab("available")}
                      >
                        Voir les cours disponibles
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {upcomingBookings.map((booking) => (
                        <Card key={booking.id} className="border border-blue-100 hover:shadow-lg transition-shadow">
                          <CardBody>
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <Typography variant="h6" color="blue-gray">
                                      {booking.course_title}
                                    </Typography>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      <Chip
                                        value={getStatusLabel(booking.status)}
                                        color={getStatusColor(booking.status)}
                                        size="sm"
                                      />
                                      {booking.checked_in && (
                                        <Chip
                                          value="Présence confirmée"
                                          color="green"
                                          size="sm"
                                          icon={<CheckCircleIcon className="h-4 w-4" />}
                                        />
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <CalendarDaysIcon className="h-4 w-4" />
                                    <span>
                                      {new Date(booking.course_date).toLocaleDateString('fr-FR', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                      })}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <ClockIcon className="h-4 w-4" />
                                    <span>{booking.course_start_time}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex flex-col gap-2">
                                <Typography variant="small" className="text-gray-600 text-right">
                                  Réservé le {new Date(booking.booking_date).toLocaleDateString('fr-FR')}
                                </Typography>
                                {booking.status === 'CONFIRMED' && (
                                  <Button
                                    size="sm"
                                    color="red"
                                    variant="outlined"
                                    onClick={() => handleCancelBooking(booking.id)}
                                    disabled={cancellingId === booking.id}
                                  >
                                    {cancellingId === booking.id ? 'Annulation...' : 'Annuler'}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabPanel>

                {/* Onglet Cours disponibles */}
                <TabPanel value="available">
                  {courses.length === 0 ? (
                    <div className="text-center py-12">
                      <ExclamationCircleIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <Typography variant="h6" color="gray">
                        Aucun cours disponible pour le moment
                      </Typography>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {courses.map((course) => (
                        <Card key={course.id} className="border border-gray-200 hover:shadow-lg transition-shadow">
                          <CardBody>
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <Typography variant="h6" color="blue-gray">
                                  {course.title}
                                </Typography>
                                <Typography variant="small" color="gray">
                                  {course.course_type_name}
                                </Typography>
                              </div>
                              <Chip
                                value={`${course.available_spots}/${course.max_participants} places`}
                                color={course.is_full ? "red" : "green"}
                                size="sm"
                              />
                            </div>
                            
                            <div className="space-y-2 mb-4">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <CalendarDaysIcon className="h-4 w-4" />
                                {new Date(course.date).toLocaleDateString('fr-FR', {
                                  weekday: 'long',
                                  day: 'numeric',
                                  month: 'long'
                                })}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <ClockIcon className="h-4 w-4" />
                                {course.start_time} - {course.end_time}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <UserIcon className="h-4 w-4" />
                                Coach: {course.coach_name}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPinIcon className="h-4 w-4" />
                                {course.room_name}
                              </div>
                            </div>
                            
                            <Button
                              fullWidth
                              color="blue"
                              disabled={course.is_full || bookings.some(b => b.course === course.id && b.status !== 'CANCELLED')}
                              onClick={() => handleBookCourse(course.id)}
                            >
                              {course.is_full ? 'Complet' : 
                               bookings.some(b => b.course === course.id && b.status !== 'CANCELLED') ? 'Déjà réservé' : 
                               'Réserver'}
                            </Button>
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabPanel>

                {/* Onglet Historique */}
                <TabPanel value="history">
                  {pastBookings.length === 0 ? (
                    <div className="text-center py-12">
                      <ClockIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <Typography variant="h6" color="gray">
                        Aucun historique
                      </Typography>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pastBookings.map((booking) => (
                        <div 
                          key={booking.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-full ${
                              booking.status === 'COMPLETED' ? 'bg-green-100' :
                              booking.status === 'CANCELLED' ? 'bg-red-100' :
                              'bg-gray-100'
                            }`}>
                              {booking.status === 'COMPLETED' ? (
                                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                              ) : (
                                <XCircleIcon className="h-5 w-5 text-red-600" />
                              )}
                            </div>
                            <div>
                              <Typography variant="small" className="font-semibold">
                                {booking.course_title}
                              </Typography>
                              <Typography variant="small" color="gray">
                                {new Date(booking.course_date).toLocaleDateString('fr-FR')} à {booking.course_start_time}
                              </Typography>
                            </div>
                          </div>
                          <Chip
                            value={getStatusLabel(booking.status)}
                            color={getStatusColor(booking.status)}
                            size="sm"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </TabPanel>
              </TabsBody>
            </Tabs>
          </CardBody>
        </Card>
      </div>
  );
};

export default MemberBookings;