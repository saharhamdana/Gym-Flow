# backend/authentication/middleware.py

from django.utils.deprecation import MiddlewareMixin
from .models import GymCenter


class SubdomainMiddleware(MiddlewareMixin):
    """
    Middleware pour détecter et valider le sous-domaine de chaque requête.
    Ajoute l'objet GymCenter correspondant à la requête si trouvé.
    """
    
    def process_request(self, request):
        # Récupérer le host depuis la requête
        host = request.get_host().split(':')[0]  # Enlever le port si présent
        
        # Extraire le sous-domaine
        parts = host.split('.')
        
        # Initialiser les attributs
        request.subdomain = None
        request.gym_center = None
        
        # Si c'est un sous-domaine (ex: powerfit.gymflow.com)
        if len(parts) >= 3:
            subdomain = parts[0]
            
            # Ignorer 'www' comme sous-domaine
            if subdomain != 'www':
                request.subdomain = subdomain
                
                # Chercher le centre correspondant
                try:
                    gym_center = GymCenter.objects.get(
                        subdomain=subdomain,
                        is_active=True
                    )
                    request.gym_center = gym_center
                except GymCenter.DoesNotExist:
                    pass
        
        return None


class TenantMiddleware(MiddlewareMixin):
    """
    Middleware alternatif utilisant des headers pour identifier le tenant.
    Utile pour les tests et le développement local.
    """
    
    def process_request(self, request):
        # Chercher d'abord dans les headers (pour les API)
        tenant_subdomain = request.headers.get('X-Tenant-Subdomain')
        
        if tenant_subdomain:
            try:
                gym_center = GymCenter.objects.get(
                    subdomain=tenant_subdomain,
                    is_active=True
                )
                request.subdomain = tenant_subdomain
                request.gym_center = gym_center
            except GymCenter.DoesNotExist:
                request.subdomain = None
                request.gym_center = None
        
        return None