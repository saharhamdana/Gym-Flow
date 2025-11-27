# Fichier: backend/subscriptions/models.py

from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator
from members.models import Member

class SubscriptionPlan(models.Model):
    """Plans d'abonnement (Mensuel, Trimestriel, Annuel, etc.)"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    duration_days = models.PositiveIntegerField(help_text="Durée en jours")
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    is_active = models.BooleanField(default=True)
    
    # ✅ Multi-tenant
    tenant_id = models.CharField(max_length=100, verbose_name="ID du centre", db_index=True)

    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    

    class Meta:
        ordering = ['duration_days']
        verbose_name = "Plan d'abonnement"
        verbose_name_plural = "Plans d'abonnement"
        # ✅ Un plan avec le même nom peut exister dans différents centres
        unique_together = [['name', 'tenant_id']]
    
    def __str__(self):
        return f"{self.name} - {self.price} TND ({self.duration_days} jours)"


class Subscription(models.Model):
    """Abonnements des membres"""
    STATUS_CHOICES = [
        ('PENDING', 'En attente'),
        ('ACTIVE', 'Actif'),
        ('EXPIRED', 'Expiré'),
        ('CANCELLED', 'Annulé'),
    ]
    
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='subscriptions')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.PROTECT, related_name='subscriptions')
    
    start_date = models.DateField(default=timezone.now)
    end_date = models.DateField()
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    
    # Paiement
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    payment_date = models.DateTimeField(null=True, blank=True)
    payment_method = models.CharField(max_length=50, blank=True, help_text="Espèces, Carte, Virement, etc.")

    stripe_session_id = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    stripe_payment_intent_id = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    
    notes = models.TextField(blank=True)
    
    # ✅ Multi-tenant
    tenant_id = models.CharField(max_length=100, verbose_name="ID du centre", db_index=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-start_date']
        verbose_name = "Abonnement"
        verbose_name_plural = "Abonnements"
    
    def __str__(self):
        return f"{self.member.full_name} - {self.plan.name} ({self.status})"
    
    @property
    def is_active(self):
        """Vérifier si l'abonnement est actif"""
        today = timezone.now().date()
        return self.status == 'ACTIVE' and self.start_date <= today <= self.end_date
    
    @property
    def days_remaining(self):
        """Nombre de jours restants"""
        if self.status == 'ACTIVE':
            today = timezone.now().date()
            if today <= self.end_date:
                return (self.end_date - today).days
        return 0
    
    def activate(self):
        """Activer l'abonnement et le membre"""
        self.status = 'ACTIVE'
        self.payment_date = timezone.now()
        self.save(update_fields=['status', 'payment_date', 'updated_at'])
        
        # Activer le membre automatiquement
        self.member.activate()
    
    def cancel(self):
        """Annuler l'abonnement"""
        self.status = 'CANCELLED'
        self.save(update_fields=['status', 'updated_at'])
        
        # Désactiver le membre si plus d'abonnements actifs
        self.member.deactivate()
    
    def mark_as_expired(self):
        """Marquer comme expiré"""
        self.status = 'EXPIRED'
        self.save(update_fields=['status', 'updated_at'])
        
        # Marquer le membre comme expiré si plus d'abonnements actifs
        self.member.mark_as_expired()
    
    def save(self, *args, **kwargs):
        # Calculer la date de fin si pas définie
        if not self.end_date and self.plan:
            from datetime import timedelta
            self.end_date = self.start_date + timedelta(days=self.plan.duration_days)
        
        # Définir le montant payé par défaut
        if not self.amount_paid and self.plan:
            self.amount_paid = self.plan.price
        
        # ✅ Hériter le tenant_id du membre si non défini
        if not self.tenant_id and self.member:
            self.tenant_id = self.member.tenant_id
        
        super().save(*args, **kwargs)