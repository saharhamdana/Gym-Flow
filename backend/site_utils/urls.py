# backend/site_utils/urls.py
from django.urls import path
from .views import ContactFormSubmissionView

urlpatterns = [
    # The full path will be 'api/contact/'
    path('contact/', ContactFormSubmissionView.as_view(), name='contact_submit'),
]