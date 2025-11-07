# backend/authentication/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, GymCenter


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = (
        'email', 'first_name', 'last_name', 'role',
        'is_active', 'is_staff', 'created_at'
    )
    list_filter = ('role', 'is_active', 'is_staff')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('-created_at',)

    fieldsets = (
        ('Identifiants', {'fields': ('email', 'password')}),
        ('Informations personnelles', {
            'fields': ('first_name', 'last_name', 'phone', 'date_of_birth', 'address', 'profile_picture')
        }),
        ('Rôle et permissions', {
            'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Métadonnées', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email', 'username', 'first_name', 'last_name',
                'role', 'password1', 'password2', 'is_active', 'is_staff'
            ),
        }),
    )

    readonly_fields = ('created_at', 'updated_at')


@admin.register(GymCenter)
class GymCenterAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone', 'owner', 'tenant_id', 'is_active')
    search_fields = ('name', 'tenant_id', 'owner__email')
    list_filter = ('is_active',)
    ordering = ('-created_at',)
