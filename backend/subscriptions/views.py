# Fichier: backend/subscriptions/views.py

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone

from .models import SubscriptionPlan, Subscription
from .serializers import (
    SubscriptionPlanSerializer,
    SubscriptionListSerializer,
    SubscriptionDetailSerializer,
    SubscriptionCreateSerializer,
)
from authentication.mixins import CompleteTenantMixin


class SubscriptionPlanViewSet(CompleteTenantMixin, viewsets.ModelViewSet):
    """
    ViewSet pour les plans d'abonnement avec isolation tenant
    """
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']
    tenant_field = 'tenant_id'
    
    def create(self, request, *args, **kwargs):
        """✅ Override create pour injecter tenant_id AVANT validation"""
        import logging
        logger = logging.getLogger('subscriptions.views')
        
        logger.debug("🔍 create() appelé - SubscriptionPlanViewSet")
        logger.debug(f"🔍 request.data = {request.data}")
        
        # ✅ Déterminer le tenant_id
        gym_center = getattr(request, 'gym_center', None)
        tenant_id = getattr(request, 'tenant_id', None)
        
        if gym_center:
            final_tenant_id = gym_center.tenant_id
            logger.debug(f"✅ tenant_id depuis gym_center: {final_tenant_id}")
        elif tenant_id:
            final_tenant_id = tenant_id
            logger.debug(f"✅ tenant_id depuis request: {final_tenant_id}")
        elif request.user.tenant_id:
            final_tenant_id = request.user.tenant_id
            logger.debug(f"✅ tenant_id depuis user: {final_tenant_id}")
        else:
            logger.error("❌ Aucun tenant_id trouvé!")
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Impossible de créer ce plan : aucun centre associé.")
        
        # ✅ Valider les données (sans tenant_id)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # ✅ Sauvegarder avec tenant_id
        logger.debug(f"✅ Sauvegarde avec tenant_id={final_tenant_id}")
        self.perform_create(serializer, tenant_id=final_tenant_id)
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def perform_create(self, serializer, tenant_id=None):
        """✅ Sauvegarder avec le tenant_id"""
        import logging
        logger = logging.getLogger('subscriptions.views')
        
        if tenant_id:
            logger.debug(f"✅ perform_create: sauvegarde avec tenant_id={tenant_id}")
            serializer.save(tenant_id=tenant_id)
        else:
            logger.error("❌ perform_create appelé sans tenant_id!")
            serializer.save()
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Plans actifs du centre"""
        plans = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(plans, many=True)
        return Response(serializer.data)


class SubscriptionViewSet(viewsets.ModelViewSet):
    """ViewSet pour les abonnements - VERSION SIMPLIFIÉE"""
    
    queryset = Subscription.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filtrer par membre si role=MEMBER"""
        user = self.request.user
        
        if user.role == 'MEMBER':
            try:
                member = user.member_profile
                return Subscription.objects.filter(member=member).select_related('plan', 'member')
            except Member.DoesNotExist:
                return Subscription.objects.none()
        
        # Pour admin/coach : tous les abonnements
        return Subscription.objects.all().select_related('plan', 'member')
    
    def get_serializer_class(self):
        if self.action == 'list':
            return SubscriptionListSerializer
        elif self.action == 'create':
            return SubscriptionCreateSerializer
        return SubscriptionDetailSerializer


# @action(detail=False, methods=['post'])
# def verify_payment(self, request):
#     """
#     Vérifier un paiement Stripe après redirection
#     """
#     from .stripe_service import StripeService
    
#     session_id = request.data.get('session_id')
    
#     if not session_id:
#         return Response(
#             {'error': 'session_id manquant'},
#             status=status.HTTP_400_BAD_REQUEST
#         )
    
#     try:
#         # Récupérer la session Stripe
#         session = StripeService.retrieve_session(session_id)
        
#         # Récupérer l'abonnement depuis les metadata
#         subscription_id = session.metadata.get('subscription_id')
#         subscription = Subscription.objects.get(id=subscription_id)
        
#         # Vérifier si le paiement est réussi
#         if session.payment_status == 'paid' and subscription.status != 'ACTIVE':
#             subscription.activate()
#             subscription.stripe_session_id = session_id
#             subscription.save()
        
#         return Response({
#             'success': True,
#             'subscription_id': subscription.id,
#             'plan_name': subscription.plan.name,
#             'duration_days': subscription.plan.duration_days,
#             'start_date': subscription.start_date,
#             'end_date': subscription.end_date,
#             'amount_paid': subscription.amount_paid,
#             'days_remaining': subscription.days_remaining,
#             'status': subscription.status
#         })
        
#     except Exception as e:
#         logger.error(f"Erreur vérification paiement: {str(e)}")
#         return Response(
#             {'error': str(e)},
#             status=status.HTTP_500_INTERNAL_SERVER_ERROR
#         )