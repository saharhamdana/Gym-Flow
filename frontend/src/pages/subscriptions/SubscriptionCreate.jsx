// File: frontend/src/pages/subscriptions/SubscriptionCreate.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardBody,
  Typography,
  Input,
  Textarea,
  Button,
  Select,
  Option,
  Alert,
  Spinner,
} from '@material-tailwind/react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { createSubscription, getSubscriptionPlans } from '@/services/subscriptionService';
import api from '@/api/axiosInstance';

export function SubscriptionCreate() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [members, setMembers] = useState([]); 
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({
    member: '',
    plan: '',
    start_date: new Date().toISOString().split('T')[0],
    amount_paid: '',
    payment_method: 'Espèces',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlans();
    fetchMembers();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await getSubscriptionPlans();
      
      const data = Array.isArray(response.results) ? response.results : response;
      setPlans(data.filter((plan) => plan.is_active));
      
    } catch (error) {
      console.error('Error fetching plans:', error);
      setError('Impossible de charger les plans');
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await api.get('members/');

      if (response.data && Array.isArray(response.data.results)) {
        setMembers(response.data.results);
      } else if (response.data && Array.isArray(response.data)) {
        setMembers(response.data);
      } else {
        setMembers([]);
        console.warn('Unexpected API response structure for members:', response.data);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      setError('Impossible de charger les membres');
      setMembers([]);
    }
  };

  const handlePlanChange = (planId) => {
    const plan = plans.find((p) => p.id === parseInt(planId));
    setSelectedPlan(plan);
    setFormData((prev) => ({
      ...prev,
      plan: planId,
      amount_paid: plan ? plan.price : '',
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.member) {
      newErrors.member = 'Veuillez sélectionner un membre';
    }

    if (!formData.plan) {
      newErrors.plan = 'Veuillez sélectionner un plan';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'La date de début est requise';
    }

    if (!formData.amount_paid || formData.amount_paid < 0) {
      newErrors.amount_paid = 'Le montant doit être positif';
    }

    if (!formData.payment_method) {
      newErrors.payment_method = 'La méthode de paiement est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createSubscription(formData);
      navigate('/admin/subscriptions');
    } catch (error) {
      console.error('Error creating subscription:', error);
      setError("Erreur lors de la création de l'abonnement");
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner color="blue" className="h-12 w-12" />
      </div>
    );
  }

  return (
    <div>
      {/* Header simple sans PageContainer */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="text"
          className="flex items-center gap-2"
          onClick={() => navigate('/admin/subscriptions')}
        >
          <ArrowLeftIcon className="h-4 w-4" /> Retour
        </Button>
        <Typography variant="h4" color="blue-gray">
          Nouvel Abonnement
        </Typography>
      </div>

      {error && <Alert color="red" className="mb-4">{error}</Alert>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <Card className="lg:col-span-2 shadow-lg">
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Member Selection */}
              <div>
                <Select
                  label="Membre *"
                  value={formData.member}
                  onChange={(value) => {
                    setFormData({ ...formData, member: value });
                    if (errors.member) setErrors({ ...errors, member: '' });
                  }}
                  error={Boolean(errors.member)}
                >
                  {Array.isArray(members) && members.map((member) => ( 
                    <Option key={member.id} value={member.id.toString()}>
                      {member.first_name} {member.last_name} - {member.member_id}
                    </Option>
                  ))}
                </Select>
                {errors.member && (
                  <Typography variant="small" color="red" className="mt-1">
                    {errors.member}
                  </Typography>
                )}
              </div>

              {/* Plan Selection */}
              <div>
                <Select
                  label="Plan d'Abonnement *"
                  value={formData.plan}
                  onChange={handlePlanChange}
                  error={Boolean(errors.plan)}
                >
                  {plans.map((plan) => ( 
                    <Option key={plan.id} value={plan.id.toString()}>
                      {plan.name} - {plan.duration_days} jours - {formatPrice(plan.price)}
                    </Option>
                  ))}
                </Select>
                {errors.plan && (
                  <Typography variant="small" color="red" className="mt-1">
                    {errors.plan}
                  </Typography>
                )}
              </div>

              {/* Start Date and Amount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Input
                    type="date"
                    label="Date de Début *"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    error={Boolean(errors.start_date)}
                  />
                  {errors.start_date && (
                    <Typography variant="small" color="red" className="mt-1">
                      {errors.start_date}
                    </Typography>
                  )}
                </div>

                <div>
                  <Input
                    type="number"
                    step="0.01"
                    label="Montant Payé (TND) *"
                    name="amount_paid"
                    value={formData.amount_paid}
                    onChange={handleChange}
                    error={Boolean(errors.amount_paid)}
                  />
                  {errors.amount_paid && (
                    <Typography variant="small" color="red" className="mt-1">
                      {errors.amount_paid}
                    </Typography>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <Select
                  label="Méthode de Paiement *"
                  value={formData.payment_method}
                  onChange={(value) => {
                    setFormData({ ...formData, payment_method: value });
                    if (errors.payment_method)
                      setErrors({ ...errors, payment_method: '' });
                  }}
                  error={Boolean(errors.payment_method)}
                >
                  <Option value="Espèces">Espèces</Option>
                  <Option value="Carte Bancaire">Carte Bancaire</Option>
                  <Option value="Virement">Virement</Option>
                  <Option value="Chèque">Chèque</Option>
                </Select>
                {errors.payment_method && (
                  <Typography variant="small" color="red" className="mt-1">
                    {errors.payment_method}
                  </Typography>
                )}
              </div>

              {/* Notes */}
              <div>
                <Textarea
                  label="Notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  color="blue"
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? 'Création...' : "Créer l'Abonnement"}
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => navigate('/admin/subscriptions')}
                  disabled={submitting}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        {/* Plan Preview */}
        {selectedPlan && (
          <Card className="shadow-lg">
            <CardBody className="space-y-4">
              <Typography variant="h5" color="blue-gray" className="mb-4">
                Détails du Plan
              </Typography>
              
              <div className="p-4 border rounded-lg">
                <Typography variant="small" color="gray">
                  Nom
                </Typography>
                <Typography variant="h6" className="text-blue-600">
                  {selectedPlan.name}
                </Typography>
              </div>

              <div className="p-4 border rounded-lg">
                <Typography variant="small" color="gray">
                  Durée
                </Typography>
                <Typography className="font-medium">
                  {selectedPlan.duration_days} jours
                </Typography>
              </div>

              <div className="p-4 border rounded-lg">
                <Typography variant="small" color="gray">
                  Prix
                </Typography>
                <Typography variant="h5" className="text-blue-600">
                  {formatPrice(selectedPlan.price)}
                </Typography>
              </div>

              {selectedPlan.description && (
                <div className="p-4 border rounded-lg">
                  <Typography variant="small" color="gray" className="mb-2">
                    Description
                  </Typography>
                  <Typography className="text-sm">
                    {selectedPlan.description}
                  </Typography>
                </div>
              )}

              {formData.start_date && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Typography variant="small" color="blue-gray" className="font-medium">
                    Date de fin estimée
                  </Typography>
                  <Typography className="font-bold text-blue-600">
                    {new Date(
                      new Date(formData.start_date).getTime() +
                        selectedPlan.duration_days * 24 * 60 * 60 * 1000
                    ).toLocaleDateString('fr-FR')}
                  </Typography>
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {!selectedPlan && (
          <Card className="shadow-lg">
            <CardBody className="text-center py-12">
              <Typography color="gray" className="mb-4">
                Aperçu du Plan
              </Typography>
              <Typography variant="small" color="gray">
                Sélectionnez un plan pour voir les détails
              </Typography>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}

export default SubscriptionCreate;