// Fichier: frontend/src/pages/subscriptions/SubscriptionList.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardBody,
  Typography,
  Button,
  Chip,
  Input,
  Select,
  Option,
  Spinner,
  Alert,
} from '@material-tailwind/react';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import PageContainer from '@/components/admin/PageContainer';
import {
  getSubscriptions,
  activateSubscription,
  cancelSubscription,
  getSubscriptionStatistics,
} from '@/services/subscriptionService';

export function SubscriptionList() {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
  });

  useEffect(() => {
    fetchSubscriptions();
    fetchStatistics();
  }, [filters]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await getSubscriptions(filters);
      
      let subscriptionData = [];
      
      if (response && Array.isArray(response.results)) {
        subscriptionData = response.results;
      } else if (response && Array.isArray(response)) {
        subscriptionData = response;
      } else {
        console.warn('API returned unexpected data structure for subscriptions:', response);
        subscriptionData = [];
      }

      setSubscriptions(subscriptionData);
      setError(null);
      
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      setError('Impossible de charger les abonnements');
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const data = await getSubscriptionStatistics();
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleActivate = async (id) => {
    if (window.confirm('Activer cet abonnement ?')) {
      try {
        await activateSubscription(id);
        fetchSubscriptions();
        fetchStatistics();
      } catch (error) {
        console.error('Error activating subscription:', error);
        alert("Erreur lors de l'activation");
      }
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Annuler cet abonnement ?')) {
      try {
        await cancelSubscription(id);
        fetchSubscriptions();
        fetchStatistics();
      } catch (error) {
        console.error('Error canceling subscription:', error);
        alert("Erreur lors de l'annulation");
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

  return (
    <PageContainer
      title="Gestion des Abonnements"
      subtitle={`${subscriptions.length} abonnement(s) trouvé(s)`}
      actions={
        <Button
          className="flex items-center gap-2"
          color="blue"
          onClick={() => navigate('/admin/subscriptions/create')}
        >
          <PlusIcon className="h-5 w-5" />
          Nouvel Abonnement
        </Button>
      }
    >
      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-blue-600 shadow-lg">
            <CardBody className="text-center">
              <Typography variant="h3" color="white">
                {statistics.total}
              </Typography>
              <Typography color="white" className="mt-2">
                Total Abonnements
              </Typography>
            </CardBody>
          </Card>

          <Card className="bg-green-500 shadow-lg">
            <CardBody className="text-center">
              <Typography variant="h3" color="white">
                {statistics.active}
              </Typography>
              <Typography color="white" className="mt-2">
                Actifs
              </Typography>
            </CardBody>
          </Card>

          <Card className="bg-red-500 shadow-lg">
            <CardBody className="text-center">
              <Typography variant="h3" color="white">
                {statistics.expired}
              </Typography>
              <Typography color="white" className="mt-2">
                Expirés
              </Typography>
            </CardBody>
          </Card>

          <Card className="bg-gray-500 shadow-lg">
            <CardBody className="text-center">
              <Typography variant="h3" color="white">
                {statistics.cancelled}
              </Typography>
              <Typography color="white" className="mt-2">
                Annulés
              </Typography>
            </CardBody>
          </Card>
        </div>
      )}

      <Card className="shadow-lg">
        <CardBody>
          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Rechercher (nom, ID membre)"
              icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            <Select
              label="Statut"
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
            >
              <Option value="">Tous</Option>
              <Option value="ACTIVE">Actif</Option>
              <Option value="PENDING">En attente</Option>
              <Option value="EXPIRED">Expiré</Option>
              <Option value="CANCELLED">Annulé</Option>
            </Select>
          </div>

          {error && <Alert color="red" className="mb-4">{error}</Alert>}

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Spinner color="blue" className="h-8 w-8" />
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-12">
              <Typography color="gray">
                {filters.search || filters.status ? 'Aucun abonnement trouvé.' : 'Aucun abonnement enregistré.'}
              </Typography>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-max table-auto">
                <thead>
                  <tr className="border-b border-gray-200">
                    {['Membre', 'Plan', 'Dates', 'Montant', 'Statut', 'Jours restants', 'Actions'].map((head) => (
                      <th key={head} className="p-4 text-left">
                        <Typography variant="small" className="font-bold text-gray-700 uppercase">
                          {head}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((subscription, index) => {
                    const isLast = index === subscriptions.length - 1;
                    const classes = isLast ? 'p-4' : 'p-4 border-b border-gray-100';

                    return (
                      <tr key={subscription.id} className="hover:bg-gray-50 transition-colors">
                        <td className={classes}>
                          <Typography variant="small" className="font-semibold text-blue-600">
                            {subscription.member_name}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography variant="small">{subscription.plan_name}</Typography>
                        </td>
                        <td className={classes}>
                          <div className="flex flex-col">
                            <Typography variant="small" className="text-xs">
                              Début: {new Date(subscription.start_date).toLocaleDateString('fr-FR')}
                            </Typography>
                            <Typography variant="small" className="text-xs">
                              Fin: {new Date(subscription.end_date).toLocaleDateString('fr-FR')}
                            </Typography>
                          </div>
                        </td>
                        <td className={classes}>
                          <Typography
                            variant="small"
                            className="font-bold text-blue-600"
                          >
                            {formatPrice(subscription.amount_paid)}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Chip
                            size="sm"
                            value={getStatusLabel(subscription.status)}
                            color={getStatusColor(subscription.status)}
                          />
                        </td>
                        <td className={classes}>
                          <Typography variant="small" className="font-medium">
                            {subscription.is_active ? `${subscription.days_remaining} jours` : '-'}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <div className="flex gap-2">
                            <Button
                              variant="text"
                              size="sm"
                              color="blue"
                              onClick={() => navigate(`/admin/subscriptions/${subscription.id}`)}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            {subscription.status === 'PENDING' && (
                              <Button
                                variant="text"
                                size="sm"
                                color="green"
                                onClick={() => handleActivate(subscription.id)}
                              >
                                <CheckCircleIcon className="h-4 w-4" />
                              </Button>
                            )}
                            {subscription.status === 'ACTIVE' && (
                              <Button
                                variant="text"
                                size="sm"
                                color="red"
                                onClick={() => handleCancel(subscription.id)}
                              >
                                <XCircleIcon className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </PageContainer>
  );
}

export default SubscriptionList;