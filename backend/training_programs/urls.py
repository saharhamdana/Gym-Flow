from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TrainingProgramViewSet

router = DefaultRouter()
router.register(r'', TrainingProgramViewSet, basename='trainingprogram')

urlpatterns = [
    path('', include(router.urls)),
]
