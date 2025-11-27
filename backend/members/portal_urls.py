# backend/members/portal_urls.py

from django.urls import path
from members import portal_views

urlpatterns = [
    # Dashboard
    path('dashboard/', portal_views.member_dashboard, name='member-dashboard'),
    
    # Cours & Réservations
    path('courses/available/', portal_views.available_courses, name='available-courses'),
    path('bookings/', portal_views.my_bookings, name='my-bookings'),
    path('bookings/book/', portal_views.book_course, name='book-course'),
    path('bookings/<int:booking_id>/cancel/', portal_views.cancel_booking, name='cancel-booking'),
    
    # Programmes
    path('programs/', portal_views.my_programs, name='my-programs'),
    
    # Progression
    path('progress/', portal_views.my_progress, name='my-progress'),
    
    # Abonnements
    path('subscriptions/', portal_views.my_subscriptions, name='my-subscriptions'),
    path('subscriptions/history/', portal_views.my_subscription_history, name='my-subscription-history'),
    path('subscriptions/plans/', portal_views.subscription_plans_list, name='subscription-plans'),
]