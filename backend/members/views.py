# Fichier: backend/members/views.py

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
# NOTE: L'importation de Subscription ici peut être inutile si MemberSubscription est utilisé ailleurs.
from subscriptions.models import Subscription 
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Member, MemberMeasurement
from .serializers import (
    MemberListSerializer, 
    MemberDetailSerializer, 
    MemberCreateUpdateSerializer,
    MemberMeasurementSerializer
)
from authentication.mixins import TenantQuerysetMixin

class MemberViewSet(TenantQuerysetMixin, viewsets.ModelViewSet):
    queryset = Member.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'gender']
    search_fields = ['first_name', 'last_name', 'email', 'phone', 'member_id']
    ordering_fields = ['created_at', 'first_name', 'last_name']
    tenant_field = 'tenant_id'
    
    def get_serializer_class(self):
        if self.action == 'list':
            return MemberListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return MemberCreateUpdateSerializer
        return MemberDetailSerializer
    
    @action(detail=True, methods=['post'])
    def add_measurement(self, request, pk=None):
        """Ajouter une mesure physique"""
        member = self.get_object()
        serializer = MemberMeasurementSerializer(data={**request.data, 'member': member.id})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def measurements(self, request, pk=None):
        """Récupérer l'historique des mesures"""
        member = self.get_object()
        measurements = member.measurements.all()
        serializer = MemberMeasurementSerializer(measurements, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Statistiques globales des membres (différent de dashboard_stats)"""
        total = Member.objects.count()
        active = Member.objects.filter(status='ACTIVE').count()
        inactive = Member.objects.filter(status='INACTIVE').count()
        return Response({
            'total': total,
            'active': active,
            'inactive': inactive,
            'active_percentage': (active / total * 100) if total > 0 else 0
        })