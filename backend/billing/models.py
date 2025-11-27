# backend/billing/models.py - VERSION CORRIGÉE

from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator
from members.models import Member
from subscriptions.models import Subscription

class Invoice(models.Model):
    """Factures générées pour les paiements"""
    
    STATUS_CHOICES = [
        ('DRAFT', 'Brouillon'),
        ('PAID', 'Payée'),
        ('PENDING', 'En attente'),
        ('CANCELLED', 'Annulée'),
        ('REFUNDED', 'Remboursée'),
    ]
    
    # Identification
    invoice_number = models.CharField(max_length=50, unique=True, editable=False)
    
    # Relations - ✅ CORRECTION: ForeignKey au lieu de OneToOneField
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='invoices')
    subscription = models.ForeignKey(  # ✅ CHANGÉ
        Subscription, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='invoices'  # ✅ CHANGÉ
    )
    
    # Détails financiers
    amount = models.DecimalField(max_digits=10, decimal_places=3, validators=[MinValueValidator(0)])
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=19)  # TVA en %
    tax_amount = models.DecimalField(max_digits=10, decimal_places=3, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=3)
    
    # Statut et dates
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    issue_date = models.DateField(default=timezone.now)
    due_date = models.DateField()
    payment_date = models.DateTimeField(null=True, blank=True)
    
    # Méthode de paiement
    payment_method = models.CharField(max_length=50, blank=True)
    stripe_payment_intent_id = models.CharField(max_length=255, blank=True)
    
    # Données légales (pour le PDF)
    company_name = models.CharField(max_length=255, default="GymFlow")
    company_address = models.TextField(default="Tunis, Tunisie")
    company_tax_id = models.CharField(max_length=50, blank=True)
    
    # Client (snapshot au moment de la facture)
    customer_name = models.CharField(max_length=255)
    customer_email = models.EmailField()
    customer_address = models.TextField(blank=True)
    
    # Lignes de facture (JSON pour flexibilité)
    line_items = models.JSONField(default=list)
    
    # Notes
    notes = models.TextField(blank=True)
    
    # PDF généré
    pdf_file = models.FileField(upload_to='invoices/pdfs/', null=True, blank=True)
    
    # Multi-tenant
    tenant_id = models.CharField(max_length=100, db_index=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-issue_date', '-created_at']
        verbose_name = 'Facture'
        verbose_name_plural = 'Factures'
        indexes = [
            models.Index(fields=['tenant_id', 'status']),
            models.Index(fields=['member', 'status']),
            models.Index(fields=['subscription', 'status']),  # ✅ Nouvel index
        ]
    
    def __str__(self):
        return f"{self.invoice_number} - {self.customer_name} - {self.total_amount} TND"
    
    def save(self, *args, **kwargs):
        # Générer le numéro de facture si nouveau
        if not self.invoice_number:
            self.invoice_number = self._generate_invoice_number()
        
        # Calculer la TVA et le total
        self.tax_amount = (self.amount * self.tax_rate) / 100
        self.total_amount = self.amount + self.tax_amount
        
        # Définir la date d'échéance (30 jours par défaut)
        if not self.due_date:
            from datetime import timedelta
            self.due_date = self.issue_date + timedelta(days=30)
        
        super().save(*args, **kwargs)
    
    def _generate_invoice_number(self):
        """Générer un numéro de facture unique"""
        year = timezone.now().year
        
        # Compter les factures de l'année pour ce tenant
        last_invoice = Invoice.objects.filter(
            invoice_number__startswith=f'FAC-{year}',
            tenant_id=self.tenant_id
        ).order_by('-invoice_number').first()
        
        if last_invoice:
            try:
                last_num = int(last_invoice.invoice_number.split('-')[-1])
                new_num = last_num + 1
            except (ValueError, IndexError):
                new_num = 1
        else:
            new_num = 1
        
        return f"FAC-{year}-{new_num:05d}"
    
    def mark_as_paid(self, payment_method='', payment_intent_id=''):
        """Marquer la facture comme payée"""
        self.status = 'PAID'
        self.payment_date = timezone.now()
        self.payment_method = payment_method
        self.stripe_payment_intent_id = payment_intent_id
        self.save(update_fields=['status', 'payment_date', 'payment_method', 'stripe_payment_intent_id', 'updated_at'])
    
    @property
    def is_overdue(self):
        """Vérifier si la facture est en retard"""
        if self.status == 'PAID':
            return False
        return timezone.now().date() > self.due_date
        
class Payment(models.Model):
    """Enregistrement des paiements reçus"""
    
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=3, validators=[MinValueValidator(0)])
    payment_date = models.DateTimeField(default=timezone.now)
    payment_method = models.CharField(max_length=50)
    reference = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    
    tenant_id = models.CharField(max_length=100, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-payment_date']
        verbose_name = 'Paiement'
        verbose_name_plural = 'Paiements'
    
    def __str__(self):
        return f"Paiement {self.amount} TND - {self.invoice.invoice_number}"