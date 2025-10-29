# Fichier: members/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
# /api/members/profiles/
router.register(r'profiles', views.MemberProfileViewSet, basename='member-profile')
# /api/members/metrics/
router.register(r'metrics', views.PerformanceMetricViewSet, basename='performance-metric')

urlpatterns = [
    path('', include(router.urls)),
]