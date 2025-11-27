// Fichier: frontend/src/pages/receptionist/subscriptions/SubscriptionsList.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardBody,
  Typography,
  Button,
  Input,
  Chip,
  Select,
  Option,
} from "@material-tailwind/react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";
import api from '@/api/axiosInstance';

const SubscriptionsList = () => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await api.get('subscriptions/subscriptions/');
      setSubscriptions(response.data);
    } catch (err) {
      console.error("Erreur chargement abonnements:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = 
      sub.member_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.member_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || sub.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'green';
      case 'EXPIRED': return 'red';
      case 'CANCELLED': return 'gray';
      case 'PENDING': return 'amber';
      default: return 'blue';
    }
  };

  const isExpiringSoon = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  };

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Typography variant="h3" color="blue-gray" className="font-bold">
            Gestion des Abonnements
          </Typography>
          <Typography className="text-gray-600">
            {subscriptions.length} abonnement(s) au total
          </Typography>
        </div>
        <Button
          color="blue"
          className="flex items-center gap-2"
          onClick={() => navigate('/receptionist/subscriptions/create')}
        >
          <PlusIcon className="h-5 w-5" />
          Nouvel Abonnement
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
              <Option value="ACTIVE">Actifs</Option>
              <Option value="EXPIRED">Expirés</Option>
              <Option value="CANCELLED">Annulés</Option>
              <Option value="PENDING">En attente</Option>
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
                  <th className="p-4 text-left">Plan</th>
                  <th className="p-4 text-left">Période</th>
                  <th className="p-4 text-left">Montant</th>
                  <th className="p-4 text-left">Statut</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscriptions.map((sub, index) => (
                  <tr
                    key={sub.id}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="p-4">
                      <div>
                        <Typography variant="small" className="font-bold">
                          {sub.member_name}
                        </Typography>
                        <Typography variant="small" className="text-gray-600">
                          {sub.member_id}
                        </Typography>
                      </div>
                    </td>
                    <td className="p-4">
                      <Typography variant="small" className="font-semibold">
                        {sub.plan_name}
                      </Typography>
                    </td>
                    <td className="p-4">
                      <Typography variant="small">
                        Du {new Date(sub.start_date).toLocaleDateString('fr-FR')}
                      </Typography>
                      <Typography variant="small">
                        Au {new Date(sub.end_date).toLocaleDateString('fr-FR')}
                        {isExpiringSoon(sub.end_date) && sub.status === 'ACTIVE' && (
                          <ExclamationTriangleIcon className="h-4 w-4 text-orange-500 inline ml-1" />
                        )}
                      </Typography>
                    </td>
                    <td className="p-4">
                      <Typography variant="small" className="font-bold">
                        {sub.amount_paid} DT
                      </Typography>
                    </td>
                    <td className="p-4">
                      <Chip
                        value={sub.status}
                        color={getStatusColor(sub.status)}
                        size="sm"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="text" color="blue">
                          Détails
                        </Button>
                        {sub.status === 'ACTIVE' && isExpiringSoon(sub.end_date) && (
                          <Button size="sm" color="orange">
                            Renouveler
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSubscriptions.length === 0 && (
            <div className="text-center py-12">
              <Typography variant="h6" color="gray" className="mb-2">
                Aucun abonnement trouvé
              </Typography>
              <Button
                color="blue"
                onClick={() => navigate('/receptionist/subscriptions/create')}
              >
                Créer le premier abonnement
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default SubscriptionsList;