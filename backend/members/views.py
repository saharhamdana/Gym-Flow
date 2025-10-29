# Fichier: members/views.py
from rest_framework import viewsets, permissions, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import MemberProfile, PerformanceMetric
from .serializers import MemberProfileSerializer, PerformanceMetricSerializer
from authentication.permissions import IsAdminOrReceptionistOrCoach # Supposons que vous ayez des permissions personnalisées

class MemberProfileViewSet(viewsets.ModelViewSet):
    """
    CRUD complet des profils des membres.
    Autorisé pour Admin, Réceptionniste et Coach.
    """
    queryset = MemberProfile.objects.all().select_related('user').prefetch_related('performance_metrics')
    serializer_class = MemberProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReceptionistOrCoach] 
    
    # -----------------------------------------------------
    # ACTION PERSONNALISÉE : Ajout de métrique de performance
    # -----------------------------------------------------
    @action(detail=True, methods=['post'], url_path='add-metric')
    def add_metric(self, request, pk=None):
        member_profile = get_object_or_404(MemberProfile, pk=pk)
        
        # Le serializer PerformanceMetric n'a pas besoin du champ 'member'
        serializer = PerformanceMetricSerializer(data=request.data)
        
        if serializer.is_valid():
            # Associer le membre avant la sauvegarde
            serializer.save(member=member_profile)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # -----------------------------------------------------
    # ACTION PERSONNALISÉE : Portail Membre (Lire son propre profil)
    # -----------------------------------------------------
    @action(detail=False, methods=['get'], url_path='me')
    def my_profile(self, request):
        user = request.user
        
        if user.role != 'MEMBER':
            return Response(
                {"detail": "Accès réservé aux membres."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            profile = MemberProfile.objects.get(user=user)
        except MemberProfile.DoesNotExist:
            return Response(
                {"detail": "Profil membre non trouvé."},
                status=status.HTTP_404_NOT_FOUND
            )
            
        serializer = self.get_serializer(profile)
        return Response(serializer.data)

class PerformanceMetricViewSet(viewsets.ModelViewSet):
    """
    CRUD des métriques de performance, principalement pour les Coachs.
    """
    queryset = PerformanceMetric.objects.all()
    serializer_class = PerformanceMetricSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReceptionistOrCoach]