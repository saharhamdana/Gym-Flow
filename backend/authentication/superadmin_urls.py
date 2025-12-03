# backend/authentication/superadmin_urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .superadmin_views import (
    SuperAdminGymCenterViewSet,
    SuperAdminStaffViewSet,
    SuperAdminServicesViewSet
)
from .superadmin_auth_views import SuperAdminLoginView, SuperAdminProfileView  # Nouveau

router = DefaultRouter()
router.register(r'gyms', SuperAdminGymCenterViewSet, basename='superadmin-gyms')
router.register(r'staff', SuperAdminStaffViewSet, basename='superadmin-staff')
router.register(r'services', SuperAdminServicesViewSet, basename='superadmin-services')

urlpatterns = [
    path('', include(router.urls)),
    # Nouveaux endpoints d'authentification SuperAdmin
    path('auth/login/', SuperAdminLoginView.as_view(), name='superadmin-login'),
    path('auth/me/', SuperAdminProfileView.as_view(), name='superadmin-me'),
]