# Fichier: backend/subscriptions/serializers.py

from rest_framework import serializers
from .models import SubscriptionPlan, Subscription
from members.serializers import MemberListSerializer

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = '__all__'
        read_only_fields = ['tenant_id']


class SubscriptionListSerializer(serializers.ModelSerializer):
    # Champs calculés
    member_name = serializers.CharField(source='member.full_name', read_only=True)
    plan_name = serializers.CharField(source='plan.name', read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    days_remaining = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Subscription
        fields = [
            # Identifiants
            'id', 'member', 'member_name', 'plan', 'plan_name',
            
            # Statuts et dates
            'status', 'start_date', 'end_date', 'is_active', 'days_remaining',
            
            # Paiement
            'amount_paid', 'payment_method', 'payment_date',
            
            # Stripe
            'stripe_session_id', 'stripe_payment_intent_id',
            
            # Autres
            'notes', 'tenant_id', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class SubscriptionDetailSerializer(serializers.ModelSerializer):
    # Relations détaillées
    member_details = MemberListSerializer(source='member', read_only=True)
    plan_details = SubscriptionPlanSerializer(source='plan', read_only=True)
    
    # Champs calculés
    is_active = serializers.BooleanField(read_only=True)
    days_remaining = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Subscription
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class SubscriptionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = ['member', 'plan', 'start_date', 'amount_paid', 'payment_method', 'notes']
    
    def create(self, validated_data):
        subscription = Subscription.objects.create(**validated_data)
        subscription.activate()
        return subscription