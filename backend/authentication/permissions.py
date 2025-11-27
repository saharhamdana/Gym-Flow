# backend/authentication/permissions.py

from rest_framework import permissions
from .models import User

# ========== PERMISSIONS BASÉES SUR LES RÔLES ==========

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


# ========== PERMISSIONS BASÉES SUR LE TENANT ==========

class BelongsToTenant(permissions.BasePermission):
    """
    Permission pour vérifier que l'utilisateur appartient au tenant actuel.
    Utilise le gym_center détecté par le middleware.
    """
    message = "Vous n'avez pas accès à ce centre."
    
    def has_permission(self, request, view):
        user = request.user
        
        # Les utilisateurs non authentifiés sont rejetés
        if not user.is_authenticated:
            return False
        
        # Les super-admins ont accès à tout
        if user.is_superuser:
            return True
        
        # Vérifier si un gym_center est détecté
        gym_center = getattr(request, 'gym_center', None)
        
        # Si pas de gym_center détecté, autoriser (pas de restriction)
        if not gym_center:
            return True
        
        # Vérifier que l'utilisateur appartient au tenant
        if not user.tenant_id:
            self.message = "Votre compte n'est associé à aucun centre."
            return False
        
        if user.tenant_id != gym_center.tenant_id:
            self.message = f"Vous n'avez pas accès à ce centre. Veuillez utiliser votre sous-domaine."
            return False
        
        return True


class IsAdminOfTenant(permissions.BasePermission):
    """
    Permission pour vérifier que l'utilisateur est admin du tenant actuel.
    """
    message = "Seuls les administrateurs de ce centre peuvent effectuer cette action."
    
    def has_permission(self, request, view):
        user = request.user
        
        if not user.is_authenticated:
            return False
        
        if user.is_superuser:
            return True
        
        if user.role != User.Role.ADMIN:
            return False
        
        gym_center = getattr(request, 'gym_center', None)
        
        if not gym_center:
            return True
        
        if not user.tenant_id or user.tenant_id != gym_center.tenant_id:
            return False
        
        return True


# ========== PERMISSIONS SPÉCIFIQUES RÉCEPTIONNISTE ==========

class IsReceptionist(permissions.BasePermission):
    """
    Permission personnalisée pour autoriser l'accès uniquement aux RÉCEPTIONNISTES.
    """
    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated:
            return False
            
        return user.role == User.Role.RECEPTIONIST


class IsReceptionistOrAdmin(permissions.BasePermission):
    """
    Permission pour réceptionniste ou admin.
    """
    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated:
            return False
            
        return user.role in [User.Role.RECEPTIONIST, User.Role.ADMIN]


# ========== PERMISSIONS COMBINÉES (RÔLE + TENANT) ==========

class CanManageMembers(permissions.BasePermission):
    """
    Permission combinée : Admin, Réceptionniste ou Coach du même tenant.
    Utilisé pour la gestion des membres.
    """
    message = "Vous n'avez pas les permissions nécessaires pour gérer les membres."
    
    def has_permission(self, request, view):
        user = request.user
        
        if not user.is_authenticated:
            return False
        
        # Vérifier le rôle
        allowed_roles = [User.Role.ADMIN, User.Role.RECEPTIONIST, User.Role.COACH]
        if user.role not in allowed_roles:
            self.message = "Seuls les administrateurs, réceptionnistes et coachs peuvent gérer les membres."
            return False
        
        # Vérifier le tenant
        belongs_to_tenant = BelongsToTenant()
        if not belongs_to_tenant.has_permission(request, view):
            self.message = belongs_to_tenant.message
            return False
        
        return True


class CanManageSubscriptions(permissions.BasePermission):
    """
    Permission combinée : Admin ou Réceptionniste du même tenant.
    Utilisé pour la gestion des abonnements.
    """
    message = "Vous n'avez pas les permissions nécessaires pour gérer les abonnements."
    
    def has_permission(self, request, view):
        user = request.user
        
        if not user.is_authenticated:
            return False
        
        # Vérifier le rôle
        allowed_roles = [User.Role.ADMIN, User.Role.RECEPTIONIST]
        if user.role not in allowed_roles:
            self.message = "Seuls les administrateurs et réceptionnistes peuvent gérer les abonnements."
            return False
        
        # Vérifier le tenant
        belongs_to_tenant = BelongsToTenant()
        if not belongs_to_tenant.has_permission(request, view):
            self.message = belongs_to_tenant.message
            return False
        
        return True


class CanManageBookings(permissions.BasePermission):
    """
    Permission combinée : Admin, Réceptionniste ou Coach du même tenant.
    Utilisé pour la gestion des réservations.
    """
    message = "Vous n'avez pas les permissions nécessaires pour gérer les réservations."
    
    def has_permission(self, request, view):
        user = request.user
        
        if not user.is_authenticated:
            return False
        
        # Vérifier le rôle
        allowed_roles = [User.Role.ADMIN, User.Role.RECEPTIONIST, User.Role.COACH]
        if user.role not in allowed_roles:
            self.message = "Seuls les administrateurs, réceptionnistes et coachs peuvent gérer les réservations."
            return False
        
        # Vérifier le tenant
        belongs_to_tenant = BelongsToTenant()
        if not belongs_to_tenant.has_permission(request, view):
            self.message = belongs_to_tenant.message
            return False
        
        return True