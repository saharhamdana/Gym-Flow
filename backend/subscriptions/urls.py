from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .dashboard import dashboard

router = DefaultRouter()
router.register(r'plans', views.SubscriptionPlanViewSet, basename='plan')
router.register(r'subscriptions', views.MemberSubscriptionViewSet, basename='subscription')


urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', views.dashboard, name='dashboard'),
]
