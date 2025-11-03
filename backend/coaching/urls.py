from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ExerciseCategoryViewSet,
    ExerciseViewSet,
    TrainingProgramViewSet,
    WorkoutSessionViewSet,
    ProgressTrackingViewSet,
    WorkoutLogViewSet
)

router = DefaultRouter()
router.register(r'exercise-categories', ExerciseCategoryViewSet, basename='exercise-category')
router.register(r'exercises', ExerciseViewSet, basename='exercise')
router.register(r'programs', TrainingProgramViewSet, basename='training-program')
router.register(r'workout-sessions', WorkoutSessionViewSet, basename='workout-session')
router.register(r'progress-tracking', ProgressTrackingViewSet, basename='progress-tracking')
router.register(r'workout-logs', WorkoutLogViewSet, basename='workout-log')

urlpatterns = [
    path('', include(router.urls)),
]