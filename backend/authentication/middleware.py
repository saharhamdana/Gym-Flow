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


class AdminTenantMiddleware(MiddlewareMixin):
    """
    ✅ Middleware pour détecter automatiquement le tenant_id
    Priorité :
    1. Header X-Tenant-Subdomain
    2. Sous-domaine dans l'URL
    3. Tenant de l'utilisateur connecté
    4. Premier centre actif (fallback)
    """
    
    def process_request(self, request):
        import logging
        logger = logging.getLogger('authentication.middleware')
        
        tenant_id = None
        
        # ✅ 1. Vérifier les headers (priorité la plus haute)
        tenant_subdomain = request.headers.get('X-Tenant-Subdomain')
        if tenant_subdomain:
            logger.debug(f"🔍 Header X-Tenant-Subdomain détecté: {tenant_subdomain}")
            try:
                gym_center = GymCenter.objects.get(
                    subdomain=tenant_subdomain,
                    is_active=True
                )
                tenant_id = gym_center.tenant_id
                request.gym_center = gym_center
                request.subdomain = tenant_subdomain
                logger.debug(f"✅ Gym center trouvé via header: {gym_center.name} (tenant_id={tenant_id})")
            except GymCenter.DoesNotExist:
                logger.warning(f"⚠️ Aucun centre trouvé pour subdomain: {tenant_subdomain}")
        
        # ✅ 2. Vérifier via le sous-domaine dans l'URL
        if not tenant_id:
            host = request.get_host().split(':')[0]
            parts = host.split('.')
            
            if len(parts) >= 3 and parts[0] not in ['www', 'api', 'admin']:
                subdomain = parts[0]
                logger.debug(f"🔍 Sous-domaine détecté dans URL: {subdomain}")
                try:
                    gym_center = GymCenter.objects.get(
                        subdomain=subdomain,
                        is_active=True
                    )
                    tenant_id = gym_center.tenant_id
                    if not hasattr(request, 'gym_center'):
                        request.gym_center = gym_center
                        request.subdomain = subdomain
                    logger.debug(f"✅ Gym center trouvé via URL: {gym_center.name} (tenant_id={tenant_id})")
                except GymCenter.DoesNotExist:
                    logger.warning(f"⚠️ Aucun centre trouvé pour subdomain URL: {subdomain}")
        
        # ✅ 3. Vérifier le tenant de l'utilisateur connecté
        if not tenant_id and request.user.is_authenticated:
            user_tenant_id = getattr(request.user, 'tenant_id', None)
            if user_tenant_id:
                tenant_id = user_tenant_id
                logger.debug(f"✅ Tenant trouvé via utilisateur: {request.user.email} (tenant_id={tenant_id})")
                # Essayer de charger le gym_center correspondant
                try:
                    gym_center = GymCenter.objects.get(
                        tenant_id=tenant_id,
                        is_active=True
                    )
                    if not hasattr(request, 'gym_center'):
                        request.gym_center = gym_center
                        request.subdomain = gym_center.subdomain
                except GymCenter.DoesNotExist:
                    logger.warning(f"⚠️ Aucun centre trouvé pour tenant_id: {tenant_id}")
        
        # ✅ 4. FALLBACK : Utiliser le premier centre actif (pour développement)
        if not tenant_id:
            logger.debug("🔄 Aucun tenant trouvé, utilisation du fallback...")
            try:
                first_center = GymCenter.objects.filter(is_active=True).first()
                if first_center:
                    tenant_id = first_center.tenant_id
                    if not hasattr(request, 'gym_center'):
                        request.gym_center = first_center
                        request.subdomain = first_center.subdomain
                    logger.debug(f"✅ Fallback: {first_center.name} (tenant_id={tenant_id})")
            except Exception as e:
                logger.error(f"❌ Erreur lors du fallback: {e}")
        
        # ✅ Stocker dans la requête
        request.tenant_id = tenant_id
        
        if tenant_id:
            logger.debug(f"✅ tenant_id final assigné: {tenant_id}")
        else:
            logger.warning("⚠️ Aucun tenant_id n'a pu être déterminé!")
        
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