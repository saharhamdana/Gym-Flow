# bookings/admin.py

from django.contrib import admin
from .models import Room, CourseType, Course, Booking

@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ['name', 'capacity', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name', 'description']

@admin.register(CourseType)
class CourseTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'duration_minutes', 'color', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name', 'description']

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'course_type', 'coach', 'room', 'date', 'start_time', 'status', 'available_spots']
    list_filter = ['status', 'course_type', 'date', 'coach']
    search_fields = ['title', 'description']
    date_hierarchy = 'date'

    def available_spots(self, obj):
        return obj.available_spots
    available_spots.short_description = 'Places disponibles'

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['member', 'course', 'status', 'checked_in', 'booking_date']
    list_filter = ['status', 'checked_in', 'booking_date']
    search_fields = ['member__first_name', 'member__last_name', 'course__title']
    date_hierarchy = 'booking_date'