from django.db import models
from authentication.models import User, GymCenter

class SubscriptionPlan(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    duration = models.CharField(max_length=20)  # MONTHLY, YEARLY, etc.
    price = models.DecimalField(max_digits=10, decimal_places=2)
    features = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    max_subscriptions = models.PositiveIntegerField(default=0)
    center = models.ForeignKey(GymCenter, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class MemberSubscription(models.Model):
    member = models.ForeignKey(
        'authentication.User', 
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'MEMBER'}
    )
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.CASCADE)
    created_by = models.ForeignKey('authentication.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='created_subscriptions')
    start_date = models.DateField(auto_now_add=True)
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
