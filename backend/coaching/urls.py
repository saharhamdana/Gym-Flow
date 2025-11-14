from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ExerciseCategoryViewSet,
    ExerciseViewSet,
    TrainingProgramViewSet,
    WorkoutSessionViewSet,
    ProgressTrackingViewSet,
    WorkoutLogViewSet,
    MemberSelectionViewSet,
    coach_dashboard_stats,
    coach_upcoming_sessions,
    coach_my_members,
    WorkoutExerciseViewSet,
)

router = DefaultRouter()
router.register(r'exercise-categories', ExerciseCategoryViewSet, basename='exercise-category')
router.register(r'exercises', ExerciseViewSet, basename='exercise')
router.register(r'programs', TrainingProgramViewSet, basename='training-program')
router.register(r'workout-sessions', WorkoutSessionViewSet, basename='workout-session')
router.register(r'workout-exercises', WorkoutExerciseViewSet, basename='workout-exercise') 
router.register(r'progress-tracking', ProgressTrackingViewSet, basename='progress-tracking')
router.register(r'workout-logs', WorkoutLogViewSet, basename='workout-log')
router.register(r'members', MemberSelectionViewSet, basename='member-selection')

urlpatterns = [
    path('', include(router.urls)),
    
    # Routes spécifiques pour le Coach Dashboard
    path('coach/dashboard-stats/', coach_dashboard_stats, name='coach-dashboard-stats'),
    path('coach/upcoming-sessions/', coach_upcoming_sessions, name='coach-upcoming-sessions'),
    path('coach/my-members/', coach_my_members, name='coach-my-members'),
    path('coach/dashboard-stats/', coach_dashboard_stats, name='coach-dashboard-stats'),
    path('coach/upcoming-sessions/', coach_upcoming_sessions, name='coach-upcoming-sessions'),
    path('members/', coach_my_members, name='coach-members-list'),
]