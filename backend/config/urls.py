from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('api/superadmin/', include('authentication.superadmin_urls')),
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/subscriptions/', include('subscriptions.urls')),
    path('api/members/', include('members.urls')),
    path('api/bookings/', include('bookings.urls')),
    path('api/coaching/', include('coaching.urls')), 
    path('api/members-portal/', include('members.portal_urls')),
    path('api/billing/', include('billing.urls')),
    path('api/', include('site_utils.urls')),

    path('api/receptionist/members/', include('members.receptionist_urls')),
]

# Servir les fichiers média en développement
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)