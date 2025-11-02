# Fichier: backend/members/models.py

from django.db import models
from django.core.validators import RegexValidator
from django.utils import timezone

class Member(models.Model):
    GENDER_CHOICES = [
        ('M', 'Masculin'),
        ('F', 'Féminin'),
        ('O', 'Autre'),
    ]
    
    STATUS_CHOICES = [
        ('INACTIVE', 'Inactif'),      # ✅ Changé l'ordre (INACTIVE en premier)
        ('ACTIVE', 'Actif'),
        ('SUSPENDED', 'Suspendu'),
        ('EXPIRED', 'Expiré'),
    ]
    
    # Informations personnelles
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone_regex = RegexValidator(regex=r'^\+?[0-9]{8,17}$')
    phone = models.CharField(validators=[phone_regex], max_length=17)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    address = models.TextField(blank=True)
    
    # Informations membre
    member_id = models.CharField(max_length=20, unique=True, editable=False)
    join_date = models.DateField(auto_now_add=True)
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='INACTIVE'  # ✅ Changé de 'ACTIVE' à 'INACTIVE'
    )
    emergency_contact_name = models.CharField(max_length=100)
    emergency_contact_phone = models.CharField(max_length=17)
    
    # Informations physiques & santé
    height = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    weight = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    medical_conditions = models.TextField(blank=True)
    
    # Photo
    photo = models.ImageField(upload_to='members/photos/', null=True, blank=True)
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.member_id})"
    
    @property
    def full_name(self):
        """Propriété pour obtenir le nom complet"""
        return f"{self.first_name} {self.last_name}"
    
    @property
    def age(self):
        """Calculer l'âge du membre"""
        from datetime import date
        today = date.today()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )
    
    @property
    def has_active_subscription(self):
        """Vérifier si le membre a un abonnement actif"""
        from subscriptions.models import Subscription  # Import ici pour éviter import circulaire
        return Subscription.objects.filter(
            member=self,
            status='ACTIVE',
            end_date__gte=timezone.now().date()
        ).exists()
    
    def activate(self):
        """Activer le membre (appelé lors de la souscription d'un abonnement)"""
        if self.status != 'ACTIVE':
            self.status = 'ACTIVE'
            self.save(update_fields=['status', 'updated_at'])
    
    def deactivate(self):
        """Désactiver le membre (appelé lors de l'annulation/expiration d'abonnement)"""
        if self.status == 'ACTIVE':
            # Vérifier s'il n'y a plus d'abonnements actifs
            if not self.has_active_subscription:
                self.status = 'INACTIVE'
                self.save(update_fields=['status', 'updated_at'])
    
    def mark_as_expired(self):
        """Marquer comme expiré (abonnement expiré)"""
        if not self.has_active_subscription:
            self.status = 'EXPIRED'
            self.save(update_fields=['status', 'updated_at'])
    
    def save(self, *args, **kwargs):
        if not self.member_id:
            # Générer un ID unique (ex: MEM2025001)
            last_member = Member.objects.order_by('-id').first()
            if last_member and last_member.member_id:
                try:
                    last_id = int(last_member.member_id[7:])
                    new_id = last_id + 1
                except (ValueError, IndexError):
                    new_id = 1
            else:
                new_id = 1
            self.member_id = f"MEM{timezone.now().year}{new_id:04d}"
        super().save(*args, **kwargs)


class MemberMeasurement(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='measurements')
    date = models.DateField(auto_now_add=True)
    weight = models.DecimalField(max_digits=5, decimal_places=2)
    body_fat_percentage = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    muscle_mass = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    chest = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)
    waist = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)
    hips = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.member.full_name} - {self.date}"