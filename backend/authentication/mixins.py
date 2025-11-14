# backend/authentication/mixins.py

from rest_framework.exceptions import PermissionDenied


class TenantQuerysetMixin:
    """
    Mixin pour filtrer automatiquement les querysets par tenant_id.
    À utiliser dans les ViewSets pour garantir l'isolation des données.
    
    Usage:
        class MemberViewSet(TenantQuerysetMixin, viewsets.ModelViewSet):
            queryset = Member.objects.all()
            tenant_field = 'tenant_id'  # Nom du champ tenant dans le modèle
    """
    tenant_field = 'tenant_id'  # Nom du champ tenant dans le modèle (peut être overridé)
    
    def get_queryset(self):
        """
        Filtre le queryset pour ne retourner que les objets du tenant actuel.
        """
        queryset = super().get_queryset()
        
        # Les super-admins voient tout
        if self.request.user.is_superuser:
            return queryset
        
        # Récupérer le gym_center depuis le middleware
        gym_center = getattr(self.request, 'gym_center', None)
        
        # Si pas de gym_center, retourner un queryset vide pour la sécurité
        if not gym_center:
            # Exception : permettre l'accès si l'utilisateur n'a pas de tenant_id
            # (utile pour la configuration initiale)
            if not self.request.user.tenant_id:
                return queryset
            
            # Filtrer par le tenant_id de l'utilisateur
            return queryset.filter(**{self.tenant_field: self.request.user.tenant_id})
        
        # Filtrer par le tenant_id du gym_center
        return queryset.filter(**{self.tenant_field: gym_center.tenant_id})
    
    def perform_create(self, serializer):
        """
        Ajoute automatiquement le tenant_id lors de la création.
        """
        gym_center = getattr(self.request, 'gym_center', None)
        
        if gym_center:
            # Ajouter le tenant_id automatiquement
            serializer.save(**{self.tenant_field: gym_center.tenant_id})
        elif self.request.user.tenant_id:
            # Utiliser le tenant_id de l'utilisateur si pas de gym_center
            serializer.save(**{self.tenant_field: self.request.user.tenant_id})
        else:
            # Erreur si pas de tenant disponible
            raise PermissionDenied(
                "Impossible de créer cet objet : aucun centre associé."
            )


class UserTenantQuerysetMixin:
    """
    Mixin spécifique pour les modèles User qui ont un tenant_id.
    Filtre les utilisateurs par tenant pour garantir l'isolation.
    
    Usage:
        class UserViewSet(UserTenantQuerysetMixin, viewsets.ModelViewSet):
            queryset = User.objects.all()
    """
    
    def get_queryset(self):
        """
        Filtre les utilisateurs par tenant_id.
        """
        queryset = super().get_queryset()
        
        # Les super-admins voient tous les utilisateurs
        if self.request.user.is_superuser:
            return queryset
        
        # Récupérer le gym_center depuis le middleware
        gym_center = getattr(self.request, 'gym_center', None)
        
        if not gym_center:
            # Filtrer par le tenant_id de l'utilisateur connecté
            if self.request.user.tenant_id:
                return queryset.filter(tenant_id=self.request.user.tenant_id)
            return queryset.none()
        
        # Filtrer par le tenant_id du gym_center
        return queryset.filter(tenant_id=gym_center.tenant_id)
    
    def perform_create(self, serializer):
        """
        Ajoute automatiquement le tenant_id lors de la création d'un utilisateur.
        """
        gym_center = getattr(self.request, 'gym_center', None)
        
        if gym_center:
            serializer.save(tenant_id=gym_center.tenant_id)
        elif self.request.user.tenant_id:
            serializer.save(tenant_id=self.request.user.tenant_id)
        else:
            raise PermissionDenied(
                "Impossible de créer cet utilisateur : aucun centre associé."
            )


class TenantOwnershipMixin:
    """
    Mixin pour vérifier que l'utilisateur ne peut modifier/supprimer
    que les objets de son propre tenant.
    
    Usage:
        class MemberViewSet(TenantQuerysetMixin, TenantOwnershipMixin, viewsets.ModelViewSet):
            queryset = Member.objects.all()
    """
    
    def check_object_tenant(self, obj):
        """
        Vérifie que l'objet appartient au tenant de l'utilisateur.
        """
        # Les super-admins peuvent tout faire
        if self.request.user.is_superuser:
            return True
        
        gym_center = getattr(self.request, 'gym_center', None)
        user = self.request.user
        
        # Récupérer le tenant_id de l'objet
        obj_tenant_id = getattr(obj, 'tenant_id', None)
        
        if not obj_tenant_id:
            return True  # Pas de tenant sur l'objet
        
        # Vérifier contre le gym_center
        if gym_center and obj_tenant_id != gym_center.tenant_id:
            raise PermissionDenied(
                "Vous ne pouvez pas modifier cet objet : il n'appartient pas à votre centre."
            )
        
        # Vérifier contre le tenant de l'utilisateur
        if user.tenant_id and obj_tenant_id != user.tenant_id:
            raise PermissionDenied(
                "Vous ne pouvez pas modifier cet objet : il n'appartient pas à votre centre."
            )
        
        return True
    
    def perform_update(self, serializer):
        """
        Vérifie le tenant avant la mise à jour.
        """
        self.check_object_tenant(serializer.instance)
        super().perform_update(serializer)
    
    def perform_destroy(self, instance):
        """
        Vérifie le tenant avant la suppression.
        """
        self.check_object_tenant(instance)
        super().perform_destroy(instance)


class CompleteTenantMixin(TenantQuerysetMixin, TenantOwnershipMixin):
    """
    Mixin combiné pour une isolation complète par tenant.
    Combine le filtrage des querysets et la vérification de propriété.
    
    Usage:
        class MemberViewSet(CompleteTenantMixin, viewsets.ModelViewSet):
            queryset = Member.objects.all()
            tenant_field = 'tenant_id'
    """
    pass