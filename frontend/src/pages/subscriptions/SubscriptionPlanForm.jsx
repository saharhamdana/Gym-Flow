// File: frontend/src/pages/subscriptions/SubscriptionPlanForm.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  CardBody,
  Typography,
  Input,
  Textarea,
  Button,
  Switch,
  Alert,
  Spinner,
} from '@material-tailwind/react';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import PageContainer from '@/components/admin/PageContainer';
import {
  createSubscriptionPlan,
  updateSubscriptionPlan,
  getSubscriptionPlan,
} from '@/services/subscriptionService';

export function SubscriptionPlanForm() {
  const navigate = useNavigate();
  const { planId } = useParams();
  const isEditMode = Boolean(planId);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration_days: '',
    price: '',
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      fetchPlan();
    }
  }, [planId]);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const data = await getSubscriptionPlan(planId);
      setFormData({
        name: data.name || '',
        description: data.description || '',
        duration_days: data.duration_days || '',
        price: data.price || '',
        is_active: data.is_active,
      });
      setError(null);
    } catch (error) {
      console.error('Error fetching plan:', error);
      setError('Impossible de charger le plan');
    } finally {
      setLoading(false);
    }
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

  const handleSwitchChange = (checked) => {
    setFormData((prev) => ({
      ...prev,
      is_active: checked,
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    if (!formData.duration_days || formData.duration_days <= 0) {
      newErrors.duration_days = 'La durée doit être supérieure à 0';
    }

    if (!formData.price || formData.price < 0) {
      newErrors.price = 'Le prix doit être positif';
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
      if (isEditMode) {
        await updateSubscriptionPlan(planId, formData);
      } else {
        await createSubscriptionPlan(formData);
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/subscription-plans');
      }, 1500);
    } catch (error) {
      console.error('Error saving plan:', error);
      setError('Erreur lors de l\'enregistrement du plan');
    } finally {
      setSubmitting(false);
    }
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

  return (
    <PageContainer>
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="text"
          className="flex items-center gap-2"
          onClick={() => navigate('/admin/subscription-plans')}
        >
          <ArrowLeftIcon className="h-4 w-4" /> Retour
        </Button>
        <Typography variant="h4" color="blue-gray">
          {isEditMode ? 'Modifier le Plan' : 'Nouveau Plan d\'Abonnement'}
        </Typography>
      </div>

      {error && <Alert color="red" className="mb-4">{error}</Alert>}
      {success && <Alert color="green" className="mb-4">Plan {isEditMode ? 'modifié' : 'créé'} avec succès !</Alert>}

      <Card className="shadow-lg">
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <Input
              label="Nom du Plan *"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={Boolean(errors.name)}
              required
            />
            {errors.name && (
              <Typography variant="small" color="red" className="mt-1">
                {errors.name}
              </Typography>
            )}

            {/* Description */}
            <Textarea
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
            />

            {/* Duration and Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  type="number"
                  label="Durée (jours) *"
                  name="duration_days"
                  value={formData.duration_days}
                  onChange={handleChange}
                  error={Boolean(errors.duration_days)}
                  required
                />
                {errors.duration_days && (
                  <Typography variant="small" color="red" className="mt-1">
                    {errors.duration_days}
                  </Typography>
                )}
              </div>

              <div>
                <Input
                  type="number"
                  step="0.01"
                  label="Prix (TND) *"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  error={Boolean(errors.price)}
                  required
                />
                {errors.price && (
                  <Typography variant="small" color="red" className="mt-1">
                    {errors.price}
                  </Typography>
                )}
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-3">
              <Switch
                checked={formData.is_active}
                onChange={(e) => handleSwitchChange(e.target.checked)}
                label="Plan actif"
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
                {submitting
                  ? 'Enregistrement...'
                  : isEditMode
                  ? 'Sauvegarder'
                  : 'Créer le Plan'}
              </Button>
              <Button
                type="button"
                variant="outlined"
                onClick={() => navigate('/admin/subscription-plans')}
                disabled={submitting}
              >
                Annuler
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </PageContainer>
  );
}

export default SubscriptionPlanForm;