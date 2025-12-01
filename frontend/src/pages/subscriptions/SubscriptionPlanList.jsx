// File: frontend/src/pages/subscriptions/SubscriptionPlanList.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardBody,
  Typography,
  Button,
  Chip,
  Input,
  Spinner,
  Alert,
} from '@material-tailwind/react';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import PageContainer from '@/components/admin/PageContainer';
import { getSubscriptionPlans, deleteSubscriptionPlan } from '@/services/subscriptionService';

export function SubscriptionPlanList() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await getSubscriptionPlans(searchQuery);
      
      let planData = [];
      if (response && Array.isArray(response.results)) {
        planData = response.results;
      } else if (response && Array.isArray(response)) {
        planData = response;
      }
      
      setPlans(planData);
      setError(null);
    } catch (error) {
      console.error('Error fetching plans:', error);
      setError('Impossible de charger les plans');
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce plan ?')) {
      try {
        await deleteSubscriptionPlan(id);
        fetchPlans();
      } catch (error) {
        console.error('Error deleting plan:', error);
        alert('Erreur lors de la suppression du plan');
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
    }).format(price);
  };

  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: 'green',
      INACTIVE: 'red',
      active: 'green',
      inactive: 'red',
    };
    return colors[status] || 'gray';
  };

  const getStatusLabel = (status) => {
    const labels = {
      ACTIVE: 'Actif',
      INACTIVE: 'Inactif',
      active: 'Actif',
      inactive: 'Inactif',
    };
    return labels[status] || status;
  };

  const filteredPlans = plans.filter(plan =>
    plan.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageContainer
      title="Gestion des Plans d'Abonnement"
      subtitle={`${plans.length} plan(s) enregistré(s)`}
      actions={
        <Button
          className="flex items-center gap-2"
          color="blue"
          onClick={() => navigate('/admin/subscription-plans/create')}
        >
          <PlusIcon className="h-5 w-5" />
          Nouveau Plan
        </Button>
      }
    >
      {error && <Alert color="red" className="mb-4">{error}</Alert>}

      <Card className="shadow-lg">
        <CardBody>
          {/* Barre de Recherche */}
          <div className="mb-6">
            <Input
              label="Rechercher un plan..."
              icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Spinner color="blue" className="h-8 w-8" />
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="text-center py-12">
              <Typography color="gray">
                {searchQuery ? 'Aucun plan trouvé.' : 'Aucun plan enregistré.'}
              </Typography>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-max table-auto">
                <thead>
                  <tr className="border-b border-gray-200">
                    {['Nom', 'Description', 'Prix', 'Durée', 'Type', 'Statut', 'Actions'].map((head) => (
                      <th key={head} className="p-4 text-left">
                        <Typography variant="small" className="font-bold text-gray-700 uppercase">
                          {head}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPlans.map((plan, index) => {
                    const isLast = index === filteredPlans.length - 1;
                    const classes = isLast ? 'p-4' : 'p-4 border-b border-gray-100';

                    return (
                      <tr key={plan.id} className="hover:bg-gray-50 transition-colors">
                        <td className={classes}>
                          <Typography variant="small" className="font-semibold text-blue-600">
                            {plan.name || 'N/A'}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography variant="small">
                            {plan.description || 'Aucune description'}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography
                            variant="small"
                            className="font-bold text-blue-600"
                          >
                            {plan.price ? formatPrice(plan.price) : 'N/A'}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography variant="small">
                            {plan.duration ? `${plan.duration} jours` : 'N/A'}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography variant="small">
                            {plan.plan_type === 'MONTHLY' ? 'Mensuel' : 
                             plan.plan_type === 'QUARTERLY' ? 'Trimestriel' :
                             plan.plan_type === 'ANNUAL' ? 'Annuel' : 
                             plan.plan_type || 'Standard'}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Chip
                            size="sm"
                            value={getStatusLabel(plan.status)}
                            color={getStatusColor(plan.status)}
                          />
                        </td>
                        <td className={classes}>
                          <div className="flex gap-2">
                            <Button
                              variant="text"
                              size="sm"
                              color="blue"
                              onClick={() => navigate(`/admin/subscription-plans/edit/${plan.id}`)}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="text"
                              size="sm"
                              color="red"
                              onClick={() => handleDelete(plan.id)}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
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

export default SubscriptionPlanList;