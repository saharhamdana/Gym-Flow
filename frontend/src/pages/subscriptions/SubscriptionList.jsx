// Fichier: frontend/src/pages/subscriptions/SubscriptionList.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip,
  IconButton,
  Input,
  Select,
  Option,
} from '@material-tailwind/react';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import {
  getSubscriptions,
  activateSubscription,
  cancelSubscription,
  getSubscriptionStatistics,
} from '@/services/subscriptionService';

export function SubscriptionList() {
  const navigate = useNavigate();
  // L'état est correctement initialisé à un tableau vide []
  const [subscriptions, setSubscriptions] = useState([]); 
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
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
      
      // 🎯 CORRECTION CLÉ : Gérer les réponses de l'API (DRF paginé vs. simple tableau)
      let subscriptionData = [];
      
      if (response && Array.isArray(response.results)) {
        // Cas 1: Réponse paginée de DRF (e.g., { count: N, results: [...] })
        subscriptionData = response.results;
      } else if (response && Array.isArray(response)) {
        // Cas 2: Réponse est un tableau direct
        subscriptionData = response;
      } else {
        // Cas 3: Réponse inattendue (e.g., null, undefined, {} vide sans 'results')
        console.warn('API returned unexpected data structure for subscriptions:', response);
        subscriptionData = [];
      }

      setSubscriptions(subscriptionData);
      
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      // Assurer que l'état reste un tableau même en cas d'erreur réseau/API
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
    <div className="mt-12 mb-8 flex flex-col gap-12">
      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card style={{ backgroundColor: '#00357a' }}>
            <CardBody className="text-center">
              <Typography variant="h3" color="white">
                {statistics.total}
              </Typography>
              <Typography color="white" className="mt-2">
                Total Abonnements
              </Typography>
            </CardBody>
          </Card>

          <Card style={{ backgroundColor: '#10b981' }}>
            <CardBody className="text-center">
              <Typography variant="h3" color="white">
                {statistics.active}
              </Typography>
              <Typography color="white" className="mt-2">
                Actifs
              </Typography>
            </CardBody>
          </Card>

          <Card style={{ backgroundColor: '#ef4444' }}>
            <CardBody className="text-center">
              <Typography variant="h3" color="white">
                {statistics.expired}
              </Typography>
              <Typography color="white" className="mt-2">
                Expirés
              </Typography>
            </CardBody>
          </Card>

          <Card style={{ backgroundColor: '#6b7280' }}>
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

      <Card>
        <CardHeader
          variant="gradient"
          style={{ background: 'linear-gradient(87deg, #00357a 0, #0056b3 100%)' }}
          className="mb-8 p-6"
        >
          <div className="flex items-center justify-between">
            <Typography variant="h6" color="white">
              Abonnements
            </Typography>
            <Button
              size="sm"
              color="white"
              className="flex items-center gap-2"
              onClick={() => navigate('/admin/subscriptions/create')}
            >
              <PlusIcon className="h-4 w-4" />
              Nouvel Abonnement
            </Button>
          </div>
        </CardHeader>

        <CardBody className="px-0 pt-0 pb-2">
          {/* Filters */}
          <div className="px-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {loading ? (
            <div className="text-center py-8">
              <Typography>Chargement...</Typography>
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-8">
              <Typography color="gray">Aucun abonnement trouvé</Typography>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] table-auto">
                <thead>
                  <tr>
                    {[
                      'Membre',
                      'Plan',
                      'Dates',
                      'Montant',
                      'Statut',
                      'Jours restants',
                      'Actions',
                    ].map((head) => (
                      <th
                        key={head}
                        className="border-b border-blue-gray-50 py-3 px-5 text-left"
                      >
                        <Typography
                          variant="small"
                          className="text-[11px] font-bold uppercase text-blue-gray-400"
                        >
                          {head}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Cette ligne est désormais protégée car 'subscriptions' est garanti d'être un tableau */}
                  {subscriptions.map((subscription) => ( 
                    <tr key={subscription.id}>
                      <td className="py-3 px-5 border-b border-blue-gray-50">
                        <Typography variant="small" className="font-semibold">
                          {subscription.member_name}
                        </Typography>
                      </td>
                      <td className="py-3 px-5 border-b border-blue-gray-50">
                        <Typography variant="small">{subscription.plan_name}</Typography>
                      </td>
                      <td className="py-3 px-5 border-b border-blue-gray-50">
                        <div className="flex flex-col">
                          <Typography variant="small" className="text-xs">
                            Début: {new Date(subscription.start_date).toLocaleDateString('fr-FR')}
                          </Typography>
                          <Typography variant="small" className="text-xs">
                            Fin: {new Date(subscription.end_date).toLocaleDateString('fr-FR')}
                          </Typography>
                        </div>
                      </td>
                      <td className="py-3 px-5 border-b border-blue-gray-50">
                        <Typography
                          variant="small"
                          className="font-bold"
                          style={{ color: '#00357a' }}
                        >
                          {formatPrice(subscription.amount_paid)}
                        </Typography>
                      </td>
                      <td className="py-3 px-5 border-b border-blue-gray-50">
                        <Chip
                          size="sm"
                          variant="gradient"
                          value={getStatusLabel(subscription.status)}
                          color={getStatusColor(subscription.status)}
                        />
                      </td>
                      <td className="py-3 px-5 border-b border-blue-gray-50">
                        <Typography variant="small" className="font-medium">
                          {subscription.is_active ? `${subscription.days_remaining} jours` : '-'}
                        </Typography>
                      </td>
                      <td className="py-3 px-5 border-b border-blue-gray-50">
                        <div className="flex gap-2">
                          <IconButton
                            variant="text"
                            size="sm"
                            onClick={() => navigate(`/admin/subscriptions/${subscription.id}`)}
                          >
                            <EyeIcon className="h-4 w-4" style={{ color: '#00357a' }} />
                          </IconButton>
                          {subscription.status === 'PENDING' && (
                            <IconButton
                              variant="text"
                              size="sm"
                              onClick={() => handleActivate(subscription.id)}
                            >
                              <CheckCircleIcon className="h-4 w-4 text-green-500" />
                            </IconButton>
                          )}
                          {subscription.status === 'ACTIVE' && (
                            <IconButton
                              variant="text"
                              size="sm"
                              onClick={() => handleCancel(subscription.id)}
                            >
                              <XCircleIcon className="h-4 w-4 text-red-500" />
                            </IconButton>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default SubscriptionList;