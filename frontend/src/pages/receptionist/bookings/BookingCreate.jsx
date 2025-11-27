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
  Input,
  Alert,
} from "@material-tailwind/react";
import { ArrowLeftIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import api from "@/api/axiosInstance";

const BookingCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [members, setMembers] = useState([]);
  const [courses, setCourses] = useState([]);
  
  const [formData, setFormData] = useState({
    member: '',
    course: '',
  });

  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    fetchMembers();
    fetchCourses();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await api.get('members/?status=ACTIVE');
      setMembers(response.data);
    } catch (err) {
      console.error("Erreur chargement membres:", err);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await api.get('courses/upcoming/');
      setCourses(response.data);
    } catch (err) {
      console.error("Erreur chargement cours:", err);
    }
  };

  const handleMemberChange = (value) => {
    setFormData({ ...formData, member: value });
    const member = members.find(m => m.id === parseInt(value));
    setSelectedMember(member);
  };

  const handleCourseChange = (value) => {
    setFormData({ ...formData, course: value });
    const course = courses.find(c => c.id === parseInt(value));
    setSelectedCourse(course);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('bookings/receptionist/create-booking/', {
        member_id: selectedMember?.member_id,
        course_id: formData.course
      });
      
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
        <Alert color="red" className="mb-4">
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
                      value={formData.member}
                      onChange={handleMemberChange}
                      required
                    >
                      {members.map(member => (
                        <Option key={member.id} value={member.id.toString()}>
                          {member.first_name} {member.last_name} ({member.member_id})
                        </Option>
                      ))}
                    </Select>
                  </div>

                  {/* Sélection du Cours */}
                  <div>
                    <Typography variant="h6" color="blue-gray" className="mb-4">
                      2. Choisir le Cours
                    </Typography>
                    <Select
                      label="Cours *"
                      value={formData.course}
                      onChange={handleCourseChange}
                      required
                    >
                      {courses.map(course => (
                        <Option key={course.id} value={course.id.toString()}>
                          {course.title} - {new Date(course.date).toLocaleDateString('fr-FR')} à {course.start_time}
                        </Option>
                      ))}
                    </Select>
                  </div>

                  {/* Boutons */}
                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      color="blue"
                      disabled={loading || !formData.member || !formData.course}
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
                    <Typography variant="small" className="text-gray-600 mb-1">
                      Membre
                    </Typography>
                    <Typography variant="h6" color="blue-gray">
                      {selectedMember.first_name} {selectedMember.last_name}
                    </Typography>
                    <Typography variant="small" className="text-gray-600">
                      {selectedMember.member_id}
                    </Typography>
                    <Typography variant="small" className={selectedMember.has_active_subscription ? 'text-green-600' : 'text-red-600'}>
                      {selectedMember.has_active_subscription ? '✅ Abonnement actif' : '❌ Abonnement inactif'}
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
                      {new Date(selectedCourse.date).toLocaleDateString('fr-FR')}
                    </Typography>
                    <Typography variant="small" className="text-gray-600">
                      {selectedCourse.start_time} - {selectedCourse.end_time}
                    </Typography>
                    <Typography variant="small" className="text-gray-600">
                      Salle: {selectedCourse.room_name}
                    </Typography>
                    <Typography variant="small" className="text-gray-600">
                      Coach: {selectedCourse.coach_name}
                    </Typography>
                  </div>
                )}

                {/* Capacité */}
                {selectedCourse && (
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <Typography variant="small" className="text-gray-600 mb-1">
                      Capacité
                    </Typography>
                    <Typography variant="small" className="font-semibold">
                      {selectedCourse.current_participants || 0} / {selectedCourse.max_participants} participants
                    </Typography>
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                <Typography variant="small" className="text-gray-700">
                  ℹ️ <strong>Important:</strong> Vérifiez que le membre a un abonnement actif avant de créer la réservation.
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