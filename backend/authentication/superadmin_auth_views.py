# backend/authentication/superadmin_auth_views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

User = get_user_model()


class SuperAdminLoginView(APIView):
    """
    Endpoint de connexion spécifique pour les super admins.
    N'exige PAS de tenant header.
    
    POST /api/superadmin/auth/login/
    {
        "email": "superadmin@gymflow.com",
        "password": "votre_mdp"
    }
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        print(f"🔐 Tentative de connexion SuperAdmin: {email}")
        print(f"Headers reçus: {request.headers}")
        
        # Validation basique
        if not email or not password:
            return Response(
                {'detail': 'Email et mot de passe requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Authentifier l'utilisateur
        user = authenticate(request, username=email, password=password)
        
        if not user:
            return Response(
                {'detail': 'Identifiants incorrects'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Vérifier si c'est un superuser
        if not user.is_superuser:
            return Response(
                {'detail': 'Accès réservé aux super administrateurs'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Générer les tokens JWT
        refresh = RefreshToken.for_user(user)
        
        # Préparer les données utilisateur
        user_data = {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name or '',
            'last_name': user.last_name or '',
            'is_superuser': user.is_superuser,
            'is_staff': user.is_staff,
            'role': user.role if hasattr(user, 'role') else None,
            'date_joined': user.date_joined,
        }
        
        # Log pour débogage
        print(f"✅ Connexion SuperAdmin réussie pour: {email}")
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': user_data,
            'message': 'Connexion SuperAdmin réussie'
        })


class SuperAdminProfileView(APIView):
    """
    Récupérer le profil du super admin connecté.
    
    GET /api/superadmin/auth/me/
    Headers: Authorization: Bearer <token>
    """
    
    def get(self, request):
        if not request.user.is_authenticated:
            return Response(
                {'detail': 'Non authentifié'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not request.user.is_superuser:
            return Response(
                {'detail': 'Accès non autorisé'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        user = request.user
        user_data = {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name or '',
            'last_name': user.last_name or '',
            'is_superuser': user.is_superuser,
            'is_staff': user.is_staff,
            'role': user.role if hasattr(user, 'role') else None,
            'date_joined': user.date_joined,
        }
        
        return Response(user_data)