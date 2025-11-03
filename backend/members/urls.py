# Fichier: backend/members/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views # Pour MemberViewSet
from .views_dashboard import dashboard_stats
from .views_card import generate_member_card

router = DefaultRouter()
# Route pour le ViewSet (ex: /api/members/1/ ou /api/members/statistics/)
router.register(r'', views.MemberViewSet, basename='member')

urlpatterns = [
    # URL pour les statistiques du tableau de bord
    path('dashboard-stats/', dashboard_stats, name='dashboard-stats'),
    # URL pour la génération de carte membre
    path('generate-card/<str:member_id>/', generate_member_card, name='generate-card'),
    # Inclusion des URLs générées par le Router
    path('', include(router.urls)),
]