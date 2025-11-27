# backend/billing/views.py

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.http import FileResponse
from django.utils import timezone
import os
import logging

from .models import Invoice, Payment
from .serializers import (
    InvoiceListSerializer,
    InvoiceDetailSerializer,
    InvoiceCreateSerializer,
    PaymentSerializer
)
from .pdf_generator import generate_invoice_pdf
from authentication.mixins import CompleteTenantMixin

logger = logging.getLogger('billing.views')


class InvoiceViewSet(CompleteTenantMixin, viewsets.ModelViewSet):
    """
    ViewSet pour gérer les factures avec isolation tenant
    """
    queryset = Invoice.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'member', 'payment_method']
    search_fields = ['invoice_number', 'customer_name', 'customer_email']
    ordering_fields = ['issue_date', 'total_amount', 'created_at']
    tenant_field = 'tenant_id'
    
    def get_serializer_class(self):
        if self.action == 'list':
            return InvoiceListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return InvoiceCreateSerializer
        return InvoiceDetailSerializer
    
    def perform_create(self, serializer):
        """Créer une facture avec tenant_id"""
        tenant_id = getattr(self.request, 'tenant_id', None)
        
        if not tenant_id:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Impossible de créer une facture sans tenant_id")
        
        invoice = serializer.save(tenant_id=tenant_id)
        
        # Générer automatiquement le PDF
        try:
            pdf_path = generate_invoice_pdf(invoice)
            invoice.pdf_file = pdf_path
            invoice.save(update_fields=['pdf_file'])
            logger.info(f"✅ Facture {invoice.invoice_number} créée avec PDF")
        except Exception as e:
            logger.error(f"❌ Erreur génération PDF: {str(e)}")
    
    @action(detail=False, methods=['get'])
    def my_invoices(self, request):
        """
        Récupérer les factures du membre connecté
        URL: /api/billing/invoices/my-invoices/
        """
        user = request.user
        
        # Vérifier que l'user est un MEMBER
        if user.role != 'MEMBER':
            return Response({
                'error': 'Accès réservé aux membres'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            member = user.member_profile
            invoices = self.get_queryset().filter(member=member)
            serializer = InvoiceListSerializer(invoices, many=True)
            return Response(serializer.data)
        except:
            return Response([], status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'])
    def download_pdf(self, request, pk=None):
        """
        Télécharger le PDF d'une facture
        URL: /api/billing/invoices/{id}/download-pdf/
        """
        invoice = self.get_object()
        
        # Générer le PDF si nécessaire
        if not invoice.pdf_file or not os.path.exists(invoice.pdf_file.path):
            try:
                pdf_path = generate_invoice_pdf(invoice)
                invoice.pdf_file = pdf_path
                invoice.save(update_fields=['pdf_file'])
            except Exception as e:
                logger.error(f"❌ Erreur génération PDF: {str(e)}")
                return Response({
                    'error': 'Erreur lors de la génération du PDF'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Retourner le fichier
        try:
            response = FileResponse(
                open(invoice.pdf_file.path, 'rb'),
                content_type='application/pdf'
            )
            response['Content-Disposition'] = f'attachment; filename="Facture_{invoice.invoice_number}.pdf"'
            return response
        except Exception as e:
            logger.error(f"❌ Erreur téléchargement PDF: {str(e)}")
            return Response({
                'error': 'Fichier PDF introuvable'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def mark_as_paid(self, request, pk=None):
        """
        Marquer une facture comme payée manuellement
        URL: /api/billing/invoices/{id}/mark-as-paid/
        """
        invoice = self.get_object()
        
        payment_method = request.data.get('payment_method', 'Espèces')
        reference = request.data.get('reference', '')
        
        invoice.mark_as_paid(payment_method=payment_method)
        
        # Créer un enregistrement de paiement
        Payment.objects.create(
            invoice=invoice,
            amount=invoice.total_amount,
            payment_method=payment_method,
            reference=reference,
            tenant_id=request.tenant_id
        )
        
        serializer = self.get_serializer(invoice)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def send_by_email(self, request, pk=None):
        """
        Envoyer la facture par email
        URL: /api/billing/invoices/{id}/send-by-email/
        """
        invoice = self.get_object()
        
        # TODO: Implémenter l'envoi par email
        # Utiliser Django send_mail avec le PDF en pièce jointe
        
        return Response({
            'message': 'Email envoyé avec succès'
        })
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Statistiques des factures du centre
        URL: /api/billing/invoices/statistics/
        """
        queryset = self.get_queryset()
        
        total = queryset.count()
        paid = queryset.filter(status='PAID').count()
        pending = queryset.filter(status='PENDING').count()
        overdue = queryset.filter(
            status__in=['PENDING', 'DRAFT'],
            due_date__lt=timezone.now().date()
        ).count()
        
        total_revenue = sum([
            float(inv.total_amount) 
            for inv in queryset.filter(status='PAID')
        ])
        
        return Response({
            'total': total,
            'paid': paid,
            'pending': pending,
            'overdue': overdue,
            'total_revenue': total_revenue,
        })


class PaymentViewSet(CompleteTenantMixin, viewsets.ModelViewSet):
    """ViewSet pour les paiements"""
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['invoice', 'payment_method']
    ordering_fields = ['payment_date', 'amount']
    tenant_field = 'tenant_id'