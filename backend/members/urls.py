# Fichier: members/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
# Route: /api/members/
router.register(r'', views.MemberViewSet, basename='member')

urlpatterns = [
    path('', include(router.urls)),
]