from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
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
    
    @action(detail=False, methods=['get'], url_path='my-subscriptions')
    def my_subscriptions(self, request):
        """Récupère les abonnements de l'utilisateur connecté"""
        user = request.user
        
        if user.role != 'MEMBER':
            return Response(
                {"detail": "Seuls les membres peuvent accéder à leurs abonnements."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        subscriptions = MemberSubscription.objects.filter(
            member=user
        ).select_related('plan').order_by('-created_at')
        
        serializer = self.get_serializer(subscriptions, many=True)
        
        return Response(serializer.data, status=status.HTTP_200_OK)