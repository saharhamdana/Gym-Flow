from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    register, 
    get_user_profile, 
    update_user_profile,
    upload_profile_picture,
    delete_profile_picture,
    GymCenterViewSet
)

router = DefaultRouter()
router.register(r'centers', GymCenterViewSet, basename='gymcenter')

urlpatterns = [
    path('register/', register, name='register'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', get_user_profile, name='user_profile'),
    path('me/update/', update_user_profile, name='update_profile'),
    path('me/upload-picture/', upload_profile_picture, name='upload_profile_picture'),
    path('me/delete-picture/', delete_profile_picture, name='delete_profile_picture'),
    path('', include(router.urls)),
]