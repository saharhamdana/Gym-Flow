# backend/members/receptionist_views.py

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q

from .models import Member
from .serializers import MemberListSerializer, MemberDetailSerializer
from authentication.permissions import IsReceptionistOrAdmin, BelongsToTenant

class ReceptionistMemberViewSet(viewsets.ModelViewSet):
    """
    ViewSet spécifique pour les réceptionnistes - gestion des membres
    """
    queryset = Member.objects.all()
    permission_classes = [IsAuthenticated, IsReceptionistOrAdmin, BelongsToTenant]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return MemberDetailSerializer
        return MemberListSerializer
    
    def get_queryset(self):
        # Filtrer par tenant
        user = self.request.user
        return Member.objects.filter(tenant_id=user.tenant_id)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Recherche de membres pour le réceptionniste"""
        query = request.GET.get('q', '')
        
        if len(query) < 2:
            return Response([])
        
        members = self.get_queryset().filter(
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query) |
            Q(member_id__icontains=query) |
            Q(email__icontains=query)
        )[:10]  # Limiter les résultats
        
        serializer = self.get_serializer(members, many=True)
        return Response(serializer.data)

    