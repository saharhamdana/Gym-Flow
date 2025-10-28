# subscriptions/dashboard.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import SubscriptionPlan, MemberSubscription
from authentication.models import User

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard(request):
    total_plans = SubscriptionPlan.objects.count()
    total_subscriptions = MemberSubscription.objects.count()
    total_members = User.objects.filter(role='MEMBER').count()

    data = {
        "total_plans": total_plans,
        "total_subscriptions": total_subscriptions,
        "total_members": total_members
    }

    return Response(data)
