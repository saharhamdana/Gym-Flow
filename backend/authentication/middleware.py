# backend/authentication/middleware.py

from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
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


class TenantAccessControlMiddleware(MiddlewareMixin):
    """
    Middleware pour contrôler l'accès des utilisateurs selon leur tenant_id.
    Empêche l'authentification sur un sous-domaine différent de celui d'inscription.
    
    Ce middleware bloque les utilisateurs qui tentent d'accéder à un centre
    qui n'est pas le leur, APRÈS qu'ils se soient connectés.
    """
    
    # URLs publiques (pas de contrôle d'accès)
    EXEMPT_URLS = [
        '/api/auth/register/',
        '/api/auth/token/',
        '/api/auth/token/refresh/',
        '/api/auth/centers/',
        '/admin/',
    ]
    
    def process_request(self, request):
        # Ignorer les URLs publiques
        path = request.path
        if any(path.startswith(url) for url in self.EXEMPT_URLS):
            return None
        
        # Ignorer les requêtes non authentifiées
        if not request.user.is_authenticated:
            return None
        
        # Les super-admins peuvent accéder à tous les centres
        if request.user.is_superuser:
            return None
        
        # Vérifier si un gym_center est détecté via le sous-domaine
        gym_center = getattr(request, 'gym_center', None)
        
        # Si aucun centre n'est détecté, autoriser (domaine principal)
        if not gym_center:
            return None
        
        # Vérifier que l'utilisateur appartient au centre
        user_tenant_id = request.user.tenant_id
        center_tenant_id = gym_center.tenant_id
        
        # Si l'utilisateur n'a pas de tenant_id, bloquer
        if not user_tenant_id:
            return JsonResponse({
                'error': 'Access denied',
                'detail': 'Votre compte n\'est associé à aucun centre. Veuillez contacter l\'administrateur.'
            }, status=403)
        
        # Si les tenant_id ne correspondent pas, bloquer avec message clair
        if user_tenant_id != center_tenant_id:
            # Récupérer le centre de l'utilisateur pour un message personnalisé
            try:
                user_center = GymCenter.objects.get(tenant_id=user_tenant_id)
                return JsonResponse({
                    'error': 'Access denied',
                    'detail': f'Vous êtes inscrit au centre "{user_center.name}". Veuillez vous connecter sur : {user_center.full_url}',
                    'correct_url': user_center.full_url,
                    'correct_subdomain': user_center.subdomain
                }, status=403)
            except GymCenter.DoesNotExist:
                return JsonResponse({
                    'error': 'Access denied',
                    'detail': 'Vous n\'avez pas accès à ce centre.'
                }, status=403)
        
        # Si tout est OK, laisser passer
        return None