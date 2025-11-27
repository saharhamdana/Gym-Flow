// frontend/src/pages/member/MemberSubscriptions.jsx
// ✅ VERSION COMPLÈTE avec affichage des abonnements

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Typography, Button, Chip, Progress } from "@material-tailwind/react";
import {
  CreditCardIcon, CheckCircleIcon, XCircleIcon, ClockIcon,
  CalendarIcon, BanknotesIcon, ExclamationTriangleIcon
} from "@heroicons/react/24/solid";
import api from '../../api/axiosInstance';

const MemberSubscriptions = () => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/subscriptions/subscriptions/');

      console.log('📦 Réponse API:', response.data);

      // Gérer pagination DRF
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      console.log('✅ Abonnements chargés:', data);
      setSubscriptions(data);
    } catch (error) {
      console.error('❌ Erreur chargement abonnements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (subscriptionId) => {
    try {
      setProcessingId(subscriptionId);

      const response = await api.post(
        `subscriptions/create-payment/${subscriptionId}/`  // ✅ Sans subscriptions/ en double
      );

      console.log('✅ Session créée:', response.data);

      // ✅ SAUVEGARDER les données avant redirection
      localStorage.setItem('pending_payment_subscription_id', subscriptionId);
      localStorage.setItem('pending_payment_session_id', response.data.session_id);
      localStorage.setItem('pending_payment_timestamp', Date.now().toString());

      console.log('💾 Données sauvegardées:', {
        subscriptionId,
        sessionId: response.data.session_id
      });

      // ✅ OUVERTURE DANS UN NOUVEL ONGLET AVEC VÉRIFICATION
      const stripeWindow = window.open(
        response.data.url,
        'stripe-checkout',
        'width=500,height=600,scrollbars=yes'
      );

      // ✅ VÉRIFIER SI LA FENÊTRE N'EST PAS BLOQUÉE
      if (!stripeWindow || stripeWindow.closed || typeof stripeWindow.closed === 'undefined') {
        console.log('⚠️ Popup bloquée, redirection directe');
        // Si popup bloquée, rediriger directement
        window.location.href = response.data.url;
        return;
      }

      // ✅ VÉRIFIER QUAND STRIPE SE FERME (SEULEMENT SI FENÊTRE OUVERTE)
      const checkWindow = setInterval(() => {
        if (stripeWindow.closed) {
          clearInterval(checkWindow);
          console.log('🎯 Fenêtre Stripe fermée, redirection vers succès...');

          // Rediriger vers la page de succès avec les données sauvegardées
          const savedSubscriptionId = localStorage.getItem('pending_payment_subscription_id');
          const savedSessionId = localStorage.getItem('pending_payment_session_id');

          if (savedSubscriptionId && savedSessionId) {
            window.location.href = `/portal/subscription/success?session_id=${savedSessionId}&subscription_id=${savedSubscriptionId}&from_stripe=true`;
          } else {
            window.location.href = '/portal/subscription/success?manuel_redirect=true';
          }
        }
      }, 1000);

      // ✅ TIMEOUT DE SÉCURITÉ (au cas où la fenêtre ne se ferme pas)
      setTimeout(() => {
        clearInterval(checkWindow);
        console.log('⏰ Timeout - vérification automatique');
      }, 300000); // 5 minutes

    } catch (error) {
      console.error('❌ Erreur paiement:', error);
      setProcessingId(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'ACTIVE': 'green',
      'PENDING': 'amber',
      'EXPIRED': 'red',
      'CANCELLED': 'gray'
    };
    return colors[status] || 'gray';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'ACTIVE': 'Actif',
      'PENDING': 'En attente de paiement',
      'EXPIRED': 'Expiré',
      'CANCELLED': 'Annulé'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <Typography className="text-gray-600">Chargement...</Typography>
        </div>
      </div>
    );
  }

  const activeSubscription = subscriptions.find(s => s.status === 'ACTIVE');
  const pendingSubscriptions = subscriptions.filter(s => s.status === 'PENDING');
  const historySubscriptions = subscriptions.filter(s =>
    ['EXPIRED', 'CANCELLED'].includes(s.status)
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
        <Typography variant="h3" color="white" className="mb-2">
          Mes Abonnements
        </Typography>
        <Typography className="text-blue-100">
          Gérez vos abonnements et effectuez vos paiements en ligne
        </Typography>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-blue-500">
          <CardBody className="flex items-center gap-4 p-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <CreditCardIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <Typography variant="h4" color="blue-gray">
                {subscriptions.length}
              </Typography>
              <Typography variant="small" color="gray">
                Total
              </Typography>
            </div>
          </CardBody>
        </Card>

        <Card className="border-l-4 border-amber-500">
          <CardBody className="flex items-center gap-4 p-4">
            <div className="p-3 bg-amber-100 rounded-full">
              <ClockIcon className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <Typography variant="h4" color="blue-gray">
                {pendingSubscriptions.length}
              </Typography>
              <Typography variant="small" color="gray">
                En attente
              </Typography>
            </div>
          </CardBody>
        </Card>

        <Card className="border-l-4 border-green-500">
          <CardBody className="flex items-center gap-4 p-4">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <Typography variant="h4" color="blue-gray">
                {activeSubscription ? 1 : 0}
              </Typography>
              <Typography variant="small" color="gray">
                Actif
              </Typography>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Abonnement actif */}
      {activeSubscription && (
        <Card className="border-l-4 border-green-500">
          <CardBody>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <Typography variant="h5" style={{ color: '#00357a' }}>
                    Abonnement Actif
                  </Typography>
                  <Typography variant="small" className="text-gray-600">
                    {activeSubscription.plan_name}
                  </Typography>
                </div>
              </div>
              <Chip
                value="Actif"
                color="green"
                icon={<CheckCircleIcon className="h-4 w-4" />}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <Typography variant="small" className="text-gray-600 mb-1">
                  Date de fin
                </Typography>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" style={{ color: '#9b0e16' }} />
                  <Typography className="font-semibold">
                    {new Date(activeSubscription.end_date).toLocaleDateString('fr-FR')}
                  </Typography>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <Typography variant="small" className="text-gray-600 mb-1">
                  Jours restants
                </Typography>
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-5 w-5" style={{ color: '#9b0e16' }} />
                  <Typography className="font-semibold">
                    {activeSubscription.days_remaining} jours
                  </Typography>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <Typography variant="small" className="text-gray-600 mb-1">
                  Montant payé
                </Typography>
                <div className="flex items-center gap-2">
                  <BanknotesIcon className="h-5 w-5" style={{ color: '#9b0e16' }} />
                  <Typography className="font-semibold">
                    {parseFloat(activeSubscription.amount_paid).toFixed(3)} TND
                  </Typography>
                </div>
              </div>
            </div>

            {/* Barre de progression */}
            {activeSubscription.days_remaining !== undefined && (
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <Typography variant="small" color="gray">
                    Progression
                  </Typography>
                  <Typography variant="small" color="gray">
                    {activeSubscription.days_remaining} jours restants
                  </Typography>
                </div>
                <Progress
                  value={Math.min(100, (activeSubscription.days_remaining / 30) * 100)}
                  color={
                    activeSubscription.days_remaining > 7 ? "green" :
                      activeSubscription.days_remaining > 3 ? "amber" : "red"
                  }
                  className="h-2"
                />
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Abonnements en attente de paiement */}
      {pendingSubscriptions.length > 0 && (
        <div className="space-y-4">
          <Typography variant="h5" style={{ color: '#00357a' }}>
            ⏳ En attente de paiement
          </Typography>
          {pendingSubscriptions.map((subscription) => (
            <Card key={subscription.id} className="border-l-4 border-amber-500">
              <CardBody>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-amber-100 rounded-full">
                        <ClockIcon className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <Typography variant="h6" color="blue-gray">
                          {subscription.plan_name}
                        </Typography>
                        <Chip
                          value="Paiement requis"
                          color="amber"
                          size="sm"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <Typography variant="small" className="text-gray-600">
                          Durée
                        </Typography>
                        <Typography className="font-semibold">
                          30 jours
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="small" className="text-gray-600">
                          Montant à payer
                        </Typography>
                        <Typography className="font-semibold text-lg" style={{ color: '#00357a' }}>
                          {parseFloat(subscription.amount_paid).toFixed(3)} TND
                        </Typography>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 md:w-48">
                    <Button
                      color="blue"
                      className="flex items-center justify-center gap-2"
                      onClick={() => handlePayment(subscription.id)}
                      disabled={processingId === subscription.id}
                    >
                      {processingId === subscription.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Traitement...
                        </>
                      ) : (
                        <>
                          <CreditCardIcon className="h-5 w-5" />
                          Payer maintenant
                        </>
                      )}
                    </Button>
                    <Typography variant="small" className="text-center text-gray-600">
                      Paiement sécurisé par Stripe
                    </Typography>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Historique */}
      {historySubscriptions.length > 0 && (
        <div className="space-y-4">
          <Typography variant="h5" style={{ color: '#00357a' }}>
            📜 Historique
          </Typography>
          <div className="space-y-3">
            {historySubscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${subscription.status === 'EXPIRED' ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                    <XCircleIcon className={`h-5 w-5 ${subscription.status === 'EXPIRED' ? 'text-red-600' : 'text-gray-600'
                      }`} />
                  </div>
                  <div>
                    <Typography variant="small" className="font-semibold">
                      {subscription.plan_name}
                    </Typography>
                    <Typography variant="small" className="text-gray-600">
                      {new Date(subscription.start_date).toLocaleDateString('fr-FR')} -
                      {new Date(subscription.end_date).toLocaleDateString('fr-FR')}
                    </Typography>
                  </div>
                </div>
                <Chip
                  value={getStatusLabel(subscription.status)}
                  color={getStatusColor(subscription.status)}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aucun abonnement */}
      {subscriptions.length === 0 && (
        <Card>
          <CardBody className="text-center py-12">
            <CreditCardIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <Typography variant="h6" className="mb-2" style={{ color: '#00357a' }}>
              Aucun abonnement
            </Typography>
            <Typography className="text-gray-600 mb-4">
              Vous n'avez pas encore d'abonnement. Contactez la réception pour souscrire.
            </Typography>
          </CardBody>
        </Card>
      )}

      {/* Informations paiement */}
      <Card className="bg-blue-50 border border-blue-200">
        <CardBody>
          <Typography variant="h6" className="mb-3" style={{ color: '#00357a' }}>
            💳 Paiement sécurisé
          </Typography>
          <div className="space-y-2 text-sm text-gray-700">
            <p>• Tous les paiements sont sécurisés par Stripe</p>
            <p>• Cartes acceptées: Visa, Mastercard, American Express</p>
            <p>• Vos données bancaires ne sont jamais stockées sur nos serveurs</p>
            <p>• Vous recevrez un reçu par email après chaque paiement</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default MemberSubscriptions;