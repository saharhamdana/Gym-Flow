// File: frontend/src/pages/subscriptions/SubscriptionPlanForm.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Input,
  Textarea,
  Button,
  Switch,
} from '@material-tailwind/react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
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
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditMode) {
      fetchPlan();
    }
  }, [planId]);

  const fetchPlan = async () => {
    try {
      const data = await getSubscriptionPlan(planId);
      setFormData(data);
    } catch (error) {
      console.error('Error fetching plan:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
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

    setLoading(true);

    try {
      if (isEditMode) {
        await updateSubscriptionPlan(planId, formData);
      } else {
        await createSubscriptionPlan(formData);
      }
      navigate('/admin/subscription-plans');
    } catch (error) {
      console.error('Error saving plan:', error);
      alert('Erreur lors de l\'enregistrement du plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-12 mb-8">
      <Button
        variant="text"
        className="flex items-center gap-2 mb-6"
        onClick={() => navigate('/admin/subscription-plans')}
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Retour
      </Button>

      <Card>
        <CardHeader
          variant="gradient"
          style={{ background: 'linear-gradient(87deg, #00357a 0, #0056b3 100%)' }}
          className="mb-8 p-6"
        >
          <Typography variant="h6" color="white">
            {isEditMode ? 'Modifier le Plan' : 'Nouveau Plan d\'Abonnement'}
          </Typography>
        </CardHeader>

        <CardBody>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Name */}
            <div>
              <Input
                label="Nom du Plan *"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={Boolean(errors.name)}
              />
              {errors.name && (
                <Typography variant="small" color="red" className="mt-1">
                  {errors.name}
                </Typography>
              )}
            </div>

            {/* Description */}
            <div>
              <Textarea
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
              />
            </div>

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
                />
                {errors.price && (
                  <Typography variant="small" color="red" className="mt-1">
                    {errors.price}
                  </Typography>
                )}
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-4">
              <Switch
                checked={formData.is_active}
                onChange={(e) => handleSwitchChange(e.target.checked)}
                label={
                  <Typography variant="small" className="font-medium">
                    Plan actif
                  </Typography>
                }
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="submit"
                style={{ backgroundColor: '#00357a' }}
                disabled={loading}
                fullWidth
              >
                {loading
                  ? 'Enregistrement...'
                  : isEditMode
                  ? 'Modifier'
                  : 'Créer le Plan'}
              </Button>
              <Button
                type="button"
                variant="outlined"
                onClick={() => navigate('/admin/subscription-plans')}
                fullWidth
              >
                Annuler
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

export default SubscriptionPlanForm;