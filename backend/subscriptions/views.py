from rest_framework import viewsets, permissions, generics
from .models import SubscriptionPlan, MemberSubscription
from .serializers import SubscriptionPlanSerializer, MemberSubscriptionSerializer
from .dashboard import dashboard


class SubscriptionPlanViewSet(viewsets.ModelViewSet):
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

class MemberSubscriptionViewSet(viewsets.ModelViewSet):
    queryset = MemberSubscription.objects.all()
    serializer_class = MemberSubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]
