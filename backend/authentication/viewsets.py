# backend/authentication/viewsets.py

from rest_framework import viewsets, permissions
from django.contrib.auth import get_user_model
from rest_framework.response import Response
from .serializers import UserSerializer
from django_filters import rest_framework as filters

User = get_user_model()

class UserFilter(filters.FilterSet):
    role = filters.CharFilter(field_name='role')

    class Meta:
        model = User
        fields = ['role']

class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les utilisateurs.
    
    Endpoints:
    - GET /api/auth/users/ : Liste tous les utilisateurs
    - GET /api/auth/users/?role=COACH : Filtre par rôle
    - GET /api/auth/users/{id}/ : Détails d'un utilisateur
    - POST /api/auth/users/ : Créer un utilisateur
    - PUT/PATCH /api/auth/users/{id}/ : Modifier un utilisateur
    - DELETE /api/auth/users/{id}/ : Supprimer un utilisateur
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]  # ✅ Tous les utilisateurs authentifiés
    filterset_class = UserFilter
    
    def get_queryset(self):
        """
        Retourne la liste des utilisateurs.
        Les admins voient tous les utilisateurs du même tenant.
        """
        queryset = User.objects.all()
        
        # 🔒 Filtrage par tenant si nécessaire
        user = self.request.user
        gym_center = getattr(self.request, 'gym_center', None)
        
        # Les super-admins voient tout
        if user.is_superuser:
            return queryset
        
        # Filtrer par tenant_id
        if gym_center:
            queryset = queryset.filter(tenant_id=gym_center.tenant_id)
        elif user.tenant_id:
            queryset = queryset.filter(tenant_id=user.tenant_id)
        
        # Filtre par rôle (optionnel via query params)
        role = self.request.query_params.get('role', None)
        if role is not None:
            queryset = queryset.filter(role=role)
        
        return queryset
    
    def get_permissions(self):
        """
        Permissions selon l'action:
        - List/Retrieve: Tous les utilisateurs authentifiés
        - Create/Update/Delete: Seulement les admins
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
        return super().get_permissions()