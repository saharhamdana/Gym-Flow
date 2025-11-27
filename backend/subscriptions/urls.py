# backend/subscriptions/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import stripe_views

router = DefaultRouter()
router.register(r'plans', views.SubscriptionPlanViewSet, basename='subscription-plan')
router.register(r'subscriptions', views.SubscriptionViewSet, basename='subscription')

urlpatterns = [
    # ✅ Routes Stripe AVANT le router (pour éviter les conflits)
    path('create-payment/<int:subscription_id>/', 
         stripe_views.create_payment_session, 
         name='create-payment'),
    path('verify-payment/', 
         stripe_views.verify_payment, 
         name='verify-payment'),
    path('webhook/', 
         stripe_views.stripe_webhook, 
         name='stripe-webhook'),
    
    # ✅ Routes du router APRÈS
    path('', include(router.urls)),
]