# Fichier: backend/subscriptions/admin.py

from django.contrib import admin
from .models import SubscriptionPlan, Subscription

@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ['name', 'duration_days', 'price', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name', 'description']

@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['member', 'plan', 'start_date', 'end_date', 'status', 'amount_paid']
    list_filter = ['status', 'start_date', 'plan']
    search_fields = ['member__first_name', 'member__last_name', 'member__member_id']
    date_hierarchy = 'start_date'
    
    actions = ['activate_subscriptions', 'cancel_subscriptions']
    
    def activate_subscriptions(self, request, queryset):
        for subscription in queryset:
            subscription.activate()
        self.message_user(request, f"{queryset.count()} abonnement(s) activé(s)")
    activate_subscriptions.short_description = "Activer les abonnements sélectionnés"
    
    def cancel_subscriptions(self, request, queryset):
        for subscription in queryset:
            subscription.cancel()
        self.message_user(request, f"{queryset.count()} abonnement(s) annulé(s)")
    cancel_subscriptions.short_description = "Annuler les abonnements sélectionnés"