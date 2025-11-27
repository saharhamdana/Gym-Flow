# backend/subscriptions/stripe_views.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from django.utils import timezone
import logging

from .models import Subscription
from .stripe_service import StripeService
from members.models import Member

logger = logging.getLogger('stripe')


def get_frontend_url(request):
    return "https://powerfit-gymflow.loca.lt"


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_session(request, subscription_id):
    """
    🔐 Créer une session de paiement Stripe - VERSION MULTI-TENANT
    """
    try:
        user = request.user
        
        if user.role != 'MEMBER':
            return Response({
                'error': 'Accès refusé',
                'message': 'Seuls les membres peuvent effectuer des paiements'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            member = user.member_profile
            logger.info(f"🔍 User ID: {user.id} → Member ID: {member.id} ({member.member_id})")
        except Member.DoesNotExist:
            return Response({
                'error': 'Profil membre introuvable',
                'message': 'Votre profil membre n\'existe pas. Contactez l\'administration.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        try:
            subscription = Subscription.objects.select_related('plan', 'member').get(
                id=subscription_id,
                member=member,
                tenant_id=request.tenant_id
            )
            logger.info(f"✅ Abonnement trouvé: ID {subscription.id}, Member ID {subscription.member_id}")
        except Subscription.DoesNotExist:
            logger.error(f"❌ Abonnement {subscription_id} introuvable pour member {member.id}")
            return Response({
                'error': 'Abonnement introuvable',
                'message': 'Cet abonnement n\'existe pas ou ne vous appartient pas'
            }, status=status.HTTP_404_NOT_FOUND)
        
        if subscription.status != 'PENDING':
            return Response({
                'error': 'Paiement non autorisé',
                'message': f'Cet abonnement est déjà {subscription.get_status_display().lower()}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        frontend_url = get_frontend_url(request)
        success_url = f"{frontend_url}/portal/subscription/success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{frontend_url}/portal/subscriptions"
        
        session_data = StripeService.create_checkout_session(
            subscription=subscription,
            success_url=success_url,
            cancel_url=cancel_url
        )
        
        subscription.stripe_session_id = session_data['session_id']
        subscription.save(update_fields=['stripe_session_id', 'updated_at'])
        
        logger.info(f"✅ Session Stripe créée pour {member.member_id}")
        
        return Response({
            'session_id': session_data['session_id'],
            'url': session_data['url'],
            'message': 'Session de paiement créée avec succès'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"❌ Erreur création session: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            'error': 'Erreur serveur',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verify_payment(request):
    """
    ✅ Vérifier le paiement après redirection Stripe
    """
    try:
        user = request.user
        session_id = request.GET.get('session_id')
        
        if not session_id:
            return Response({
                'error': 'Session ID manquant'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            member = user.member_profile
        except Member.DoesNotExist:
            return Response({
                'error': 'Profil membre introuvable'
            }, status=status.HTTP_404_NOT_FOUND)
        
        session = StripeService.retrieve_session(session_id)
        
        try:
            subscription = Subscription.objects.select_related('plan').get(
                stripe_session_id=session_id,
                member=member
            )
        except Subscription.DoesNotExist:
            logger.error(f"❌ Abonnement introuvable pour session {session_id}, member {member.id}")
            return Response({
                'error': 'Abonnement introuvable'
            }, status=status.HTTP_404_NOT_FOUND)
        
        if session.payment_status == 'paid':
            if subscription.status != 'ACTIVE':
                subscription.activate()
                subscription.payment_method = 'Stripe'
                subscription.stripe_payment_intent_id = session.payment_intent
                subscription.save(update_fields=['payment_method', 'stripe_payment_intent_id', 'updated_at'])
                
                logger.info(f"✅ Paiement confirmé - Abonnement {subscription.id} activé")
                
                # ✅ CRÉATION MANUELLE DE LA FACTURE ICI AUSSI
                try:
                    create_invoice_for_subscription(subscription, session.payment_intent)
                except Exception as invoice_error:
                    logger.error(f"❌ Erreur création facture manuelle: {str(invoice_error)}")
            
            return Response({
                'success': True,
                'message': 'Paiement confirmé',
                'subscription': {
                    'id': subscription.id,
                    'status': subscription.status,
                    'plan_name': subscription.plan.name,
                    'end_date': subscription.end_date,
                }
            })
        
        else:
            return Response({
                'success': False,
                'message': 'Paiement en attente',
                'payment_status': session.payment_status
            })
    
    except Exception as e:
        logger.error(f"❌ Erreur vérification paiement: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            'error': 'Erreur serveur',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['POST'])
def stripe_webhook(request):
    """
    🔔 Webhook Stripe - ✅ VERSION CORRIGÉE
    """
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    
    try:
        # ✅ Vérifier la signature du webhook
        event = StripeService.verify_webhook_signature(payload, sig_header)
        
        logger.info(f"🔔 Webhook reçu: {event['type']}")
        logger.info(f"📦 Event data: {event.get('data', {}).get('object', {}).get('id', 'N/A')}")
        
        # ✅ TRAITER LES ÉVÉNEMENTS
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            logger.info(f"✅ Traitement checkout.session.completed pour session: {session.get('id')}")
            handle_checkout_session_completed(session)
        
        elif event['type'] == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            logger.info(f"✅ Traitement payment_intent.succeeded pour PI: {payment_intent.get('id')}")
            handle_payment_intent_succeeded(payment_intent)
        
        else:
            logger.info(f"ℹ️ Événement ignoré: {event['type']}")
        
        return HttpResponse(status=200)
    
    except ValueError as e:
        logger.error(f"❌ Erreur webhook (ValueError): {str(e)}")
        return HttpResponse(status=400)
    except Exception as e:
        logger.error(f"❌ Erreur webhook: {str(e)}")
        import traceback
        traceback.print_exc()
        return HttpResponse(status=400)


def create_invoice_for_subscription(subscription, payment_intent_id=''):
    """
    📄 Fonction utilitaire pour créer une facture
    """
    try:
        from billing.models import Invoice
        from billing.pdf_generator import generate_invoice_pdf
        
        logger.info(f"📄 Création facture pour subscription {subscription.id}...")
        
        # Créer la facture
        invoice = Invoice.objects.create(
            member=subscription.member,
            subscription=subscription,
            amount=subscription.amount_paid,
            tax_rate=19,
            company_name="GymFlow",
            company_address="Avenue Habib Bourguiba, Tunis 1000, Tunisie",
            company_tax_id="1234567M",
            customer_name=subscription.member.full_name,
            customer_email=subscription.member.email,
            customer_address=subscription.member.address or '',
            line_items=[{
                'description': f"Abonnement {subscription.plan.name} - {subscription.plan.duration_days} jours",
                'quantity': 1,
                'unit_price': float(subscription.amount_paid),
                'total': float(subscription.amount_paid)
            }],
            payment_method='Stripe',
            stripe_payment_intent_id=payment_intent_id,
            tenant_id=subscription.tenant_id,
            status='PAID',
            notes=f"Paiement en ligne via Stripe\nPayment Intent ID: {payment_intent_id}"
        )
        
        logger.info(f"✅ Facture {invoice.invoice_number} créée")
        
        # Marquer comme payée
        invoice.mark_as_paid(
            payment_method='Stripe',
            payment_intent_id=payment_intent_id
        )
        
        # Générer le PDF
        try:
            pdf_path = generate_invoice_pdf(invoice)
            invoice.pdf_file = pdf_path
            invoice.save(update_fields=['pdf_file'])
            logger.info(f"✅ PDF généré : {pdf_path}")
        except Exception as pdf_error:
            logger.error(f"❌ Erreur génération PDF: {str(pdf_error)}")
        
        logger.info(f"✅✅✅ FACTURE COMPLÈTE : {invoice.invoice_number}")
        return invoice
        
    except Exception as e:
        logger.error(f"❌ Erreur création facture: {str(e)}")
        import traceback
        traceback.print_exc()
        raise


def handle_checkout_session_completed(session):
    """
    ✅ Gérer la complétion d'une session + CRÉER FACTURE AUTOMATIQUEMENT
    """
    try:
        subscription_id = session.get('metadata', {}).get('subscription_id')
        
        if not subscription_id:
            logger.error("❌ subscription_id manquant dans metadata")
            logger.error(f"📦 Session metadata: {session.get('metadata')}")
            return
        
        logger.info(f"🔍 Traitement subscription {subscription_id}...")
        
        subscription = Subscription.objects.select_related('member', 'plan').get(id=subscription_id)
        
        if subscription.status != 'ACTIVE':
            # ✅ ÉTAPE 1: Activer l'abonnement
            subscription.activate()
            subscription.payment_method = 'Stripe'
            subscription.stripe_payment_intent_id = session.get('payment_intent')
            subscription.save(update_fields=['payment_method', 'stripe_payment_intent_id', 'updated_at'])
            
            logger.info(f"✅ Abonnement {subscription.id} activé")
            
            # ✅ ÉTAPE 2: CRÉER LA FACTURE
            try:
                invoice = create_invoice_for_subscription(
                    subscription, 
                    session.get('payment_intent', '')
                )
                logger.info(f"✅✅ Facture créée avec succès: {invoice.invoice_number}")
            except Exception as invoice_error:
                logger.error(f"❌ Erreur création facture dans webhook: {str(invoice_error)}")
                import traceback
                traceback.print_exc()
        else:
            logger.info(f"ℹ️ Abonnement {subscription.id} déjà actif")
    
    except Subscription.DoesNotExist:
        logger.error(f"❌ Abonnement {subscription_id} introuvable")
    except Exception as e:
        logger.error(f"❌ Erreur handle_checkout_session_completed: {str(e)}")
        import traceback
        traceback.print_exc()


def handle_payment_intent_succeeded(payment_intent):
    """
    ✅ Gérer la réussite d'un PaymentIntent
    """
    try:
        payment_intent_id = payment_intent.get('id')
        logger.info(f"🔍 Traitement payment_intent {payment_intent_id}...")
        
        subscription = Subscription.objects.filter(
            stripe_payment_intent_id=payment_intent_id
        ).first()
        
        if subscription and subscription.status != 'ACTIVE':
            subscription.activate()
            logger.info(f"✅ Abonnement {subscription.id} activé via payment_intent.succeeded")
            
            # ✅ Créer facture si pas déjà créée
            try:
                from billing.models import Invoice
                if not Invoice.objects.filter(subscription=subscription).exists():
                    create_invoice_for_subscription(subscription, payment_intent_id)
            except Exception as e:
                logger.error(f"❌ Erreur création facture: {str(e)}")
        elif subscription:
            logger.info(f"ℹ️ Abonnement {subscription.id} déjà actif")
        else:
            logger.warning(f"⚠️ Aucun abonnement trouvé pour payment_intent {payment_intent_id}")
    
    except Exception as e:
        logger.error(f"❌ Erreur handle_payment_intent_succeeded: {str(e)}")
        import traceback
        traceback.print_exc()