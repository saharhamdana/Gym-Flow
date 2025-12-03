# Fichier: backend/subscriptions/views.py

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
import logging

from .models import SubscriptionPlan, Subscription
from .serializers import (
    SubscriptionPlanSerializer,
    SubscriptionListSerializer,
    SubscriptionDetailSerializer,
    SubscriptionCreateSerializer,
)
from authentication.mixins import CompleteTenantMixin

logger = logging.getLogger('subscriptions.views')


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
        logger.debug("🔍 create() appelé - SubscriptionPlanViewSet")
        
        # ✅ Déterminer le tenant_id
        gym_center = getattr(request, 'gym_center', None)
        tenant_id = getattr(request, 'tenant_id', None)
        
        if gym_center:
            final_tenant_id = gym_center.tenant_id
        elif tenant_id:
            final_tenant_id = tenant_id
        elif request.user.tenant_id:
            final_tenant_id = request.user.tenant_id
        else:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Impossible de créer ce plan : aucun centre associé.")
        
        # ✅ Valider les données
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # ✅ Sauvegarder avec tenant_id
        self.perform_create(serializer, tenant_id=final_tenant_id)
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def perform_create(self, serializer, tenant_id=None):
        """✅ Sauvegarder avec le tenant_id"""
        if tenant_id:
            serializer.save(tenant_id=tenant_id)
        else:
            serializer.save()
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Plans actifs du centre"""
        plans = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(plans, many=True)
        return Response(serializer.data)


class SubscriptionViewSet(CompleteTenantMixin, viewsets.ModelViewSet):
    """
    ✅ CORRECTION: ViewSet pour les abonnements avec FILTRAGE PAR TENANT
    """
    queryset = Subscription.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'member', 'plan']
    search_fields = ['member__first_name', 'member__last_name', 'member__member_id']
    ordering_fields = ['start_date', 'end_date', 'created_at']
    tenant_field = 'tenant_id'  # ✅ IMPORTANT
    
    def get_queryset(self):
        """
        ✅ CORRECTION: Filtrer TOUJOURS par tenant_id et rôle utilisateur
        """
        user = self.request.user
        tenant_id = getattr(self.request, 'tenant_id', None)
        
        logger.debug(f"🔍 SubscriptionViewSet.get_queryset()")
        logger.debug(f"   User: {user.username} (Role: {user.role})")
        logger.debug(f"   Tenant ID: {tenant_id}")
        
        # ✅ BASE: Toujours filtrer par tenant_id
        if not tenant_id:
            logger.error("❌ Aucun tenant_id trouvé!")
            return Subscription.objects.none()
        
        base_queryset = Subscription.objects.filter(
            tenant_id=tenant_id
        ).select_related('plan', 'member')
        
        # ✅ FILTRAGE PAR RÔLE
        if user.role == 'MEMBER':
            # Les membres ne voient que LEURS abonnements
            try:
                member = user.member_profile
                queryset = base_queryset.filter(member=member)
                logger.debug(f"   → Membre: {queryset.count()} abonnements")
                return queryset
            except:
                logger.warning(f"   → Membre sans profil")
                return Subscription.objects.none()
        
        elif user.role in ['ADMIN', 'RECEPTIONIST', 'COACH']:
            # Admin/Réceptionniste/Coach voient tous les abonnements DU CENTRE
            logger.debug(f"   → Staff: {base_queryset.count()} abonnements du centre")
            return base_queryset
        
        else:
            logger.error(f"   → Rôle non autorisé: {user.role}")
            return Subscription.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return SubscriptionListSerializer
        elif self.action == 'create':
            return SubscriptionCreateSerializer
        return SubscriptionDetailSerializer
    
    def create(self, request, *args, **kwargs):
        """✅ Override create pour injecter tenant_id"""
        logger.debug("🔍 create() appelé - SubscriptionViewSet")
        
        tenant_id = getattr(request, 'tenant_id', None)
        
        if not tenant_id:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Impossible de créer l'abonnement : aucun centre associé.")
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # ✅ Le tenant_id sera hérité du membre automatiquement
        subscription = serializer.save()
        
        # ✅ Vérifier que le tenant_id a bien été assigné
        if not subscription.tenant_id:
            subscription.tenant_id = tenant_id
            subscription.save(update_fields=['tenant_id'])
        
        headers = self.get_success_headers(serializer.data)
        return Response(
            SubscriptionDetailSerializer(subscription).data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """✅ Activer un abonnement"""
        subscription = self.get_object()
        
        if subscription.status == 'ACTIVE':
            return Response(
                {'error': 'Cet abonnement est déjà actif'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        subscription.activate()
        
        return Response({
            'success': True,
            'message': 'Abonnement activé avec succès',
            'subscription': SubscriptionDetailSerializer(subscription).data
        })
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """✅ Annuler un abonnement"""
        subscription = self.get_object()
        
        if subscription.status == 'CANCELLED':
            return Response(
                {'error': 'Cet abonnement est déjà annulé.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if subscription.status not in ['ACTIVE', 'PENDING']:
            return Response(
                {'error': 'Seuls les abonnements actifs ou en attente peuvent être annulés.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        subscription.status = 'CANCELLED'
        subscription.cancelled_at = timezone.now()
        subscription.save()
        
        logger.info(f"Abonnement {subscription.id} annulé par l'utilisateur {request.user.id}")
        
        return Response({
            'success': True,
            'message': 'Abonnement annulé avec succès.',
            'subscription': SubscriptionDetailSerializer(subscription).data
        })
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """📊 Statistiques des abonnements du centre"""
        queryset = self.get_queryset()
        
        total = queryset.count()
        active = queryset.filter(status='ACTIVE').count()
        pending = queryset.filter(status='PENDING').count()
        expired = queryset.filter(status='EXPIRED').count()
        cancelled = queryset.filter(status='CANCELLED').count()
        
        return Response({
            'total': total,
            'active': active,
            'pending': pending,
            'expired': expired,
            'cancelled': cancelled,
        })