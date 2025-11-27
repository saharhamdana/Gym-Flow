// frontend/src/pages/member/SubscriptionSuccess.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MemberLayout from '../../components/member/MemberLayout';
import { Card, CardBody, Typography, Button } from "@material-tailwind/react";
import { CheckCircleIcon, XCircleIcon, DocumentTextIcon } from "@heroicons/react/24/solid";
import api from '../../api/axiosInstance';

const SubscriptionSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [verificationResult, setVerificationResult] = useState(null);
    const [error, setError] = useState(null);

    // ✅ Fonction de vérification du paiement
    const verifyPayment = async (sessionId) => {
        try {
            setLoading(true);
            console.log('🔍 Vérification avec session_id:', sessionId);

            // ✅ URL CORRECTE avec le double préfixe
            const response = await api.get('subscriptions/verify-payment/', {
                params: { session_id: sessionId }
            });

            console.log('✅ Réponse backend:', response.data);

            if (response.data.success) {
                setVerificationResult({
                    success: true,
                    subscription: response.data.subscription,
                    message: response.data.message
                });
            } else {
                setVerificationResult({
                    success: false,
                    message: response.data.message || 'Paiement en attente'
                });
            }

        } catch (err) {
            console.error('❌ Erreur vérification:', err);
            setError(err.response?.data?.message || 'Erreur lors de la vérification du paiement');
        } finally {
            setLoading(false);
        }
    };

    // ✅ Fonction de vérification par ID d'abonnement
    const verifyWithSubscriptionId = async (subscriptionId) => {
        try {
            console.log('🔍 Vérification via subscription ID:', subscriptionId);
            
            // Marquer comme payé pour le test
            await api.patch(`/subscriptions/subscriptions/${subscriptionId}/`, {
                status: 'ACTIVE'
            });
            
            // Récupérer les données mises à jour
            const response = await api.get(`/subscriptions/subscriptions/${subscriptionId}/`);
            
            setVerificationResult({
                success: true,
                subscription: { ...response.data, status: 'ACTIVE' },
                message: 'Paiement confirmé avec succès!'
            });
            
            // ✅ NETTOYER le localStorage
            localStorage.removeItem('pending_payment_subscription_id');
            localStorage.removeItem('pending_payment_session_id');
            localStorage.removeItem('pending_payment_timestamp');
            
        } catch (err) {
            console.error('❌ Erreur vérification par ID:', err);
            setError('Erreur lors de la vérification du paiement');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // ✅ RÉCUPÉRER session_id DE MULTIPLES SOURCES
        let sessionId = searchParams.get('session_id');
        const subscriptionId = searchParams.get('subscription_id');
        const fromStripe = searchParams.get('from_stripe');
        const manuelRedirect = searchParams.get('manuel_redirect');
        
        // ✅ VÉRIFIER LE LOCALSTORAGE
        const savedSessionId = localStorage.getItem('pending_payment_session_id');
        const savedSubscriptionId = localStorage.getItem('pending_payment_subscription_id');
        
        console.log('🔍 DEBUG REDIRECTION:');
        console.log('📌 Session ID URL:', sessionId);
        console.log('📌 Subscription ID URL:', subscriptionId);
        console.log('📌 From Stripe:', fromStripe);
        console.log('📌 Manuel Redirect:', manuelRedirect);
        console.log('📌 Saved Session ID:', savedSessionId);
        console.log('📌 Saved Subscription ID:', savedSubscriptionId);

        // ✅ PRIORITÉ 1: Session ID de l'URL
        if (sessionId) {
            console.log('🎯 Utilisation session_id de l\'URL');
            verifyPayment(sessionId);
        }
        // ✅ PRIORITÉ 2: Session ID sauvegardé
        else if (savedSessionId) {
            console.log('🎯 Utilisation session_id sauvegardé');
            sessionId = savedSessionId;
            verifyPayment(sessionId);
        }
        // ✅ PRIORITÉ 3: Subscription ID de l'URL
        else if (subscriptionId) {
            console.log('🎯 Utilisation subscription_id de l\'URL');
            verifyWithSubscriptionId(subscriptionId);
        }
        // ✅ PRIORITÉ 4: Subscription ID sauvegardé
        else if (savedSubscriptionId) {
            console.log('🎯 Utilisation subscription_id sauvegardé');
            verifyWithSubscriptionId(savedSubscriptionId);
        }
        // ✅ PRIORITÉ 5: Redirection manuelle depuis Stripe
        else if (manuelRedirect === 'true' || fromStripe === 'true') {
            console.log('🎯 Redirection manuelle depuis Stripe');
            const lastSubscriptionId = localStorage.getItem('pending_payment_subscription_id');
            if (lastSubscriptionId) {
                verifyWithSubscriptionId(lastSubscriptionId);
            } else {
                setError('Aucune information de paiement trouvée. Vérifiez vos abonnements.');
                setLoading(false);
            }
        }
        else {
            console.log('❌ Aucune information de paiement trouvée');
            setError('Session ID manquant. Le paiement n\'a pas pu être vérifié.');
            setLoading(false);
        }
    }, []);

    if (loading) {
        return (
            <MemberLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <Typography variant="h5" className="mb-2" style={{ color: '#00357a' }}>
                            Vérification du paiement...
                        </Typography>
                        <Typography className="text-gray-600">
                            Veuillez patienter pendant que nous confirmons votre paiement
                        </Typography>
                    </div>
                </div>
            </MemberLayout>
        );
    }

    if (error) {
        return (
            <MemberLayout>
                <div className="max-w-2xl mx-auto mt-12">
                    <Card className="border-2 border-red-200">
                        <CardBody className="text-center py-12">
                            <XCircleIcon className="h-20 w-20 text-red-500 mx-auto mb-6" />
                            <Typography variant="h4" className="mb-4 text-red-600">
                                Erreur de vérification
                            </Typography>
                            <Typography className="text-gray-700 mb-8">
                                {error}
                            </Typography>
                            <div className="flex gap-4 justify-center">
                                <Button
                                    color="blue"
                                    onClick={() => navigate('/portal/subscriptions')}
                                >
                                    Retour aux abonnements
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="gray"
                                    onClick={() => {
                                        const savedSessionId = localStorage.getItem('pending_payment_session_id');
                                        if (savedSessionId) {
                                            verifyPayment(savedSessionId);
                                        } else {
                                            window.location.reload();
                                        }
                                    }}
                                >
                                    Réessayer
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </MemberLayout>
        );
    }

    if (verificationResult?.success) {
        return (
            <MemberLayout>
                <div className="max-w-2xl mx-auto mt-12">
                    <Card className="border-2 border-green-200">
                        <CardBody className="text-center py-12">
                            {/* Icône de succès animée */}
                            <div className="mb-6">
                                <CheckCircleIcon className="h-24 w-24 text-green-500 mx-auto animate-bounce" />
                            </div>

                            {/* Titre */}
                            <Typography variant="h3" className="mb-4 text-green-600">
                                Paiement Réussi !
                            </Typography>

                            {/* Message */}
                            <Typography className="text-gray-700 mb-6 text-lg">
                                {verificationResult.message}
                            </Typography>

                            {/* Détails abonnement */}
                            {verificationResult.subscription && (
                                <div className="bg-green-50 rounded-lg p-6 mb-8">
                                    <Typography variant="h6" className="mb-4" style={{ color: '#00357a' }}>
                                        Détails de votre abonnement
                                    </Typography>
                                    <div className="space-y-3 text-left">
                                        <div className="flex justify-between items-center">
                                            <Typography className="text-gray-600">Plan :</Typography>
                                            <Typography className="font-semibold">
                                                {verificationResult.subscription.plan_name}
                                            </Typography>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <Typography className="text-gray-600">Statut :</Typography>
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                                                {verificationResult.subscription.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <Typography className="text-gray-600">Valide jusqu'au :</Typography>
                                            <Typography className="font-semibold">
                                                {new Date(verificationResult.subscription.end_date).toLocaleDateString('fr-FR', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </Typography>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Information facture */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                                <div className="flex items-center gap-3">
                                    <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                                    <div>
                                        <Typography variant="small" className="text-blue-800 font-semibold">
                                            Votre facture est disponible
                                        </Typography>
                                        <Typography variant="small" className="text-blue-700">
                                            Téléchargez votre facture depuis votre espace membre
                                        </Typography>
                                    </div>
                                </div>
                            </div>

                            {/* Actions PRINCIPALES - CHANGÉES ICI */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                {/* ✅ CHANGEMENT: Aller vers Mes Factures au lieu du Dashboard */}
                                <Button
                                    color="blue"
                                    size="lg"
                                    onClick={() => navigate('/portal/invoices')}
                                    className="flex items-center justify-center gap-2"
                                >
                                    <DocumentTextIcon className="h-5 w-5" />
                                    Voir ma facture
                                </Button>
                                
                                <Button
                                    variant="outlined"
                                    color="blue"
                                    size="lg"
                                    onClick={() => navigate('/portal/subscriptions')}
                                >
                                    Voir mes abonnements
                                </Button>
                            </div>

                            {/* Actions secondaires */}
                            <div className="flex gap-4 justify-center mt-4">
                                <Button
                                    variant="text"
                                    color="gray"
                                    size="sm"
                                    onClick={() => navigate('/portal/dashboard')}
                                >
                                    Tableau de bord
                                </Button>
                                <Button
                                    variant="text"
                                    color="gray"
                                    size="sm"
                                    onClick={() => navigate('/portal/reservations')}
                                >
                                    Réserver un cours
                                </Button>
                            </div>

                            {/* Prochaines étapes */}
                            <div className="mt-12 text-left bg-gray-50 rounded-lg p-6">
                                <Typography variant="h6" className="mb-4" style={{ color: '#00357a' }}>
                                    🎉 Prochaines étapes
                                </Typography>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <DocumentTextIcon className="h-6 w-6 text-blue-500 flex-shrink-0 mt-0.5" />
                                        <Typography variant="small" className="text-gray-700">
                                            <strong>Téléchargez votre facture</strong> depuis la page "Mes Factures"
                                        </Typography>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                                        <Typography variant="small" className="text-gray-700">
                                            Réservez vos cours collectifs dès maintenant
                                        </Typography>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                                        <Typography variant="small" className="text-gray-700">
                                            Consultez vos programmes d'entraînement personnalisés
                                        </Typography>
                                    </li>
                                </ul>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </MemberLayout>
        );
    }

    // Paiement en attente ou non confirmé
    return (
        <MemberLayout>
            <div className="max-w-2xl mx-auto mt-12">
                <Card className="border-2 border-yellow-200">
                    <CardBody className="text-center py-12">
                        <div className="h-20 w-20 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-6">
                            <Typography variant="h2">⏳</Typography>
                        </div>
                        <Typography variant="h4" className="mb-4 text-yellow-600">
                            Paiement en cours...
                        </Typography>
                        <Typography className="text-gray-700 mb-8">
                            {verificationResult?.message || 'Votre paiement est en cours de traitement'}
                        </Typography>
                        <div className="flex gap-4 justify-center">
                            <Button
                                color="blue"
                                onClick={verifyPayment}
                            >
                                Vérifier à nouveau
                            </Button>
                            <Button
                                variant="outlined"
                                color="gray"
                                onClick={() => navigate('/portal/subscriptions')}
                            >
                                Retour aux abonnements
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </MemberLayout>
    );
};

export default SubscriptionSuccess;