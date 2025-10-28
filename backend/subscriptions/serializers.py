# backend/subscriptions/serializers.py
from rest_framework import serializers
from .models import SubscriptionPlan, MemberSubscription
from authentication.models import GymCenter

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = '__all__'

class MemberSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MemberSubscription
        fields = '__all__'

class GymCenterSerializer(serializers.ModelSerializer):
    class Meta:
        model = GymCenter
        fields = '__all__'


