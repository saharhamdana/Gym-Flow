from django.contrib import admin
from .models import Member, MemberMeasurement


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ['member_id', 'first_name', 'last_name', 'email', 'phone', 'status', 'join_date']
    list_filter = ['status', 'gender', 'join_date']
    search_fields = ['member_id', 'first_name', 'last_name', 'email', 'phone']
    readonly_fields = ['member_id', 'join_date', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Informations Personnelles', {
            'fields': ('first_name', 'last_name', 'email', 'phone', 'date_of_birth', 'gender', 'address')
        }),
        ('Informations Membre', {
            'fields': ('member_id', 'join_date', 'status', 'emergency_contact_name', 'emergency_contact_phone')
        }),
        ('Informations Physiques', {
            'fields': ('height', 'weight', 'medical_conditions', 'photo'),
            'classes': ('collapse',)
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(MemberMeasurement)
class MemberMeasurementAdmin(admin.ModelAdmin):
    list_display = ['member', 'date', 'weight', 'body_fat_percentage']
    list_filter = ['date']
    search_fields = ['member__first_name', 'member__last_name']
    readonly_fields = ['date']
    
    fieldsets = (
        ('Information Générale', {
            'fields': ('member', 'date')
        }),
        ('Mesures', {
            'fields': ('weight', 'body_fat_percentage', 'muscle_mass', 'chest', 'waist', 'hips', 'notes')
        }),
    )