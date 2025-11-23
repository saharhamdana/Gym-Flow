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


# ✅ NOUVELLE PERMISSION PERSONNALISÉE
class IsAdminRole(permissions.BasePermission):
    """
    Permission personnalisée pour vérifier si l'utilisateur a le rôle ADMIN.
    Plus flexible que IsAdminUser qui vérifie is_staff.
    """
    def has_permission(self, request, view):
        # Vérifier que l'utilisateur est authentifié
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Autoriser les superusers
        if request.user.is_superuser:
            return True
        
        # Autoriser les utilisateurs avec le rôle ADMIN
        return request.user.role == User.Role.ADMIN


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
        ✅ CORRECTION : Utiliser IsAdminRole au lieu de IsAdminUser
        
        Permissions selon l'action:
        - List/Retrieve: Tous les utilisateurs authentifiés
        - Create/Update/Delete: Seulement les utilisateurs avec role=ADMIN
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            # ✅ Utiliser notre permission personnalisée
            self.permission_classes = [permissions.IsAuthenticated, IsAdminRole]
        else:
            # Lecture accessible à tous les utilisateurs authentifiés
            self.permission_classes = [permissions.IsAuthenticated]
        
        return super().get_permissions()