# backend/site_utils/urls.py
from django.urls import path
from .views import ContactFormSubmissionView, generate_health_plan


urlpatterns = [
    # The full path will be 'api/contact/'
    path('contact/', ContactFormSubmissionView.as_view(), name='contact_submit'),
    path('generate-health-plan/', generate_health_plan, name='generate_health_plan'),  # Sans .as_view()
]