from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes, parser_classes, action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import (
    RegisterSerializer, 
    UserSerializer, 
    UpdateProfileSerializer,
    GymCenterSerializer,
    CheckSubdomainSerializer
)
from authentication.models import GymCenter


# ---------- Auth / Utilisateur ----------

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Utilisateur créé avec succès"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    serializer = UserSerializer(request.user, context={'request': request})
    return Response(serializer.data)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def update_user_profile(request):
    """
    Mettre à jour le profil de l'utilisateur connecté
    Supporte l'upload de photo de profil
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
    Endpoint dédié pour l'upload de photo de profil
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
    Supprimer la photo de profil de l'utilisateur connecté
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


# ---------- GymCenter ViewSet ----------

class GymCenterViewSet(viewsets.ModelViewSet):
    queryset = GymCenter.objects.filter(is_active=True)
    serializer_class = GymCenterSerializer
    lookup_field = 'subdomain'
    
    def get_permissions(self):
        """
        Définir les permissions selon l'action
        """
        if self.action in ['list', 'retrieve', 'check_subdomain', 'get_by_subdomain']:
            # Actions publiques
            permission_classes = [AllowAny]
        else:
            # Actions qui nécessitent l'authentification
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
    
    @action(detail=False, methods=['post'], url_path='check-subdomain', permission_classes=[AllowAny])
    def check_subdomain(self, request):
        """
        Vérifier la disponibilité d'un sous-domaine
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
        Récupérer un centre par son sous-domaine
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