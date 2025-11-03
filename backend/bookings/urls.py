# bookings/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'rooms', views.RoomViewSet, basename='room')
router.register(r'course-types', views.CourseTypeViewSet, basename='coursetype')
router.register(r'courses', views.CourseViewSet, basename='course')
router.register(r'bookings', views.BookingViewSet, basename='booking')

urlpatterns = [
    path('', include(router.urls)),
]