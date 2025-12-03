# backend/subscriptions/stripe_service.py
import stripe
from django.conf import settings
import logging

logger = logging.getLogger('stripe')

# Configuration Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

class StripeService:
    """Service pour gérer les paiements Stripe"""
    
    # ✅ CORRECTION : LA MÉTHODE DOIT ÊTRE DANS LA CLASSE !
    @staticmethod
    def create_checkout_session(subscription, success_url, cancel_url):
        """
        Créer une session de paiement Stripe Checkout - VERSION CORRIGÉE
        """
        try:
            # Vérification des données requises
            if not subscription.plan:
                raise Exception("Plan manquant pour la subscription")
            
            # Conversion du montant (TND vers centimes)
            amount_in_eur = StripeService._convert_tnd_to_eur(subscription.amount_paid)
            
            # ✅ CORRECTION: Créer la session avec les bons paramètres
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'eur',
                        'unit_amount': int(amount_in_eur * 100),  # Conversion en centimes
                        'product_data': {
                            'name': f"Abonnement {subscription.plan.name}",
                            'description': f"Durée: {subscription.plan.duration_days} jours",
                        },
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=success_url,
                cancel_url=cancel_url,
                client_reference_id=str(subscription.id),
                metadata={
                    'subscription_id': str(subscription.id),
                    'member_id': str(subscription.member.id),
                    'plan_id': str(subscription.plan.id),
                    'tenant_id': str(subscription.tenant_id),
                }
            )
            
            # ✅ CORRECTION: Sauvegarder le session_id
            subscription.stripe_session_id = session.id
            subscription.save(update_fields=['stripe_session_id', 'updated_at'])
            
            logger.info(f"✅ Session Stripe créée: {session.id} pour subscription {subscription.id}")
            
            return {
                'session_id': session.id,
                'url': session.url,
                'status': 'created'
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"❌ Erreur Stripe: {str(e)}")
            raise Exception(f"Erreur lors de la création de la session de paiement: {str(e)}")
        except Exception as e:
            logger.error(f"❌ Erreur inattendue: {str(e)}")
            raise
    
    @staticmethod
    def _convert_tnd_to_eur(amount_tnd):
        """
        Convertir TND en EUR (taux approximatif)
        À remplacer par un service de conversion en temps réel
        """
        # Taux de conversion approximatif (1 EUR ≈ 3.3 TND)
        conversion_rate = 0.30  # 1 TND = 0.30 EUR
        return float(amount_tnd) * conversion_rate
    
    @staticmethod
    def retrieve_session(session_id):
        """
        Récupérer une session Stripe
        
        Args:
            session_id: ID de la session Stripe
        
        Returns:
            stripe.checkout.Session
        """
        try:
            session = stripe.checkout.Session.retrieve(session_id)
            return session
        except stripe.error.StripeError as e:
            logger.error(f"❌ Erreur récupération session: {str(e)}")
            raise Exception(f"Impossible de récupérer la session: {str(e)}")
    
    @staticmethod
    def verify_webhook_signature(payload, sig_header):
        """
        Vérifier la signature du webhook Stripe
        
        Args:
            payload: Corps de la requête
            sig_header: Header Stripe-Signature
        
        Returns:
            stripe.Event
        """
        try:
            webhook_secret = settings.STRIPE_WEBHOOK_SECRET
            event = stripe.Webhook.construct_event(
                payload, sig_header, webhook_secret
            )
            return event
        except ValueError as e:
            logger.error("❌ Payload invalide")
            raise Exception("Payload invalide")
        except stripe.error.SignatureVerificationError as e:
            logger.error("❌ Signature invalide")
            raise Exception("Signature invalide")
    
    @staticmethod
    def get_payment_intent(payment_intent_id):
        """
        Récupérer un PaymentIntent
        
        Args:
            payment_intent_id: ID du PaymentIntent
        
        Returns:
            stripe.PaymentIntent
        """
        try:
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            return payment_intent
        except stripe.error.StripeError as e:
            logger.error(f"❌ Erreur récupération PaymentIntent: {str(e)}")
            raise Exception(f"Impossible de récupérer le paiement: {str(e)}")
    
    @staticmethod
    def handle_successful_payment(session_id):
        """
        Traiter un paiement réussi
        
        Args:
            session_id: ID de la session Stripe
        """
        try:
            session = StripeService.retrieve_session(session_id)
            
            if session.payment_status == 'paid':
                # Récupérer la subscription depuis la base de données
                from .models import Subscription
                
                subscription_id = session.metadata.get('subscription_id')
                subscription = Subscription.objects.get(id=subscription_id)
                
                # Mettre à jour le statut de la subscription
                subscription.status = 'active'
                subscription.payment_status = 'paid'
                subscription.stripe_session_id = session_id
                subscription.save()
                
                logger.info(f"✅ Paiement confirmé pour subscription {subscription_id}")
                
                return subscription
            else:
                logger.warning(f"⚠️ Paiement non complet pour session {session_id}")
                return None
                
        except Exception as e:
            logger.error(f"❌ Erreur traitement paiement: {str(e)}")
            raise