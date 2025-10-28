from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import register, get_user_profile, GymCenterViewSet

# Créer un routeur DRF
router = DefaultRouter()
router.register(r'centers', GymCenterViewSet, basename='gymcenter')

urlpatterns = [
    path('register/', register, name='register'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', get_user_profile, name='user_profile'),

    # Ajouter les URLs du routeur
    path('', include(router.urls)),
]
