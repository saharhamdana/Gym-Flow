// File: frontend/src/pages/subscriptions/SubscriptionPlanList.jsx

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
} from '@material-tailwind/react';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { getSubscriptionPlans, deleteSubscriptionPlan } from '@/services/subscriptionService';

export function SubscriptionPlanList() {
  const navigate = useNavigate();
  // L'état est initialisé correctement à un tableau vide []
  const [plans, setPlans] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPlans();
  }, [searchQuery]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await getSubscriptionPlans(searchQuery);
      
      // 🎯 CORRECTION: Gérer la pagination de l'API (ex: { count: N, results: [...] })
      let planData = [];
      
      if (response && Array.isArray(response.results)) {
        // Cas 1: Réponse paginée de DRF
        planData = response.results;
      } else if (response && Array.isArray(response)) {
        // Cas 2: Réponse est un tableau direct
        planData = response;
      }
      
      setPlans(planData); // setPlans reçoit désormais un tableau ou un tableau vide
      
    } catch (error) {
      console.error('Error fetching plans:', error);
      // Assurer que l'état est un tableau même en cas d'erreur
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

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader
          variant="gradient"
          style={{ background: 'linear-gradient(87deg, #00357a 0, #0056b3 100%)' }}
          className="mb-8 p-6"
        >
          <div className="flex items-center justify-between">
            <Typography variant="h6" color="white">
              Plans d'Abonnement
            </Typography>
            <Button
              size="sm"
              color="white"
              className="flex items-center gap-2"
              onClick={() => navigate('/admin/subscription-plans/create')}
            >
              <PlusIcon className="h-4 w-4" />
              Nouveau Plan
            </Button>
          </div>
        </CardHeader>

        <CardBody className="px-0 pt-0 pb-2">
          {/* Search Bar */}
          <div className="px-6 mb-6">
            <Input
              label="Rechercher un plan"
              icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="text-center py-8">
              <Typography>Chargement...</Typography>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-8">
              <Typography color="gray">Aucun plan trouvé</Typography>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] table-auto">
                <thead>
                  <tr>
                    {['Nom', 'Durée', 'Prix', 'Statut', 'Date Création', 'Actions'].map((head) => (
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
                  {/* Cette ligne (anciennement ligne 128) est maintenant sécurisée */}
                  {plans.map((plan) => ( 
                    <tr key={plan.id}>
                      <td className="py-3 px-5 border-b border-blue-gray-50">
                        <div className="flex flex-col">
                          <Typography variant="small" className="font-semibold">
                            {plan.name}
                          </Typography>
                          {plan.description && (
                            <Typography variant="small" className="text-xs text-gray-600">
                              {plan.description.substring(0, 50)}
                              {plan.description.length > 50 && '...'}
                            </Typography>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-5 border-b border-blue-gray-50">
                        <Typography variant="small" className="font-medium">
                          {plan.duration_days} jours
                        </Typography>
                      </td>
                      <td className="py-3 px-5 border-b border-blue-gray-50">
                        <Typography
                          variant="small"
                          className="font-bold"
                          style={{ color: '#00357a' }}
                        >
                          {formatPrice(plan.price)}
                        </Typography>
                      </td>
                      <td className="py-3 px-5 border-b border-blue-gray-50">
                        <Chip
                          size="sm"
                          variant="gradient"
                          value={plan.is_active ? 'Actif' : 'Inactif'}
                          color={plan.is_active ? 'green' : 'red'}
                        />
                      </td>
                      <td className="py-3 px-5 border-b border-blue-gray-50">
                        <Typography variant="small">
                          {new Date(plan.created_at).toLocaleDateString('fr-FR')}
                        </Typography>
                      </td>
                      <td className="py-3 px-5 border-b border-blue-gray-50">
                        <div className="flex gap-2">
                          <IconButton
                            variant="text"
                            size="sm"
                            onClick={() => navigate(`/admin/subscription-plans/${plan.id}/edit`)}
                          >
                            <PencilIcon className="h-4 w-4" style={{ color: '#00357a' }} />
                          </IconButton>
                          <IconButton
                            variant="text"
                            size="sm"
                            onClick={() => handleDelete(plan.id)}
                          >
                            <TrashIcon className="h-4 w-4 text-red-500" />
                          </IconButton>
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

export default SubscriptionPlanList;