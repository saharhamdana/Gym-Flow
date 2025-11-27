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
} from '@heroicons/react/24/solid';
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

  const filteredPlans = plans.filter(plan =>
    plan.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

 return (
    <div>
      {/* Header simple sans PageContainer */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Typography variant="h4" color="blue-gray" className="mb-1">
            Gestion des Plans d'Abonnement
          </Typography>
          <Typography variant="small" color="gray">
            {plans.length} plan(s) enregistré(s)
          </Typography>
        </div>
        <Button
          className="flex items-center gap-2"
          color="blue"
          onClick={() => navigate('/admin/subscription-plans/create')}
        >
          <PlusIcon className="h-5 w-5" />
          Nouveau Plan
        </Button>
      </div>

      {error && <Alert color="red" className="mb-4">{error}</Alert>}

      <Card className="shadow-lg">
        <CardBody className="p-6">
          {/* Barre de Recherche */}
          <div className="mb-6">
            <Input
              label="Rechercher un plan..."
              icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Tableau */}
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Spinner color="blue" className="h-8 w-8" />
            </div>
          ) : filteredPlans.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-max table-auto">
                {/* ... votre tableau ... */}
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Typography color="gray">
                {searchQuery ? 'Aucun plan trouvé.' : 'Aucun plan enregistré.'}
              </Typography>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default SubscriptionPlanList;