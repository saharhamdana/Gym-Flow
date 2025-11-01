from rest_framework import viewsets, permissions
from django.contrib.auth import get_user_model
from rest_framework.response import Response
from .serializers import UserSerializer
from django_filters import rest_framework as filters

User = get_user_model()

class UserFilter(filters.FilterSet):
    role = filters.CharFilter(field_name='role')

    class Meta:
        model = User
        fields = ['role']

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A viewset for viewing users.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_class = UserFilter
    
    def get_queryset(self):
        queryset = User.objects.all()
        role = self.request.query_params.get('role', None)
        if role is not None:
            queryset = queryset.filter(role=role)
        return queryset