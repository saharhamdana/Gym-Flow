// frontend/src/pages/member/PaymentSuccess.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardBody, Typography, Button } from "@material-tailwind/react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import api from '../../api/axiosInstance';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [subscription, setSubscription] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      setStatus('error');
      setError('Session de paiement invalide');
      return;
    }

    try {
      const response = await api.get('/subscriptions/subscriptions/verify-payment/', {
        params: { session_id: sessionId }
      });

      if (response.data.success) {
        setStatus('success');
        setSubscription(response.data.subscription);
      } else {
        setStatus('error');
        setError('Le paiement n\'a pas été complété');
      }
    } catch (error) {
      console.error('Erreur vérification:', error);
      setStatus('error');
      setError(error.response?.data?.message || 'Erreur lors de la vérification du paiement');
    }
  };

  if (status === 'verifying') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <Typography variant="h5" className="mb-2" style={{ color: '#00357a' }}>
            Vérification du paiement...
          </Typography>
          <Typography className="text-gray-600">
            Veuillez patienter pendant que nous vérifions votre paiement
          </Typography>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Card className="max-w-lg w-full">
          <CardBody className="text-center py-12">
            <div className="mb-6">
              <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircleIcon className="h-16 w-16 text-green-600" />
              </div>
              <Typography variant="h3" className="mb-2" style={{ color: '#00357a' }}>
                Paiement réussi !
              </Typography>
              <Typography className="text-gray-600 mb-6">
                Votre abonnement a été activé avec succès
              </Typography>
            </div>

            {subscription && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                <Typography variant="h6" className="mb-4" style={{ color: '#00357a' }}>
                  Détails de l'abonnement
                </Typography>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Typography variant="small" className="text-gray-600">
                      Plan
                    </Typography>
                    <Typography variant="small" className="font-semibold">
                      {subscription.plan_name}
                    </Typography>
                  </div>
                  <div className="flex justify-between">
                    <Typography variant="small" className="text-gray-600">
                      Date d'expiration
                    </Typography>
                    <Typography variant="small" className="font-semibold">
                      {new Date(subscription.end_date).toLocaleDateString('fr-FR')}
                    </Typography>
                  </div>
                  <div className="flex justify-between">
                    <Typography variant="small" className="text-gray-600">
                      Statut
                    </Typography>
                    <Typography variant="small" className="font-semibold text-green-600">
                      Actif
                    </Typography>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Button
                color="blue"
                onClick={() => navigate('/portal/subscription/plans')}
                fullWidth
              >
                Voir mes abonnements
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/portal/dashboard')}
                fullWidth
              >
                Retour au tableau de bord
              </Button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <Typography variant="small" className="text-gray-700">
                📧 Un reçu de paiement a été envoyé à votre adresse email
              </Typography>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <Card className="max-w-lg w-full">
        <CardBody className="text-center py-12">
          <div className="mb-6">
            <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircleIcon className="h-16 w-16 text-red-600" />
            </div>
            <Typography variant="h3" className="mb-2" style={{ color: '#9b0e16' }}>
              Échec du paiement
            </Typography>
            <Typography className="text-gray-600 mb-6">
              {error || 'Une erreur est survenue lors du traitement de votre paiement'}
            </Typography>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              color="blue"
              onClick={() => navigate('/portal/subscription/plans')}
              fullWidth
            >
              Réessayer le paiement
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/portal/dashboard')}
              fullWidth
            >
              Retour au tableau de bord
            </Button>
          </div>

          <div className="mt-6 p-4 bg-amber-50 rounded-lg">
            <Typography variant="small" className="text-gray-700">
              💡 Si vous avez des questions, contactez notre support
            </Typography>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default PaymentSuccess;