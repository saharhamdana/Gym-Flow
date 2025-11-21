# Fichier: backend/members/views.py

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from .models import Member, MemberMeasurement
from .serializers import (
    MemberListSerializer, 
    MemberDetailSerializer, 
    MemberCreateUpdateSerializer,
    MemberMeasurementSerializer
)
from authentication.mixins import TenantQuerysetMixin
import logging

logger = logging.getLogger('members.views')


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
    
    def create(self, request, *args, **kwargs):
        """✅ Override create pour injecter tenant_id"""
        logger.debug(f"🔍 create() appelé - MemberViewSet")
        logger.debug(f"📦 request.data = {request.data}")
        
        # ✅ Déterminer le tenant_id
        tenant_id = self._get_tenant_id(request)
        
        if not tenant_id:
            logger.error("❌ Aucun tenant_id trouvé!")
            raise PermissionDenied("Impossible de créer ce membre : aucun centre associé.")
        
        # ✅ Valider les données
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # ✅ Sauvegarder avec tenant_id
        logger.debug(f"✅ Sauvegarde membre avec tenant_id={tenant_id}")
        self.perform_create(serializer, tenant_id=tenant_id)
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def perform_create(self, serializer, tenant_id=None):
        """✅ Sauvegarder avec le tenant_id"""
        if not tenant_id:
            logger.error("❌ perform_create appelé sans tenant_id!")
            raise PermissionDenied("tenant_id manquant lors de la création")
        
        logger.debug(f"✅ perform_create: sauvegarde membre avec tenant_id={tenant_id}")
        
        # ✅ IMPORTANT : Passer tenant_id au serializer
        serializer.save(tenant_id=tenant_id)
    
    def _get_tenant_id(self, request):
        """✅ Méthode utilitaire pour récupérer le tenant_id"""
        gym_center = getattr(request, 'gym_center', None)
        
        if gym_center:
            logger.debug(f"✅ tenant_id depuis gym_center: {gym_center.tenant_id}")
            return gym_center.tenant_id
        
        tenant_id = getattr(request, 'tenant_id', None)
        if tenant_id:
            logger.debug(f"✅ tenant_id depuis request: {tenant_id}")
            return tenant_id
        
        if request.user.is_authenticated and hasattr(request.user, 'tenant_id'):
            logger.debug(f"✅ tenant_id depuis user: {request.user.tenant_id}")
            return request.user.tenant_id
        
        return None
    
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
        """Statistiques globales des membres"""
        queryset = self.get_queryset()
        total = queryset.count()
        active = queryset.filter(status='ACTIVE').count()
        inactive = queryset.filter(status='INACTIVE').count()
        return Response({
            'total': total,
            'active': active,
            'inactive': inactive,
            'active_percentage': (active / total * 100) if total > 0 else 0
        })