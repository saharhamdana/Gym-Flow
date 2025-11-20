# backend/authentication/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    register, 
    get_user_profile, 
    update_user_profile,
    upload_profile_picture,
    delete_profile_picture,
    GymCenterViewSet,
    TenantTokenObtainPairView,
    request_password_reset,
    verify_reset_token,
    reset_password_confirm,
)
from .viewsets import UserViewSet  # 🆕 Import du UserViewSet

router = DefaultRouter()
router.register(r'centers', GymCenterViewSet, basename='gymcenter')
router.register(r'users', UserViewSet, basename='user')  # 🆕 Ajout de la route users

urlpatterns = [
    # Authentification
    path('register/', register, name='register'),
    path('token/', TenantTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Récupération de mot de passe
    path('password-reset/request/', request_password_reset, name='password_reset_request'),
    path('password-reset/verify/', verify_reset_token, name='password_reset_verify'),
    path('password-reset/confirm/', reset_password_confirm, name='password_reset_confirm'),
    
    # Profil utilisateur
    path('me/', get_user_profile, name='user_profile'),
    path('me/update/', update_user_profile, name='update_profile'),
    path('me/upload-picture/', upload_profile_picture, name='upload_profile_picture'),
    path('me/delete-picture/', delete_profile_picture, name='delete_profile_picture'),
    
    # Router (inclut centres et users)
    path('', include(router.urls)),
]