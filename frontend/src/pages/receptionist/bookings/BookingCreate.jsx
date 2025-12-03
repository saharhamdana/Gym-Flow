// Fichier: frontend/src/pages/receptionist/bookings/BookingCreate.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardBody,
  Typography,
  Button,
  Select,
  Option,
  Alert,
  Chip,
  Avatar,
} from "@material-tailwind/react";
import { 
  ArrowLeftIcon, 
  CheckCircleIcon,
  XCircleIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/solid";
import api from "@/api/axiosInstance";

const BookingCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [members, setMembers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  
  const [formData, setFormData] = useState({
    member_id: '',  // ✅ Utiliser member_id (MEM20250001)
    course_id: '',
  });

  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    fetchMembers();
    fetchCourses();
  }, []);

  const fetchMembers = async () => {
    try {
      // ✅ Charger TOUS les membres ACTIFS
      const response = await api.get('members/?status=ACTIVE');
      console.log("Membres ACTIFS chargés:", response.data);
      
      setMembers(response.data);
    } catch (err) {
      console.error("Erreur chargement membres actifs:", err);
      setError("Erreur lors du chargement des membres actifs");
    }
  };

  const fetchCourses = async () => {
    setLoadingCourses(true);
    try {
      const response = await api.get('bookings/receptionist/courses/?days_ahead=14');
      console.log("Cours chargés:", response.data);
      setCourses(response.data.results || response.data);
    } catch (err) {
      console.error("Erreur chargement cours:", err);
      setError("Erreur lors du chargement des cours");
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleMemberChange = (value) => {
    const member = members.find(m => m.id === parseInt(value));
    
    console.log("🔍 Membre sélectionné:", {
      id: member?.id,
      member_id: member?.member_id,
      nom: `${member?.first_name} ${member?.last_name}`,
      has_active_subscription: member?.has_active_subscription
    });
    
    setSelectedMember(member);
    setFormData({ 
      ...formData, 
      member_id: member?.member_id || ''
    });
  };

  const handleCourseChange = (value) => {
    const course = courses.find(c => c.id === parseInt(value));
    setSelectedCourse(course);
    setFormData({ 
      ...formData, 
      course_id: value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log("Envoi des données:", formData);
      
      const response = await api.post('bookings/receptionist/create-booking/', formData);
      
      console.log("Réponse:", response.data);
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/receptionist/bookings');
      }, 2000);
    } catch (err) {
      console.error("Erreur création réservation:", err);
      setError(err.response?.data?.error || "Erreur lors de la création de la réservation");
    } finally {
      setLoading(false);
    }
  };

  // Grouper les cours par date
  const groupedCourses = courses.reduce((acc, course) => {
    const date = course.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(course);
    return acc;
  }, {});

  return (
    <div className="p-4 md:p-10 min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="text"
          className="flex items-center gap-2"
          onClick={() => navigate('/receptionist/bookings')}
        >
          <ArrowLeftIcon className="h-4 w-4" /> Retour
        </Button>
      </div>

      <Typography variant="h4" color="blue-gray" className="mb-6">
        Créer une Nouvelle Réservation
      </Typography>

      {error && (
        <Alert color="red" className="mb-4" icon={<XCircleIcon className="h-6 w-6" />}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert color="green" className="mb-4" icon={<CheckCircleIcon className="h-6 w-6" />}>
          ✅ Réservation créée avec succès ! Redirection...
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulaire Principal */}
        <div className="lg:col-span-2">
          <Card>
            <CardBody>
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Sélection du Membre */}
                  <div>
                    <Typography variant="h6" color="blue-gray" className="mb-4">
                      1. Sélectionner le Membre
                    </Typography>
                    <Select
                      label="Membre *"
                      value={selectedMember?.id?.toString() || ''}
                      onChange={handleMemberChange}
                      required
                    >
                      {members.map(member => (
                        <Option key={member.id} value={member.id.toString()}>
                          {member.first_name} {member.last_name} ({member.member_id})
                        </Option>
                      ))}
                    </Select>
                    
                    {selectedMember && (
                      <div className="mt-2">
                        <Alert color="green" className="mt-2">
                          ✅ Membre actif - Réservation autorisée
                        </Alert>
                      </div>
                    )}
                  </div>

                  {/* Sélection du Cours */}
                  <div>
                    <Typography variant="h6" color="blue-gray" className="mb-4">
                      2. Choisir le Cours
                    </Typography>
                    
                    {loadingCourses ? (
                      <div className="text-center py-8">
                        <Typography className="text-gray-500">
                          Chargement des cours...
                        </Typography>
                      </div>
                    ) : courses.length === 0 ? (
                      <Alert color="orange" className="mb-4">
                        <Typography variant="small">
                          Aucun cours disponible pour les 14 prochains jours.
                        </Typography>
                      </Alert>
                    ) : (
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {Object.keys(groupedCourses).sort().map(date => (
                          <div key={date}>
                            <Typography variant="small" className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                              <CalendarDaysIcon className="h-4 w-4" />
                              {new Date(date).toLocaleDateString('fr-FR', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </Typography>
                            
                            <div className="space-y-2">
                              {groupedCourses[date].map(course => (
                                <div
                                  key={course.id}
                                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                    formData.course_id === course.id.toString()
                                      ? 'border-blue-500 bg-blue-50'
                                      : 'border-gray-200 hover:border-blue-300'
                                  }`}
                                  onClick={() => handleCourseChange(course.id.toString())}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <Typography variant="h6" color="blue-gray">
                                        {course.title}
                                      </Typography>
                                      <Typography variant="small" className="text-gray-600">
                                        🕐 {course.start_time} - {course.end_time}
                                      </Typography>
                                      <Typography variant="small" className="text-gray-600">
                                        👤 {course.coach_name} • 📍 {course.room_name}
                                      </Typography>
                                    </div>
                                    <div className="text-right">
                                      <Chip
                                        value={course.is_full ? 'Complet' : `${course.available_spots} places`}
                                        color={course.is_full ? 'red' : 'green'}
                                        size="sm"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Boutons */}
                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      color="blue"
                      disabled={
                        loading || 
                        !formData.member_id || 
                        !formData.course_id
                      }
                      className="flex-1"
                    >
                      {loading ? 'Création...' : '✅ Créer la Réservation'}
                    </Button>
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={() => navigate('/receptionist/bookings')}
                      disabled={loading}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>

        {/* Récapitulatif */}
        <div>
          <Card className="sticky top-6">
            <CardBody>
              <Typography variant="h6" color="blue-gray" className="mb-4">
                📋 Récapitulatif
              </Typography>

              <div className="space-y-4">
                {/* Membre */}
                {selectedMember && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar
                        src={selectedMember.photo || '/img/default-avatar.png'}
                        alt={selectedMember.first_name}
                        size="sm"
                      />
                      <div>
                        <Typography variant="small" className="text-gray-600 mb-1">
                          Membre
                        </Typography>
                        <Typography variant="h6" color="blue-gray">
                          {selectedMember.first_name} {selectedMember.last_name}
                        </Typography>
                        <Typography variant="small" className="text-gray-600">
                          {selectedMember.member_id}
                        </Typography>
                      </div>
                    </div>
                    <Typography variant="small" className="text-green-600">
                      ✅ Membre actif
                    </Typography>
                  </div>
                )}

                {/* Cours */}
                {selectedCourse && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <Typography variant="small" className="text-gray-600 mb-1">
                      Cours
                    </Typography>
                    <Typography variant="h6" color="blue-gray">
                      {selectedCourse.title}
                    </Typography>
                    <Typography variant="small" className="text-gray-600">
                      📅 {new Date(selectedCourse.date).toLocaleDateString('fr-FR')}
                    </Typography>
                    <Typography variant="small" className="text-gray-600">
                      🕐 {selectedCourse.start_time} - {selectedCourse.end_time}
                    </Typography>
                    <Typography variant="small" className="text-gray-600">
                      📍 {selectedCourse.room_name}
                    </Typography>
                    <Typography variant="small" className="text-gray-600">
                      👤 {selectedCourse.coach_name}
                    </Typography>
                    <Chip
                      value={`${selectedCourse.available_spots} places disponibles`}
                      color={selectedCourse.is_full ? 'red' : 'green'}
                      size="sm"
                      className="mt-2"
                    />
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                <Typography variant="small" className="text-gray-700">
                  ℹ️ <strong>Important:</strong> Vérifiez que le membre est actif avant de créer la réservation.
                </Typography>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingCreate;