// File: frontend/src/services/subscriptionService.js

import api from '@/api/axiosInstance';

// ==========================================
// SUBSCRIPTION PLANS
// ==========================================

export const getSubscriptionPlans = async (search = '') => {
  const params = search ? { search } : {};
  const response = await api.get('subscriptions/plans/', { params });
  return response.data;
};

export const getSubscriptionPlan = async (id) => {
  const response = await api.get(`subscriptions/plans/${id}/`);
  return response.data;
};

export const createSubscriptionPlan = async (planData) => {
  const response = await api.post('subscriptions/plans/', planData);
  return response.data;
};

export const updateSubscriptionPlan = async (id, planData) => {
  const response = await api.put(`subscriptions/plans/${id}/`, planData);
  return response.data;
};

export const deleteSubscriptionPlan = async (id) => {
  const response = await api.delete(`subscriptions/plans/${id}/`);
  return response.data;
};

// ==========================================
// SUBSCRIPTIONS
// ==========================================

export const getSubscriptions = async (filters = {}) => {
  const response = await api.get('subscriptions/subscriptions/', { params: filters });
  return response.data;
};

export const getSubscription = async (id) => {
  const response = await api.get(`subscriptions/subscriptions/${id}/`);
  return response.data;
};

export const createSubscription = async (subscriptionData) => {
  const response = await api.post('subscriptions/subscriptions/', subscriptionData);
  return response.data;
};

export const updateSubscription = async (id, subscriptionData) => {
  const response = await api.put(`subscriptions/subscriptions/${id}/`, subscriptionData);
  return response.data;
};

export const deleteSubscription = async (id) => {
  const response = await api.delete(`subscriptions/subscriptions/${id}/`);
  return response.data;
};

// ==========================================
// SUBSCRIPTION ACTIONS
// ==========================================

export const activateSubscription = async (id) => {
  const response = await api.post(`subscriptions/subscriptions/${id}/activate/`);
  return response.data;
};

export const cancelSubscription = async (id) => {
  const response = await api.post(`subscriptions/subscriptions/${id}/cancel/`);
  return response.data;
};

export const getExpiringSoonSubscriptions = async () => {
  const response = await api.get('subscriptions/subscriptions/expiring_soon/');
  return response.data;
};

export const getSubscriptionStatistics = async () => {
  const response = await api.get('subscriptions/subscriptions/statistics/');
  return response.data;
};