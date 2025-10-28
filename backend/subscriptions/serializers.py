from rest_framework import serializers
from .models import SubscriptionPlan, MemberSubscription
from authentication.models import GymCenter


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    center_name = serializers.CharField(source='center.name', read_only=True)
    
    class Meta:
        model = SubscriptionPlan
        fields = [
            'id', 'name', 'description', 'duration', 'price', 
            'features', 'is_active', 'max_subscriptions', 
            'center', 'center_name', 'created_at', 'updated_at'
        ]


class MemberSubscriptionSerializer(serializers.ModelSerializer):
    plan = SubscriptionPlanSerializer(read_only=True)
    plan_id = serializers.PrimaryKeyRelatedField(
        queryset=SubscriptionPlan.objects.all(),
        source='plan',
        write_only=True
    )
    member_name = serializers.CharField(source='member.get_full_name', read_only=True)
    member_email = serializers.EmailField(source='member.email', read_only=True)
    
    class Meta:
        model = MemberSubscription
        fields = [
            'id', 'member', 'member_name', 'member_email',
            'plan', 'plan_id', 'created_by', 
            'start_date', 'end_date', 'is_active', 'created_at'
        ]
        read_only_fields = ['member', 'created_at', 'start_date']


class GymCenterSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    
    class Meta:
        model = GymCenter
        fields = [
            'id', 'name', 'description', 'email', 'phone', 
            'address', 'owner', 'owner_name', 'logo', 
            'tenant_id', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['owner', 'created_at', 'updated_at']