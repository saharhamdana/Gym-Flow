from django.contrib import admin
from django.urls import path , include

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/subscriptions/', include('subscriptions.urls')),
    
]
