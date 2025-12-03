# backend/members/receptionist_urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import receptionist_views

router = DefaultRouter()
router.register(r'members', receptionist_views.ReceptionistMemberViewSet, basename='receptionist-member')

urlpatterns = [
    path('', include(router.urls)),
]