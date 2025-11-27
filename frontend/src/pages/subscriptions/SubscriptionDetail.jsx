// File: frontend/src/pages/subscriptions/SubscriptionDetail.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  CardBody,
  Typography,
  Button,
  Chip,
  Alert,
  Spinner,
} from '@material-tailwind/react';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  CreditCardIcon,
  CalendarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import PageContainer from '@/components/admin/PageContainer';
import {
  getSubscription,
  activateSubscription,
  cancelSubscription,
} from '@/services/subscriptionService';

export function SubscriptionDetail() {
  const navigate = useNavigate();
  const { subscriptionId } = useParams();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubscription();
  }, [subscriptionId]);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const data = await getSubscription(subscriptionId);
      setSubscription(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setError('Impossible de charger les détails de l\'abonnement');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    if (window.confirm('Activer cet abonnement ?')) {
      try {
        await activateSubscription(subscriptionId);
        fetchSubscription();
      } catch (error) {
        console.error('Error activating subscription:', error);
        alert('Erreur lors de l\'activation');
      }
    }
  };

  const handleCancel = async () => {
    if (window.confirm('Annuler cet abonnement ?')) {
      try {
        await cancelSubscription(subscriptionId);
        fetchSubscription();
      } catch (error) {
        console.error('Error canceling subscription:', error);
        alert('Erreur lors de l\'annulation');
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: 'green',
      PENDING: 'amber',
      EXPIRED: 'red',
      CANCELLED: 'gray',
    };
    return colors[status] || 'gray';
  };

  const getStatusLabel = (status) => {
    const labels = {
      ACTIVE: 'Actif',
      PENDING: 'En attente',
      EXPIRED: 'Expiré',
      CANCELLED: 'Annulé',
    };
    return labels[status] || status;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
    }).format(price);
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex justify-center items-center h-96">
          <Spinner color="blue" className="h-12 w-12" />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Alert color="red">{error}</Alert>
      </PageContainer>
    );
  }

  if (!subscription) {
    return (
      <PageContainer>
        <Alert color="red">Abonnement introuvable</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="text"
          className="flex items-center gap-2"
          onClick={() => navigate('/admin/subscriptions')}
        >
          <ArrowLeftIcon className="h-4 w-4" /> Retour
        </Button>
        <Typography variant="h4" color="blue-gray">
          Détails de l'Abonnement
        </Typography>
        <Chip
          value={getStatusLabel(subscription.status)}
          color={getStatusColor(subscription.status)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <Card className="lg:col-span-2 shadow-lg">
          <CardBody className="flex flex-col gap-6">
            {/* Member Info */}
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="p-3 rounded-full bg-blue-600">
                <UserIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <Typography variant="small" color="gray">
                  Membre
                </Typography>
                <Typography
                  variant="h5"
                  className="text-blue-600 cursor-pointer hover:underline"
                  onClick={() =>
                    navigate(`/admin/members/${subscription.member_details.id}`)
                  }
                >
                  {subscription.member_details.first_name}{' '}
                  {subscription.member_details.last_name}
                </Typography>
                <Typography variant="small" color="gray">
                  ID: {subscription.member_details.member_id}
                </Typography>
              </div>
            </div>

            {/* Plan Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <Typography variant="small" color="gray">
                  Plan d'Abonnement
                </Typography>
                <Typography variant="h6" className="text-blue-600">
                  {subscription.plan_details.name}
                </Typography>
                <Typography variant="small">
                  {subscription.plan_details.duration_days} jours
                </Typography>
              </div>

              <div className="p-4 border rounded-lg">
                <Typography variant="small" color="gray">
                  Montant Payé
                </Typography>
                <Typography variant="h5" className="text-blue-600">
                  {formatPrice(subscription.amount_paid)}
                </Typography>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-4 border rounded-lg">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                <div>
                  <Typography variant="small" color="gray">
                    Date de Début
                  </Typography>
                  <Typography className="font-medium">
                    {new Date(subscription.start_date).toLocaleDateString('fr-FR')}
                  </Typography>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border rounded-lg">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                <div>
                  <Typography variant="small" color="gray">
                    Date de Fin
                  </Typography>
                  <Typography className="font-medium">
                    {new Date(subscription.end_date).toLocaleDateString('fr-FR')}
                  </Typography>
                </div>
              </div>

              {subscription.is_active && (
                <div className="flex items-start gap-3 p-4 border rounded-lg bg-green-50">
                  <ClockIcon className="h-5 w-5 text-green-600" />
                  <div>
                    <Typography variant="small" className="text-green-600">
                      Jours Restants
                    </Typography>
                    <Typography className="font-medium text-green-600">
                      {subscription.days_remaining} jours
                    </Typography>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Info */}
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="p-3 rounded-full bg-blue-600">
                <CreditCardIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <Typography variant="small" color="gray">
                  Méthode de Paiement
                </Typography>
                <Typography className="font-medium">
                  {subscription.payment_method || 'Non spécifié'}
                </Typography>
                {subscription.payment_date && (
                  <Typography variant="small" color="gray">
                    Payé le:{' '}
                    {new Date(subscription.payment_date).toLocaleDateString('fr-FR')}
                  </Typography>
                )}
              </div>
            </div>

            {/* Notes */}
            {subscription.notes && (
              <div className="p-4 border rounded-lg">
                <Typography variant="small" color="gray" className="mb-2">
                  Notes
                </Typography>
                <Typography>{subscription.notes}</Typography>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t">
              {subscription.status === 'PENDING' && (
                <Button
                  className="flex items-center gap-2 bg-green-500"
                  onClick={handleActivate}
                  fullWidth
                >
                  <CheckCircleIcon className="h-5 w-5" />
                  Activer l'Abonnement
                </Button>
              )}
              {subscription.status === 'ACTIVE' && (
                <Button
                  color="red"
                  className="flex items-center gap-2"
                  onClick={handleCancel}
                  fullWidth
                >
                  <XCircleIcon className="h-5 w-5" />
                  Annuler l'Abonnement
                </Button>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Timeline / History */}
        <Card className="shadow-lg">
          <CardBody className="flex flex-col gap-4">
            <Typography variant="h6" className="text-blue-gray-800 mb-4">
              Historique
            </Typography>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
              <div>
                <Typography variant="small" className="font-medium">
                  Création
                </Typography>
                <Typography variant="small" color="gray">
                  {new Date(subscription.created_at).toLocaleString('fr-FR')}
                </Typography>
              </div>
            </div>

            {subscription.payment_date && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                <div>
                  <Typography variant="small" className="font-medium">
                    Paiement
                  </Typography>
                  <Typography variant="small" color="gray">
                    {new Date(subscription.payment_date).toLocaleString('fr-FR')}
                  </Typography>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-gray-500 mt-2"></div>
              <div>
                <Typography variant="small" className="font-medium">
                  Dernière modification
                </Typography>
                <Typography variant="small" color="gray">
                  {new Date(subscription.updated_at).toLocaleString('fr-FR')}
                </Typography>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </PageContainer>
  );
}

export default SubscriptionDetail;