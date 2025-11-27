# backend/billing/admin.py

from django.contrib import admin
from .models import Invoice, Payment

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['invoice_number', 'customer_name', 'total_amount', 'status', 'issue_date', 'payment_date']
    list_filter = ['status', 'issue_date', 'payment_method']
    search_fields = ['invoice_number', 'customer_name', 'customer_email']
    readonly_fields = ['invoice_number', 'tax_amount', 'total_amount', 'created_at', 'updated_at']
    date_hierarchy = 'issue_date'
    
    fieldsets = (
        ('Identification', {
            'fields': ('invoice_number', 'member', 'subscription', 'status')
        }),
        ('Montants', {
            'fields': ('amount', 'tax_rate', 'tax_amount', 'total_amount')
        }),
        ('Dates', {
            'fields': ('issue_date', 'due_date', 'payment_date')
        }),
        ('Paiement', {
            'fields': ('payment_method', 'stripe_payment_intent_id')
        }),
        ('Client', {
            'fields': ('customer_name', 'customer_email', 'customer_address'),
            'classes': ('collapse',)
        }),
        ('Société', {
            'fields': ('company_name', 'company_address', 'company_tax_id'),
            'classes': ('collapse',)
        }),
        ('Détails', {
            'fields': ('line_items', 'notes', 'pdf_file')
        }),
        ('Métadonnées', {
            'fields': ('tenant_id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['invoice', 'amount', 'payment_date', 'payment_method']
    list_filter = ['payment_date', 'payment_method']
    search_fields = ['invoice__invoice_number', 'reference']
    date_hierarchy = 'payment_date'