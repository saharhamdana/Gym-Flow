# backend/authentication/views.py

from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes, parser_classes, action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import ValidationError
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from .serializers import (
    RegisterSerializer, 
    UserSerializer, 
    UpdateProfileSerializer,
    GymCenterSerializer,
    CheckSubdomainSerializer
)
from authentication.models import GymCenter

User = get_user_model()


# ========== SERIALIZER PERSONNALISÉ POUR LE LOGIN ==========

class TenantTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Serializer personnalisé pour vérifier le tenant lors de la connexion.
    Empêche la connexion sur un sous-domaine différent de celui d'inscription.
    """
    
    def validate(self, attrs):
        # Obtenir le gym_center depuis le contexte (ajouté par le middleware)
        request = self.context.get('request')
        gym_center = getattr(request, 'gym_center', None)
        
        # Vérifier qu'un centre est détecté via le sous-domaine
        if not gym_center:
            raise ValidationError({
                'error': 'Connexion impossible',
                'detail': 'Vous devez vous connecter via le sous-domaine d\'un centre (ex: powerfit.gymflow.com)'
            })
        
        # Validation normale (email + password)
        data = super().validate(attrs)
        
        # Vérifier que l'utilisateur appartient au centre
        user = self.user
        
        # Si l'utilisateur n'a pas de tenant_id
        if not user.tenant_id:
            raise ValidationError({
                'error': 'Compte non configuré',
                'detail': 'Votre compte n\'est associé à aucun centre. Veuillez contacter l\'administrateur.'
            })
        
        # Si le tenant_id de l'utilisateur ne correspond pas au centre actuel
        if user.tenant_id != gym_center.tenant_id:
            # Récupérer le centre de l'utilisateur pour un message clair
            try:
                user_center = GymCenter.objects.get(tenant_id=user.tenant_id)
                raise ValidationError({
                    'error': 'Mauvais centre',
                    'detail': f'Vous êtes inscrit au centre "{user_center.name}". Veuillez vous connecter sur : {user_center.full_url}',
                    'correct_url': user_center.full_url,
                    'correct_subdomain': user_center.subdomain
                })
            except GymCenter.DoesNotExist:
                raise ValidationError({
                    'error': 'Mauvais centre',
                    'detail': 'Vous n\'avez pas accès à ce centre.'
                })
        
        # Ajouter des infos supplémentaires au token
        data['user'] = {
            'id': user.id,
            'email': user.email,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
            'tenant_id': user.tenant_id,
            'gym_center': gym_center.name,
            'subdomain': gym_center.subdomain
        }
        
        return data


# ========== VUE DE LOGIN PERSONNALISÉE ==========

class TenantTokenObtainPairView(TokenObtainPairView):
    """
    Vue de login personnalisée avec vérification du tenant.
    Remplace la vue par défaut de SimpleJWT.
    """
    serializer_class = TenantTokenObtainPairSerializer


# ========== INSCRIPTION (REGISTER) ==========

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Inscription d'un utilisateur sur un sous-domaine spécifique.
    L'utilisateur sera automatiquement lié au centre du sous-domaine.
    """
    # Récupérer le gym_center depuis le middleware
    gym_center = getattr(request, 'gym_center', None)
    
    # Vérifier qu'un centre est détecté
    if not gym_center:
        return Response({
            "error": "Inscription impossible",
            "detail": "Vous devez vous inscrire via le sous-domaine d'un centre (ex: powerfit.gymflow.com)"
        }, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = RegisterSerializer(data=request.data)
    
    if serializer.is_valid():
        # Créer l'utilisateur avec le tenant_id du centre
        user = serializer.save(tenant_id=gym_center.tenant_id)
        
        return Response({
            "message": f"Utilisateur créé avec succès pour le centre {gym_center.name}",
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": user.role,
                "tenant_id": user.tenant_id,
                "gym_center": gym_center.name,
                "subdomain": gym_center.subdomain
            }
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ========== PROFIL UTILISATEUR ==========

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    """
    Récupérer le profil de l'utilisateur connecté.
    """
    serializer = UserSerializer(request.user, context={'request': request})
    data = serializer.data
    
    # Ajouter des infos sur le centre
    gym_center = getattr(request, 'gym_center', None)
    if gym_center:
        data['gym_center'] = {
            'id': gym_center.id,
            'name': gym_center.name,
            'subdomain': gym_center.subdomain,
            'full_url': gym_center.full_url
        }
    
    return Response(data)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def update_user_profile(request):
    """
    Mettre à jour le profil de l'utilisateur connecté.
    Supporte l'upload de photo de profil.
    """
    user = request.user
    serializer = UpdateProfileSerializer(
        user, 
        data=request.data, 
        partial=True,
        context={'request': request}
    )
    
    if serializer.is_valid():
        serializer.save()
        # Retourner le profil complet mis à jour
        user_serializer = UserSerializer(user, context={'request': request})
        return Response(user_serializer.data, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_profile_picture(request):
    """
    Endpoint dédié pour l'upload de photo de profil.
    """
    user = request.user
    
    if 'profile_picture' not in request.FILES:
        return Response(
            {"error": "Aucune image fournie"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user.profile_picture = request.FILES['profile_picture']
    user.save()
    
    serializer = UserSerializer(user, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_profile_picture(request):
    """
    Supprimer la photo de profil de l'utilisateur connecté.
    """
    user = request.user
    
    if not user.profile_picture:
        return Response(
            {"detail": "Aucune photo de profil à supprimer"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Supprimer le fichier physique et le champ de la base de données
    user.profile_picture.delete(save=False)
    user.profile_picture = None
    user.save()
    
    serializer = UserSerializer(user, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)


# ========== RÉCUPÉRATION DE MOT DE PASSE ==========

@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset(request):
    email = request.data.get('email')

    if not email:
        return Response({'error': 'Email requis'}, status=400)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        # On ne dit pas si l'utilisateur existe ou non
        return Response({
            'success': True,
            'message': 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.'
        }, status=200)

    # 🔹 ICI on force un "gym_center" pour les tests en local
    class Dummy:
        name = "GymFlow"
        full_url = "http://localhost:5173"

    gym_center = Dummy()

    # 🔹 Génération du token et de l’URL
    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    reset_url = f"{gym_center.full_url}/reset-password/{uid}/{token}"

    subject = f"Réinitialisation de mot de passe - {gym_center.name}"
    message = f"""
Bonjour {user.username},

Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :
{reset_url}

Ce lien est valable 24 heures.
"""

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )

    return Response({
        'success': True,
        'message': 'Un email de réinitialisation a été envoyé à votre adresse.',
    }, status=200)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_reset_token(request):
    """
    Vérifie si le token de réinitialisation est valide.
    
    POST /api/auth/password-reset/verify/
    Body: {"uid": "...", "token": "..."}
    """
    uid = request.data.get('uid')
    token = request.data.get('token')
    
    if not uid or not token:
        return Response({
            'valid': False,
            'error': 'UID et token requis'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Décoder l'UID
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)
        
        # Vérifier le token
        if default_token_generator.check_token(user, token):
            return Response({
                'valid': True,
                'email': user.email,
                'username': user.username
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'valid': False,
                'error': 'Token invalide ou expiré'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response({
            'valid': False,
            'error': 'Lien invalide'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_confirm(request):
    """
    Réinitialise le mot de passe avec le token.
    
    POST /api/auth/password-reset/confirm/
    Body: {
        "uid": "...",
        "token": "...",
        "new_password": "..."
    }
    """
    uid = request.data.get('uid')
    token = request.data.get('token')
    new_password = request.data.get('new_password')
    
    if not uid or not token or not new_password:
        return Response({
            'error': 'Données manquantes',
            'detail': 'UID, token et nouveau mot de passe requis.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validation du mot de passe
    if len(new_password) < 8:
        return Response({
            'error': 'Mot de passe trop court',
            'detail': 'Le mot de passe doit contenir au moins 8 caractères.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Décoder l'UID
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)
        
        # Vérifier le token
        if not default_token_generator.check_token(user, token):
            return Response({
                'error': 'Token invalide',
                'detail': 'Le lien de réinitialisation est invalide ou a expiré.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Changer le mot de passe
        user.set_password(new_password)
        user.save()
        
        return Response({
            'success': True,
            'message': 'Votre mot de passe a été réinitialisé avec succès.',
            'email': user.email
        }, status=status.HTTP_200_OK)
        
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response({
            'error': 'Lien invalide',
            'detail': 'Le lien de réinitialisation est invalide.'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(f"Erreur lors de la réinitialisation: {e}")
        return Response({
            'error': 'Erreur serveur',
            'detail': 'Une erreur est survenue lors de la réinitialisation.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ========== GYMCENTER VIEWSET ==========

class GymCenterViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des centres de fitness.
    """
    queryset = GymCenter.objects.filter(is_active=True)
    serializer_class = GymCenterSerializer
    lookup_field = 'subdomain'
    
    def get_permissions(self):
        """
        Définir les permissions selon l'action.
        """
        if self.action in ['list', 'retrieve', 'check_subdomain', 'get_by_subdomain']:
            # Actions publiques
            permission_classes = [AllowAny]
        else:
            # Actions qui nécessitent l'authentification
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        """
        Créer un centre avec l'utilisateur connecté comme owner.
        """
        serializer.save(owner=self.request.user)
    
    @action(detail=False, methods=['post'], url_path='check-subdomain', permission_classes=[AllowAny])
    def check_subdomain(self, request):
        """
        Vérifier la disponibilité d'un sous-domaine.
        POST /api/auth/centers/check-subdomain/
        Body: {"subdomain": "powerfit"}
        """
        serializer = CheckSubdomainSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'available': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        subdomain = serializer.validated_data['subdomain']
        
        # Vérifier les sous-domaines réservés
        reserved_subdomains = [
            'www', 'api', 'admin', 'app', 'mail', 'ftp', 
            'smtp', 'pop', 'imap', 'test', 'dev', 'staging',
            'beta', 'demo', 'support', 'help', 'blog'
        ]
        
        if subdomain in reserved_subdomains:
            return Response({
                'available': False,
                'message': f"Le sous-domaine '{subdomain}' est réservé."
            }, status=status.HTTP_200_OK)
        
        # Vérifier l'unicité
        exists = GymCenter.objects.filter(subdomain=subdomain).exists()
        
        if exists:
            return Response({
                'available': False,
                'message': f"Le sous-domaine '{subdomain}' est déjà utilisé."
            }, status=status.HTTP_200_OK)
        
        return Response({
            'available': True,
            'message': f"Le sous-domaine '{subdomain}' est disponible.",
            'full_url': f"https://{subdomain}.gymflow.com"
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'], url_path='by-subdomain', permission_classes=[AllowAny])
    def get_by_subdomain(self, request, subdomain=None):
        """
        Récupérer un centre par son sous-domaine.
        GET /api/auth/centers/{subdomain}/by-subdomain/
        """
        try:
            center = GymCenter.objects.get(subdomain=subdomain, is_active=True)
            serializer = self.get_serializer(center)
            return Response(serializer.data)
        except GymCenter.DoesNotExist:
            return Response(
                {'detail': 'Centre non trouvé avec ce sous-domaine.'},
                status=status.HTTP_404_NOT_FOUND
            )