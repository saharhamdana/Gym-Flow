# backend/bookings/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import receptionist_views  # ✅ AJOUT

router = DefaultRouter()
router.register(r'rooms', views.RoomViewSet, basename='room')
router.register(r'course-types', views.CourseTypeViewSet, basename='coursetype')
router.register(r'courses', views.CourseViewSet, basename='course')
router.register(r'bookings', views.BookingViewSet, basename='booking')

urlpatterns = [
    path('', include(router.urls)),
    
    # ✅ ENDPOINTS RÉCEPTIONNISTE CHECK-IN
    path('receptionist/search-member/', receptionist_views.search_member_for_checkin, name='receptionist-search'),
    path('check-in/quick/', receptionist_views.quick_checkin, name='quick-checkin'),
    path('check-in/manual/', receptionist_views.manual_checkin, name='manual-checkin'),
    path('receptionist/checkin-stats/', receptionist_views.checkin_stats, name='checkin-stats'),
]