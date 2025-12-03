// Fichier: frontend/src/pages/receptionist/members/MemberDetail.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardBody,
  Typography,
  Button,
  Chip,
  Avatar,
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
  Spinner,
} from "@material-tailwind/react";
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  QrCodeIcon,
  PencilIcon,
} from "@heroicons/react/24/solid";
import api from '@/api/axiosInstance';

const MemberDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchMemberData();
  }, [id]);

  const fetchMemberData = async () => {
    try {
      const [memberRes, subscriptionsRes, bookingsRes] = await Promise.all([
        api.get(`members/${id}/`),
        api.get(`subscriptions/?member=${id}`),
        api.get(`bookings/?member=${id}`)
      ]);

      setMember(memberRes.data);
      
      // CORRECTION : Gestion sécurisée des données subscriptions
      const subscriptionsData = subscriptionsRes.data;
      if (Array.isArray(subscriptionsData)) {
        setSubscriptions(subscriptionsData);
      } else if (subscriptionsData && Array.isArray(subscriptionsData.results)) {
        setSubscriptions(subscriptionsData.results);
      } else if (subscriptionsData && Array.isArray(subscriptionsData.data)) {
        setSubscriptions(subscriptionsData.data);
      } else {
        console.warn("Format de données subscriptions inattendu:", subscriptionsData);
        setSubscriptions([]);
      }

      // CORRECTION : Gestion sécurisée des données bookings
      const bookingsData = bookingsRes.data;
      if (Array.isArray(bookingsData)) {
        setBookings(bookingsData);
      } else if (bookingsData && Array.isArray(bookingsData.results)) {
        setBookings(bookingsData.results);
      } else if (bookingsData && Array.isArray(bookingsData.data)) {
        setBookings(bookingsData.data);
      } else {
        console.warn("Format de données bookings inattendu:", bookingsData);
        setBookings([]);
      }
    } catch (err) {
      console.error("Erreur chargement données membre:", err);
      setSubscriptions([]);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'green';
      case 'INACTIVE': return 'red';
      case 'SUSPENDED': return 'amber';
      case 'PENDING': return 'blue';
      default: return 'gray';
    }
  };

  const getSubscriptionStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'green';
      case 'EXPIRED': return 'red';
      case 'CANCELLED': return 'gray';
      case 'PENDING': return 'blue';
      default: return 'gray';
    }
  };

  // CORRECTION : Vérification que subscriptions est bien un tableau
  const activeSubscription = Array.isArray(subscriptions) 
    ? subscriptions.find(sub => sub.status === 'ACTIVE')
    : null;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="text-center">
          <Spinner className="h-12 w-12 mx-auto mb-4" />
          <Typography variant="h6" color="gray">
            Chargement des données du membre...
          </Typography>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="p-6 text-center">
        <Typography variant="h5" color="red" className="mb-4">
          Membre non trouvé
        </Typography>
        <Button onClick={() => navigate('/receptionist/members')}>
          Retour à la liste
        </Button>
      </div>
    );
  }

  // CORRECTION : Vérifications supplémentaires pour le rendu
  const safeSubscriptions = Array.isArray(subscriptions) ? subscriptions : [];
  const safeBookings = Array.isArray(bookings) ? bookings : [];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="text"
            className="flex items-center gap-2"
            onClick={() => navigate('/receptionist/members')}
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Retour aux membres
          </Button>
          <Typography variant="h4" color="blue-gray">
            Fiche Membre
          </Typography>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            color="blue"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => navigate(`/receptionist/subscriptions/create?member_id=${member.id}`)}
          >
            <CurrencyDollarIcon className="h-4 w-4" />
            Nouvel Abonnement
          </Button>
          <Button
            color="green"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => navigate(`/receptionist/bookings/create?member_id=${member.id}`)}
          >
            <CalendarDaysIcon className="h-4 w-4" />
            Réserver un Cours
          </Button>
          <Button
            variant="outlined"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => {/* Logique QR Code */}}
          >
            <QrCodeIcon className="h-4 w-4" />
            QR Code
          </Button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carte profil latérale */}
        <Card className="lg:col-span-1 h-fit">
          <CardBody className="p-6">
            <div className="text-center">
              <Avatar
                src={member.photo || '/img/default-avatar.png'}
                alt={member.first_name}
                size="xxl"
                className="mx-auto mb-4 border-4 border-white shadow-lg"
              />
              <Typography variant="h4" color="blue-gray" className="mb-1">
                {member.first_name} {member.last_name}
              </Typography>
              <Typography variant="small" className="text-gray-600 font-mono mb-4">
                {member.member_id}
              </Typography>
              
              <Chip
                value={member.status}
                color={getStatusColor(member.status)}
                className="mb-4"
              />
            </div>

            {/* Informations de contact */}
            <div className="space-y-3 mt-6">
              <div className="flex justify-between items-center">
                <Typography variant="small" className="text-gray-600">Email:</Typography>
                <Typography variant="small" className="font-semibold text-right">
                  {member.email}
                </Typography>
              </div>
              <div className="flex justify-between items-center">
                <Typography variant="small" className="text-gray-600">Téléphone:</Typography>
                <Typography variant="small" className="font-semibold">
                  {member.phone || 'Non renseigné'}
                </Typography>
              </div>
              <div className="flex justify-between items-center">
                <Typography variant="small" className="text-gray-600">Abonnement:</Typography>
                <Chip
                  value={activeSubscription ? 'Actif' : 'Aucun'}
                  color={activeSubscription ? 'green' : 'red'}
                  size="sm"
                />
              </div>
            </div>

            {/* Actions rapides */}
            <div className="mt-6 space-y-2">
              <Button
                variant="outlined"
                size="sm"
                fullWidth
                className="flex items-center gap-2 justify-center"
                onClick={() => navigate(`/receptionist/members/${member.id}/edit`)}
              >
                <PencilIcon className="h-4 w-4" />
                Modifier le profil
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Détails et onglets */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab}>
            <TabsHeader className="bg-blue-gray-50/50">
              <Tab 
                value="profile" 
                onClick={() => setActiveTab('profile')}
                className={activeTab === 'profile' ? 'text-blue-600' : ''}
              >
                Informations Personnelles
              </Tab>
              <Tab 
                value="subscriptions" 
                onClick={() => setActiveTab('subscriptions')}
                className={activeTab === 'subscriptions' ? 'text-blue-600' : ''}
              >
                Abonnements ({safeSubscriptions.length})
              </Tab>
              <Tab 
                value="bookings" 
                onClick={() => setActiveTab('bookings')}
                className={activeTab === 'bookings' ? 'text-blue-600' : ''}
              >
                Réservations ({safeBookings.length})
              </Tab>
            </TabsHeader>
            
            <TabsBody className="mt-4">
              {/* Onglet Profil */}
              <TabPanel value="profile" className="p-0">
                <Card>
                  <CardBody className="space-y-6">
                    {/* Informations de base */}
                    <div>
                      <Typography variant="h6" color="blue-gray" className="mb-4">
                        Informations de Base
                      </Typography>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Typography variant="small" className="text-gray-600 font-semibold">
                            Date de naissance:
                          </Typography>
                          <Typography>
                            {member.date_of_birth ? new Date(member.date_of_birth).toLocaleDateString('fr-FR') : 'Non renseignée'}
                          </Typography>
                        </div>
                        <div>
                          <Typography variant="small" className="text-gray-600 font-semibold">
                            Genre:
                          </Typography>
                          <Typography>
                            {member.gender === 'M' ? 'Masculin' : member.gender === 'F' ? 'Féminin' : member.gender === 'O' ? 'Autre' : 'Non renseigné'}
                          </Typography>
                        </div>
                        <div className="md:col-span-2">
                          <Typography variant="small" className="text-gray-600 font-semibold">
                            Adresse:
                          </Typography>
                          <Typography>
                            {member.address || 'Non renseignée'}
                          </Typography>
                        </div>
                        <div>
                          <Typography variant="small" className="text-gray-600 font-semibold">
                            Date d'inscription:
                          </Typography>
                          <Typography>
                            {new Date(member.created_at).toLocaleDateString('fr-FR')}
                          </Typography>
                        </div>
                      </div>
                    </div>

                    {/* Contact d'urgence */}
                    <div className="pt-4 border-t">
                      <Typography variant="h6" color="blue-gray" className="mb-4">
                        Contact d'Urgence
                      </Typography>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Typography variant="small" className="text-gray-600 font-semibold">
                            Nom du contact:
                          </Typography>
                          <Typography>
                            {member.emergency_contact_name || 'Non renseigné'}
                          </Typography>
                        </div>
                        <div>
                          <Typography variant="small" className="text-gray-600 font-semibold">
                            Téléphone:
                          </Typography>
                          <Typography>
                            {member.emergency_contact_phone || 'Non renseigné'}
                          </Typography>
                        </div>
                      </div>
                    </div>

                    {/* Informations médicales */}
                    {(member.medical_conditions || member.height || member.weight) && (
                      <div className="pt-4 border-t">
                        <Typography variant="h6" color="blue-gray" className="mb-4">
                          Informations Médicales
                        </Typography>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {member.height && (
                            <div>
                              <Typography variant="small" className="text-gray-600 font-semibold">
                                Taille:
                              </Typography>
                              <Typography>{member.height} cm</Typography>
                            </div>
                          )}
                          {member.weight && (
                            <div>
                              <Typography variant="small" className="text-gray-600 font-semibold">
                                Poids:
                              </Typography>
                              <Typography>{member.weight} kg</Typography>
                            </div>
                          )}
                          {member.medical_conditions && (
                            <div className="md:col-span-2">
                              <Typography variant="small" className="text-gray-600 font-semibold">
                                Conditions médicales:
                              </Typography>
                              <Typography className="whitespace-pre-line">
                                {member.medical_conditions}
                              </Typography>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </TabPanel>

              {/* Onglet Abonnements */}
              <TabPanel value="subscriptions" className="p-0">
                <Card>
                  <CardBody>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <Typography variant="h6" color="blue-gray">
                        Historique des Abonnements
                      </Typography>
                      <Button
                        size="sm"
                        color="blue"
                        className="flex items-center gap-2 whitespace-nowrap"
                        onClick={() => navigate(`/receptionist/subscriptions/create?member_id=${member.id}`)}
                      >
                        <CurrencyDollarIcon className="h-4 w-4" />
                        Nouvel Abonnement
                      </Button>
                    </div>

                    {/* Bannière abonnement actif */}
                    {activeSubscription && (
                      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <Typography variant="small" className="font-semibold text-green-800">
                            Abonnement actif
                          </Typography>
                        </div>
                      </div>
                    )}

                    {safeSubscriptions.length > 0 ? (
                      <div className="space-y-4">
                        {safeSubscriptions.map(subscription => (
                          <div 
                            key={subscription.id} 
                            className={`p-4 border rounded-lg ${
                              subscription.status === 'ACTIVE' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex-1">
                                <Typography variant="h6" className="mb-1">
                                  {subscription.plan_name || subscription.subscription_plan?.name || 'Plan inconnu'}
                                </Typography>
                                <Typography variant="small" className="text-gray-600">
                                  Du {new Date(subscription.start_date).toLocaleDateString('fr-FR')} 
                                  au {new Date(subscription.end_date).toLocaleDateString('fr-FR')}
                                </Typography>
                                {subscription.payment_method && (
                                  <Typography variant="small" className="text-gray-500 mt-1">
                                    Paiement: {subscription.payment_method} • 
                                    Statut: {subscription.payment_status}
                                  </Typography>
                                )}
                              </div>
                              <div className="text-right">
                                <Chip
                                  value={subscription.status}
                                  color={getSubscriptionStatusColor(subscription.status)}
                                  size="sm"
                                  className="mb-2"
                                />
                                <Typography variant="h6" className="text-blue-600">
                                  {subscription.amount_paid || subscription.price || '0'} DT
                                </Typography>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <CurrencyDollarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <Typography variant="h6" color="gray" className="mb-2">
                          Aucun abonnement
                        </Typography>
                        <Typography variant="small" color="gray" className="mb-4">
                          Ce membre n'a pas encore d'abonnement
                        </Typography>
                        <Button
                          color="blue"
                          onClick={() => navigate(`/receptionist/subscriptions/create?member_id=${member.id}`)}
                        >
                          Ajouter un abonnement
                        </Button>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </TabPanel>

              {/* Onglet Réservations */}
              <TabPanel value="bookings" className="p-0">
                <Card>
                  <CardBody>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <Typography variant="h6" color="blue-gray">
                        Historique des Réservations
                      </Typography>
                      <Button
                        size="sm"
                        color="green"
                        className="flex items-center gap-2 whitespace-nowrap"
                        onClick={() => navigate(`/receptionist/bookings/create?member_id=${member.id}`)}
                      >
                        <CalendarDaysIcon className="h-4 w-4" />
                        Nouvelle Réservation
                      </Button>
                    </div>

                    {safeBookings.length > 0 ? (
                      <div className="space-y-3">
                        {safeBookings.map(booking => (
                          <div key={booking.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex-1">
                                <Typography variant="small" className="font-semibold text-gray-900">
                                  {booking.course_title || booking.course?.title || 'Cours'}
                                </Typography>
                                <Typography variant="small" className="text-gray-600">
                                  {booking.course_date ? new Date(booking.course_date).toLocaleDateString('fr-FR') : 'Date inconnue'} • 
                                  {booking.course_start_time || booking.course?.start_time || 'Heure inconnue'}
                                </Typography>
                                {booking.coach_name && (
                                  <Typography variant="small" className="text-gray-500">
                                    Coach: {booking.coach_name}
                                  </Typography>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <Chip
                                  value={booking.checked_in ? 'Présent' : 'Absent'}
                                  color={booking.checked_in ? 'green' : 'red'}
                                  size="sm"
                                />
                                <Typography variant="small" className="text-gray-500 whitespace-nowrap">
                                  {new Date(booking.created_at).toLocaleDateString('fr-FR')}
                                </Typography>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <CalendarDaysIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <Typography variant="h6" color="gray" className="mb-2">
                          Aucune réservation
                        </Typography>
                        <Typography variant="small" color="gray" className="mb-4">
                          Ce membre n'a pas encore de réservation
                        </Typography>
                        <Button
                          color="green"
                          onClick={() => navigate(`/receptionist/bookings/create?member_id=${member.id}`)}
                        >
                          Réserver un cours
                        </Button>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </TabPanel>
            </TabsBody>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default MemberDetail;