# backend/subscriptions/admin.py
from django.contrib import admin
from .models import SubscriptionPlan, MemberSubscription


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'duration', 'price', 'is_active',
        'max_subscriptions', 'center', 'created_at'
    )
    list_filter = ('duration', 'is_active', 'center')
    search_fields = ('name', 'center__name')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)

    fieldsets = (
        ('Informations principales', {
            'fields': ('name', 'description', 'duration', 'price', 'features')
        }),
        ('Centre et statut', {
            'fields': ('center', 'is_active', 'max_subscriptions')
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(MemberSubscription)
class MemberSubscriptionAdmin(admin.ModelAdmin):
    list_display = (
        'member', 'plan', 'start_date', 'end_date',
        'is_active', 'created_by', 'created_at'
    )
    list_filter = ('is_active', 'plan__center', 'plan__duration')
    search_fields = (
        'member__email', 'member__first_name', 'member__last_name',
        'plan__name', 'created_by__email'
    )
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)

    fieldsets = (
        ('Abonnement du membre', {
            'fields': ('member', 'plan', 'created_by')
        }),
        ('Période et statut', {
            'fields': ('start_date', 'end_date', 'is_active')
        }),
        ('Métadonnées', {
            'fields': ('created_at',)
        }),
    )
