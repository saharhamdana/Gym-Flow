from rest_framework import permissions
from .models import User # Importez le modèle User personnalisé

class IsAdminOrReceptionist(permissions.BasePermission):
    """
    Permission personnalisée pour autoriser l'accès uniquement aux
    ADMIN ou RECEPTIONIST.
    Utilisé pour les opérations de CRUD Membres/Abonnements.
    """
    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated:
            return False
            
        return user.role in [User.Role.ADMIN, User.Role.RECEPTIONIST]

class IsAdminOrReceptionistOrCoach(permissions.BasePermission):
    """
    Permission personnalisée pour autoriser l'accès uniquement aux
    ADMIN, RECEPTIONIST, ou COACH.
    Utilisé pour le CRUD Membres et l'ajout de Métriques.
    """
    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated:
            return False
            
        return user.role in [User.Role.ADMIN, User.Role.RECEPTIONIST, User.Role.COACH]

class IsCoach(permissions.BasePermission):
    """
    Permission personnalisée pour autoriser l'accès uniquement aux COACHS.
    """
    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated:
            return False
            
        return user.role == User.Role.COACH