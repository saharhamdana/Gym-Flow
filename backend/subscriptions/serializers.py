# Fichier: backend/subscriptions/serializers.py

from rest_framework import serializers
from .models import SubscriptionPlan, Subscription
from members.serializers import MemberListSerializer

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = '__all__'
        # ✅ CORRECTION : tenant_id en lecture seule
        read_only_fields = ['tenant_id']


class SubscriptionListSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source='member.full_name', read_only=True)
    plan_name = serializers.CharField(source='plan.name', read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    days_remaining = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Subscription
        fields = [
            'id', 'member', 'member_name', 'plan', 'plan_name',
            'start_date', 'end_date', 'status', 'amount_paid',
            'payment_date', 'is_active', 'days_remaining'
        ]


class SubscriptionDetailSerializer(serializers.ModelSerializer):
    member_details = MemberListSerializer(source='member', read_only=True)
    plan_details = SubscriptionPlanSerializer(source='plan', read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    days_remaining = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Subscription
        fields = '__all__'


class SubscriptionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = ['member', 'plan', 'start_date', 'amount_paid', 'payment_method', 'notes']
    
    def create(self, validated_data):
        subscription = Subscription.objects.create(**validated_data)
        
        # ✅ ACTIVER AUTOMATIQUEMENT L'ABONNEMENT ET LE MEMBRE
        subscription.activate()
        
        return subscription