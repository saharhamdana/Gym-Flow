// Fichier: frontend/src/pages/receptionist/bookings/BookingsList.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardBody,
  Typography,
  Button,
  Input,
  Chip,
  Avatar,
  Select,
  Option,
} from "@material-tailwind/react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
import api from '@/api/axiosInstance';

const BookingsList = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('bookings/receptionist/bookings/');
      setBookings(response.data.results || response.data);
    } catch (err) {
      console.error("Erreur chargement réservations:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking =>
    booking.member_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.member_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.course_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'blue';
      case 'COMPLETED': return 'green';
      case 'CANCELLED': return 'red';
      case 'NO_SHOW': return 'orange';
      default: return 'gray';
    }
  };

  const handleCheckIn = async (bookingId) => {
    try {
      await api.post(`bookings/${bookingId}/check_in/`);
      fetchBookings(); // Recharger la liste
    } catch (err) {
      console.error("Erreur check-in:", err);
    }
  };

  const handleCancel = async (bookingId) => {
    try {
      await api.post(`bookings/${bookingId}/cancel/`);
      fetchBookings(); // Recharger la liste
    } catch (err) {
      console.error("Erreur annulation:", err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Typography variant="h3" color="blue-gray" className="font-bold">
            Gestion des Réservations
          </Typography>
          <Typography className="text-gray-600">
            {bookings.length} réservation(s) au total
          </Typography>
        </div>
        <Button
          color="blue"
          className="flex items-center gap-2"
          onClick={() => navigate('/receptionist/bookings/create')}
        >
          <PlusIcon className="h-5 w-5" />
          Nouvelle Réservation
        </Button>
      </div>

      {/* Filtres */}
      <Card>
        <CardBody className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                label="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              />
            </div>
            <Select
              label="Filtrer par statut"
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="">Tous les statuts</Option>
              <Option value="CONFIRMED">Confirmées</Option>
              <Option value="COMPLETED">Terminées</Option>
              <Option value="CANCELLED">Annulées</Option>
              <Option value="NO_SHOW">Absents</Option>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Liste */}
      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-4 text-left">Membre</th>
                  <th className="p-4 text-left">Cours</th>
                  <th className="p-4 text-left">Date</th>
                  <th className="p-4 text-left">Statut</th>
                  <th className="p-4 text-left">Présence</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking, index) => (
                  <tr
                    key={booking.id}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={booking.member_photo || '/img/default-avatar.png'}
                          alt={booking.member_name}
                          size="sm"
                        />
                        <div>
                          <Typography variant="small" className="font-bold">
                            {booking.member_name}
                          </Typography>
                          <Typography variant="small" className="text-gray-600">
                            {booking.member_id}
                          </Typography>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Typography variant="small" className="font-semibold">
                        {booking.course_title}
                      </Typography>
                      <Typography variant="small" className="text-gray-600">
                        {booking.course_start_time} - {booking.course_end_time}
                      </Typography>
                    </td>
                    <td className="p-4">
                      <Typography variant="small">
                        {new Date(booking.course_date).toLocaleDateString('fr-FR')}
                      </Typography>
                    </td>
                    <td className="p-4">
                      <Chip
                        value={booking.status}
                        color={getStatusColor(booking.status)}
                        size="sm"
                      />
                    </td>
                    <td className="p-4">
                      <Chip
                        value={booking.checked_in ? 'Présent' : 'Absent'}
                        color={booking.checked_in ? 'green' : 'red'}
                        size="sm"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {!booking.checked_in && booking.status === 'CONFIRMED' && (
                          <Button
                            size="sm"
                            color="green"
                            onClick={() => handleCheckIn(booking.id)}
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </Button>
                        )}
                        {booking.status === 'CONFIRMED' && (
                          <Button
                            size="sm"
                            color="red"
                            onClick={() => handleCancel(booking.id)}
                          >
                            <XCircleIcon className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="text"
                          color="blue"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <Typography variant="h6" color="gray" className="mb-2">
                Aucune réservation trouvée
              </Typography>
              <Button
                color="blue"
                onClick={() => navigate('/receptionist/bookings/create')}
              >
                Créer la première réservation
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default BookingsList;