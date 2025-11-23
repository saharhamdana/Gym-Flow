import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MemberLayout from '../../components/member/MemberLayout';
import { Card, CardBody, Typography, Button, Chip, Progress } from "@material-tailwind/react";
import { 
  Calendar, Clock, User, MapPin, Users, Star, PlayCircle,
  CheckCircle, XCircle, Filter
} from 'lucide-react';
import api from '../../api/axiosInstance';

const MemberCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, available, booked
  const [bookingLoading, setBookingLoading] = useState(null);

  useEffect(() => {
    fetchCourses();
    fetchMyBookings();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/bookings/courses/upcoming/');
      setCourses(response.data);
    } catch (error) {
      console.error('Erreur chargement cours:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const response = await api.get('/bookings/bookings/my_bookings/');
      setMyBookings(response.data);
    } catch (error) {
      console.error('Erreur chargement réservations:', error);
    }
  };

  const handleBookCourse = async (courseId) => {
    try {
      setBookingLoading(courseId);
      await api.post('/bookings/bookings/', { 
        course: courseId,
        notes: '' 
      });
      
      // Recharger les données
      await Promise.all([fetchCourses(), fetchMyBookings()]);
      
      alert('Réservation effectuée avec succès!');
    } catch (error) {
      console.error('Erreur réservation:', error);
      alert(error.response?.data?.detail || 'Erreur lors de la réservation');
    } finally {
      setBookingLoading(null);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      return;
    }

    try {
      setBookingLoading(bookingId);
      await api.post(`/bookings/bookings/${bookingId}/cancel/`);
      
      // Recharger les données
      await Promise.all([fetchCourses(), fetchMyBookings()]);
      
      alert('Réservation annulée avec succès');
    } catch (error) {
      console.error('Erreur annulation:', error);
      alert('Erreur lors de l\'annulation');
    } finally {
      setBookingLoading(null);
    }
  };

  // Vérifier si un cours est déjà réservé
  const isCourseBooked = (courseId) => {
    return myBookings.some(booking => 
      booking.course === courseId && 
      booking.status !== 'CANCELLED'
    );
  };

  // Obtenir la réservation pour un cours
  const getBookingForCourse = (courseId) => {
    return myBookings.find(booking => 
      booking.course === courseId && 
      booking.status !== 'CANCELLED'
    );
  };

  const filteredCourses = courses.filter(course => {
    const booked = isCourseBooked(course.id);
    
    if (filter === 'available') return !booked && !course.is_full;
    if (filter === 'booked') return booked;
    return true;
  });

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

  if (loading) {
    return (
    
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <Typography className="text-gray-600">Chargement des cours...</Typography>
          </div>
        </div>
     
    );
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
          <Typography variant="h3" color="white" className="mb-2">
            Cours Collectifs
          </Typography>
          <Typography className="text-blue-100">
            Découvrez et réservez vos cours collectifs
          </Typography>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-blue-500">
            <CardBody className="text-center p-4">
              <Calendar className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <Typography variant="h4" color="blue-gray">
                {courses.length}
              </Typography>
              <Typography variant="small" className="text-gray-600">
                Cours au total
              </Typography>
            </CardBody>
          </Card>

          <Card className="border-l-4 border-green-500">
            <CardBody className="text-center p-4">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <Typography variant="h4" color="blue-gray">
                {myBookings.filter(b => b.status === 'CONFIRMED').length}
              </Typography>
              <Typography variant="small" className="text-gray-600">
                Cours réservés
              </Typography>
            </CardBody>
          </Card>

          <Card className="border-l-4 border-purple-500">
            <CardBody className="text-center p-4">
              <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <Typography variant="h4" color="blue-gray">
                {courses.filter(c => !c.is_full && !isCourseBooked(c.id)).length}
              </Typography>
              <Typography variant="small" className="text-gray-600">
                Places disponibles
              </Typography>
            </CardBody>
          </Card>

          <Card className="border-l-4 border-orange-500">
            <CardBody className="text-center p-4">
              <Star className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <Typography variant="h4" color="blue-gray">
                {courses.filter(c => c.difficulty_level >= 4).length}
              </Typography>
              <Typography variant="small" className="text-gray-600">
                Cours avancés
              </Typography>
            </CardBody>
          </Card>
        </div>

        {/* Filtres */}
        <Card>
          <CardBody>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-600" />
                <Typography variant="h5" style={{ color: '#00357a' }}>
                  Cours disponibles
                </Typography>
                <Chip
                  value={`${filteredCourses.length} cours`}
                  color="blue"
                  size="sm"
                />
              </div>
              <div className="flex space-x-2">
                {[
                  { value: 'all', label: 'Tous' },
                  { value: 'available', label: 'Disponibles' },
                  { value: 'booked', label: 'Mes réservations' }
                ].map(({ value, label }) => (
                  <Button
                    key={value}
                    size="sm"
                    variant={filter === value ? "filled" : "outlined"}
                    color={filter === value ? "blue" : "gray"}
                    onClick={() => setFilter(value)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Liste des cours */}
        {filteredCourses.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <Typography variant="h6" className="mb-2" style={{ color: '#00357a' }}>
                {filter === 'booked' 
                  ? "Aucune réservation" 
                  : "Aucun cours disponible"
                }
              </Typography>
              <Typography className="text-gray-600 mb-4">
                {filter === 'booked' 
                  ? "Vous n'avez réservé aucun cours pour le moment"
                  : "Aucun cours ne correspond à vos critères"
                }
              </Typography>
              {filter !== 'available' && (
                <Button 
                  color="blue"
                  onClick={() => setFilter('available')}
                >
                  Voir les cours disponibles
                </Button>
              )}
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const isBooked = isCourseBooked(course.id);
              const booking = getBookingForCourse(course.id);

              return (
                <Card key={course.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardBody className="p-6">
                    {/* En-tête */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <Typography variant="h6" color="blue-gray" className="mb-1">
                          {course.title}
                        </Typography>
                        <Typography variant="small" color="gray" className="mb-2">
                          {course.course_type_name}
                        </Typography>
                        <div className="flex items-center gap-2">
                          <Chip
                            value={`Niveau ${course.difficulty_level}/5`}
                            color={
                              course.difficulty_level <= 2 ? "green" :
                              course.difficulty_level <= 4 ? "blue" : "red"
                            }
                            size="sm"
                          />
                          {isBooked && (
                            <Chip
                              value="Réservé"
                              color="green"
                              size="sm"
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Informations du cours */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>
                          {new Date(course.date).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{course.start_time} - {course.end_time}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="w-4 h-4 mr-2" />
                        <span>Coach: {course.coach_name}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{course.room_name}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Star className="w-4 h-4 mr-2 text-yellow-500" />
                        <span>Difficulté: {course.difficulty_level}/5</span>
                      </div>
                    </div>

                    {/* Barre de progression places */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <Typography variant="small" color="gray">
                          Places disponibles
                        </Typography>
                        <Typography variant="small" color="gray">
                          {course.available_spots}/{course.max_participants}
                        </Typography>
                      </div>
                      <Progress
                        value={(course.available_spots / course.max_participants) * 100}
                        color={
                          course.available_spots > course.max_participants * 0.3 ? "green" :
                          course.available_spots > 0 ? "amber" : "red"
                        }
                        className="h-2"
                      />
                    </div>

                    {/* Actions */}
                    {isBooked ? (
                      <div className="space-y-2">
                        {booking && (
                          <Chip
                            value={getStatusLabel(booking.status)}
                            color={getStatusColor(booking.status)}
                            className="w-full justify-center"
                            icon={<CheckCircle className="h-4 w-4" />}
                          />
                        )}
                        {booking && booking.status === 'CONFIRMED' && (
                          <Button
                            fullWidth
                            color="red"
                            variant="outlined"
                            size="sm"
                            disabled={bookingLoading === booking.id}
                            onClick={() => handleCancelBooking(booking.id)}
                          >
                            {bookingLoading === booking.id ? 'Annulation...' : 'Annuler'}
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Button
                        fullWidth
                        color="blue"
                        disabled={course.is_full || bookingLoading === course.id}
                        onClick={() => handleBookCourse(course.id)}
                        className="flex items-center justify-center gap-2"
                      >
                        {bookingLoading === course.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Réservation...
                          </>
                        ) : course.is_full ? (
                          <>
                            <XCircle className="h-4 w-4" />
                            Complet
                          </>
                        ) : (
                          <>
                            <PlayCircle className="h-4 w-4" />
                            Réserver
                          </>
                        )}
                      </Button>
                    )}
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}

        {/* Informations supplémentaires */}
        <Card className="bg-blue-50 border border-blue-200">
          <CardBody>
            <Typography variant="h6" className="mb-3" style={{ color: '#00357a' }}>
              💡 Informations importantes
            </Typography>
            <div className="space-y-2 text-sm text-gray-700">
              <p>• Annulation possible jusqu'à 2 heures avant le cours</p>
              <p>• Présence requise 10 minutes avant le début du cours</p>
              <p>• Tenue sportive adaptée obligatoire</p>
              <p>• Bouteille d'eau recommandée</p>
            </div>
          </CardBody>
        </Card>
      </div>
  );
};

export default MemberCourses;