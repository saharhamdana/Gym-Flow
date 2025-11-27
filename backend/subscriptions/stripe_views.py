# backend/subscriptions/stripe_views.py
# ✅ VERSION MULTI-TENANT avec gestion dynamique du sous-domaine

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
        
        # ✅ ÉTAPE 1: Vérifier que l'user est un MEMBER
        if user.role != 'MEMBER':
            return Response({
                'error': 'Accès refusé',
                'message': 'Seuls les membres peuvent effectuer des paiements'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # ✅ ÉTAPE 2: Récupérer le profil Member
        try:
            member = user.member_profile
            logger.info(f"🔍 User ID: {user.id} → Member ID: {member.id} ({member.member_id})")
        except Member.DoesNotExist:
            return Response({
                'error': 'Profil membre introuvable',
                'message': 'Votre profil membre n\'existe pas. Contactez l\'administration.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # ✅ ÉTAPE 3: Récupérer l'abonnement
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
        
        # ✅ ÉTAPE 4: Vérifier le statut
        if subscription.status != 'PENDING':
            return Response({
                'error': 'Paiement non autorisé',
                'message': f'Cet abonnement est déjà {subscription.get_status_display().lower()}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # ✅ ÉTAPE 5: Créer les URLs de redirection dynamiques
        frontend_url = get_frontend_url(request)
        success_url = f"{frontend_url}/portal/subscription/success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{frontend_url}/portal/subscriptions"
        
        print(f"🎯 URLs AVEC PORT:")
        print(f"✅ {success_url}")
        
        # ✅ ÉTAPE 6: Créer la session Stripe
        session_data = StripeService.create_checkout_session(
            subscription=subscription,
            success_url=success_url,
            cancel_url=cancel_url
        )
        
        # ✅ ÉTAPE 7: Sauvegarder le session_id
        subscription.stripe_session_id = session_data['session_id']
        subscription.save(update_fields=['stripe_session_id', 'updated_at'])
        
        logger.info(f"✅ Session Stripe créée pour {member.member_id} (User ID: {user.id}, Member ID: {member.id})")
        
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
        
        # ✅ Récupérer le Member via la relation
        try:
            member = user.member_profile
        except Member.DoesNotExist:
            return Response({
                'error': 'Profil membre introuvable'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # ✅ Récupérer la session Stripe
        session = StripeService.retrieve_session(session_id)
        
        # ✅ Récupérer l'abonnement via member
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
        
        # ✅ Vérifier et activer si payé
        if session.payment_status == 'paid':
            if subscription.status != 'ACTIVE':
                subscription.activate()
                subscription.payment_method = 'Stripe'
                subscription.stripe_payment_intent_id = session.payment_intent
                subscription.save(update_fields=['payment_method', 'stripe_payment_intent_id', 'updated_at'])
                
                logger.info(f"✅ Paiement confirmé - Abonnement {subscription.id} activé pour {member.member_id}")
            
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
    🔔 Webhook Stripe
    """
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    
    try:
        event = StripeService.verify_webhook_signature(payload, sig_header)
        
        logger.info(f"📥 Webhook reçu: {event['type']}")
        
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            handle_checkout_session_completed(session)
        
        elif event['type'] == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            handle_payment_intent_succeeded(payment_intent)
        
        return HttpResponse(status=200)
    
    except Exception as e:
        logger.error(f"❌ Erreur webhook: {str(e)}")
        return HttpResponse(status=400)


def handle_checkout_session_completed(session):
    """
    ✅ Gérer la complétion d'une session
    """
    try:
        subscription_id = session['metadata'].get('subscription_id')
        
        if not subscription_id:
            logger.error("❌ subscription_id manquant dans metadata")
            return
        
        subscription = Subscription.objects.select_related('member').get(id=subscription_id)
        
        if subscription.status != 'ACTIVE':
            subscription.activate()
            subscription.payment_method = 'Stripe'
            subscription.stripe_payment_intent_id = session.get('payment_intent')
            subscription.save(update_fields=['payment_method', 'stripe_payment_intent_id', 'updated_at'])
            
            logger.info(f"✅ Webhook: Abonnement {subscription.id} activé pour {subscription.member.member_id}")
    
    except Subscription.DoesNotExist:
        logger.error(f"❌ Abonnement {subscription_id} introuvable")
    except Exception as e:
        logger.error(f"❌ Erreur handle_checkout_session_completed: {str(e)}")


def handle_payment_intent_succeeded(payment_intent):
    """
    ✅ Gérer la réussite d'un PaymentIntent
    """
    try:
        subscription = Subscription.objects.filter(
            stripe_payment_intent_id=payment_intent['id']
        ).first()
        
        if subscription and subscription.status != 'ACTIVE':
            subscription.activate()
            logger.info(f"✅ Webhook: Abonnement {subscription.id} activé via payment_intent.succeeded")
    
    except Exception as e:
        logger.error(f"❌ Erreur handle_payment_intent_succeeded: {str(e)}")