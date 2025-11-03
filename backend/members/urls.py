# Fichier: backend/members/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views # Pour MemberViewSet
# 🟢 NOUVEL IMPORT CORRECT
from .views_dashboard import dashboard_stats


router = DefaultRouter()
# Route pour le ViewSet (ex: /api/members/1/ ou /api/members/statistics/)
router.register(r'', views.MemberViewSet, basename='member')

urlpatterns = [
    # 🟢 URL pour la fonction dashboard_stats
    path('dashboard-stats/', dashboard_stats, name='dashboard-stats'),
    # 🟢 Inclusion des URLs générées par le Router
    path('', include(router.urls)),
]