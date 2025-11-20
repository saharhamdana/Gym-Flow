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
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Plans actifs du centre"""
        plans = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(plans, many=True)
        return Response(serializer.data)


class SubscriptionViewSet(CompleteTenantMixin, viewsets.ModelViewSet):
    """
    ViewSet pour les abonnements avec isolation tenant
    """
    queryset = Subscription.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'member', 'plan']
    search_fields = ['member__first_name', 'member__last_name', 'member__member_id']
    ordering_fields = ['start_date', 'end_date', 'created_at']
    tenant_field = 'tenant_id'
    
    def get_serializer_class(self):
        if self.action == 'list':
            return SubscriptionListSerializer
        elif self.action == 'create':
            return SubscriptionCreateSerializer
        return SubscriptionDetailSerializer
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activer un abonnement manuellement"""
        subscription = self.get_object()
        
        if subscription.status == 'ACTIVE':
            return Response(
                {'error': 'Cet abonnement est déjà actif'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        subscription.activate()
        serializer = self.get_serializer(subscription)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Annuler un abonnement"""
        subscription = self.get_object()
        
        if subscription.status == 'CANCELLED':
            return Response(
                {'error': 'Cet abonnement est déjà annulé'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        subscription.cancel()
        serializer = self.get_serializer(subscription)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def expiring_soon(self, request):
        """Abonnements qui expirent dans les 7 prochains jours"""
        from datetime import timedelta
        today = timezone.now().date()
        end_date = today + timedelta(days=7)
        
        subscriptions = self.get_queryset().filter(
            status='ACTIVE',
            end_date__range=[today, end_date]
        )
        
        serializer = SubscriptionListSerializer(subscriptions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Statistiques des abonnements du centre"""
        queryset = self.get_queryset()
        
        total = queryset.count()
        active = queryset.filter(status='ACTIVE').count()
        expired = queryset.filter(status='EXPIRED').count()
        cancelled = queryset.filter(status='CANCELLED').count()
        
        return Response({
            'total': total,
            'active': active,
            'expired': expired,
            'cancelled': cancelled,
        })