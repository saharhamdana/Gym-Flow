# backend/billing/serializers.py

from rest_framework import serializers
from .models import Invoice, Payment
from members.serializers import MemberListSerializer

class InvoiceListSerializer(serializers.ModelSerializer):
    """Serializer léger pour les listes"""
    member_name = serializers.CharField(source='member.full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'member', 'member_name',
            'amount', 'tax_amount', 'total_amount', 'status', 'status_display',
            'issue_date', 'due_date', 'payment_date', 'payment_method',
            'is_overdue', 'created_at'
        ]
        read_only_fields = ['tenant_id']


class InvoiceDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé avec toutes les infos"""
    member_details = MemberListSerializer(source='member', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    pdf_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Invoice
        fields = '__all__'
        read_only_fields = ['tenant_id', 'invoice_number']
    
    def get_pdf_url(self, obj):
        if obj.pdf_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.pdf_file.url)
        return None


class InvoiceCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création"""
    
    class Meta:
        model = Invoice
        fields = [
            'member', 'subscription', 'amount', 'tax_rate',
            'issue_date', 'notes', 'line_items',
            'customer_name', 'customer_email', 'customer_address'
        ]
        read_only_fields = ['tenant_id']
    
    def validate_line_items(self, value):
        """Valider le format des lignes de facture"""
        if not isinstance(value, list):
            raise serializers.ValidationError("line_items doit être une liste")
        
        for item in value:
            if not isinstance(item, dict):
                raise serializers.ValidationError("Chaque élément doit être un dictionnaire")
            
            required_fields = ['description', 'unit_price', 'total']
            for field in required_fields:
                if field not in item:
                    raise serializers.ValidationError(f"Champ requis manquant: {field}")
        
        return value


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer pour les paiements"""
    invoice_number = serializers.CharField(source='invoice.invoice_number', read_only=True)
    
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['tenant_id']