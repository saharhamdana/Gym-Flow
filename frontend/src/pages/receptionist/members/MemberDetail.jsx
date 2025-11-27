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
} from "@material-tailwind/react";
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
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
        api.get(`subscriptions/subscriptions/?member=${id}`),
        api.get(`bookings/?member=${id}`)
      ]);

      setMember(memberRes.data);
      setSubscriptions(subscriptionsRes.data);
      setBookings(bookingsRes.data);
    } catch (err) {
      console.error("Erreur chargement données membre:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <Typography variant="h5">Chargement...</Typography>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="p-6">
        <Typography variant="h5" color="red">Membre non trouvé</Typography>
      </div>
    );
  }

  const activeSubscription = subscriptions.find(sub => sub.status === 'ACTIVE');

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <Button
          variant="text"
          className="flex items-center gap-2"
          onClick={() => navigate('/receptionist/members')}
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Retour
        </Button>
        
        <div className="flex items-center gap-4">
          <Button
            color="blue"
            onClick={() => navigate('/receptionist/subscriptions/create', { 
              state: { memberId: member.id } 
            })}
          >
            Nouvel Abonnement
          </Button>
          <Button
            color="green"
            onClick={() => navigate('/receptionist/bookings/create', {
              state: { memberId: member.id }
            })}
          >
            Réserver un Cours
          </Button>
        </div>
      </div>

      {/* Profil */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carte profil */}
        <Card className="lg:col-span-1">
          <CardBody className="text-center p-6">
            <Avatar
              src={member.photo || '/img/default-avatar.png'}
              alt={member.first_name}
              size="xxl"
              className="mx-auto mb-4"
            />
            <Typography variant="h4" color="blue-gray">
              {member.first_name} {member.last_name}
            </Typography>
            <Typography variant="small" className="text-gray-600 mb-2">
              {member.member_id}
            </Typography>
            
            <div className="space-y-3 mt-6">
              <div className="flex justify-between">
                <Typography variant="small" className="text-gray-600">Email:</Typography>
                <Typography variant="small" className="font-semibold">{member.email}</Typography>
              </div>
              <div className="flex justify-between">
                <Typography variant="small" className="text-gray-600">Téléphone:</Typography>
                <Typography variant="small" className="font-semibold">{member.phone || 'Non renseigné'}</Typography>
              </div>
              <div className="flex justify-between">
                <Typography variant="small" className="text-gray-600">Statut:</Typography>
                <Chip
                  value={member.status}
                  color={member.status === 'ACTIVE' ? 'green' : 'red'}
                  size="sm"
                />
              </div>
              <div className="flex justify-between">
                <Typography variant="small" className="text-gray-600">Abonnement:</Typography>
                <Chip
                  value={activeSubscription ? 'Actif' : 'Aucun'}
                  color={activeSubscription ? 'green' : 'red'}
                  size="sm"
                />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Détails */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab}>
            <TabsHeader>
              <Tab value="profile" onClick={() => setActiveTab('profile')}>
                Profil
              </Tab>
              <Tab value="subscriptions" onClick={() => setActiveTab('subscriptions')}>
                Abonnements
              </Tab>
              <Tab value="bookings" onClick={() => setActiveTab('bookings')}>
                Réservations
              </Tab>
            </TabsHeader>
            <TabsBody>
              <TabPanel value="profile">
                <Card>
                  <CardBody>
                    <Typography variant="h6" className="mb-4">Informations Personnelles</Typography>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Typography variant="small" className="text-gray-600">Date de naissance:</Typography>
                        <Typography>{member.date_of_birth || 'Non renseignée'}</Typography>
                      </div>
                      <div>
                        <Typography variant="small" className="text-gray-600">Genre:</Typography>
                        <Typography>{member.gender || 'Non renseigné'}</Typography>
                      </div>
                      <div>
                        <Typography variant="small" className="text-gray-600">Adresse:</Typography>
                        <Typography>{member.address || 'Non renseignée'}</Typography>
                      </div>
                      <div>
                        <Typography variant="small" className="text-gray-600">Date d'inscription:</Typography>
                        <Typography>{new Date(member.created_at).toLocaleDateString('fr-FR')}</Typography>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </TabPanel>

              <TabPanel value="subscriptions">
                <Card>
                  <CardBody>
                    <div className="flex items-center justify-between mb-4">
                      <Typography variant="h6">Historique des Abonnements</Typography>
                      <Button
                        size="sm"
                        color="blue"
                        onClick={() => navigate('/receptionist/subscriptions/create', { 
                          state: { memberId: member.id } 
                        })}
                      >
                        Nouvel Abonnement
                      </Button>
                    </div>

                    {subscriptions.length > 0 ? (
                      <div className="space-y-4">
                        {subscriptions.map(subscription => (
                          <div key={subscription.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <Typography variant="h6">{subscription.plan_name}</Typography>
                                <Typography variant="small" className="text-gray-600">
                                  Du {new Date(subscription.start_date).toLocaleDateString('fr-FR')} 
                                  au {new Date(subscription.end_date).toLocaleDateString('fr-FR')}
                                </Typography>
                              </div>
                              <div className="text-right">
                                <Chip
                                  value={subscription.status}
                                  color={subscription.status === 'ACTIVE' ? 'green' : 'gray'}
                                  size="sm"
                                />
                                <Typography variant="h6" className="mt-1">
                                  {subscription.amount_paid} DT
                                </Typography>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Typography className="text-center text-gray-500 py-8">
                        Aucun abonnement trouvé
                      </Typography>
                    )}
                  </CardBody>
                </Card>
              </TabPanel>

              <TabPanel value="bookings">
                <Card>
                  <CardBody>
                    <Typography variant="h6" className="mb-4">Réservations Récentes</Typography>
                    
                    {bookings.length > 0 ? (
                      <div className="space-y-3">
                        {bookings.slice(0, 5).map(booking => (
                          <div key={booking.id} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <Typography variant="small" className="font-semibold">
                                  {booking.course_title}
                                </Typography>
                                <Typography variant="small" className="text-gray-600">
                                  {new Date(booking.course_date).toLocaleDateString('fr-FR')} • {booking.course_start_time}
                                </Typography>
                              </div>
                              <Chip
                                value={booking.checked_in ? 'Présent' : 'Absent'}
                                color={booking.checked_in ? 'green' : 'red'}
                                size="sm"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Typography className="text-center text-gray-500 py-8">
                        Aucune réservation trouvée
                      </Typography>
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