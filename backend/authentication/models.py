# backend/authentication/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    """
    Modèle utilisateur personnalisé avec rôles
    IMPORTANT: Le nom de la classe doit être 'User' exactement
    """
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', _('Administrateur')
        COACH = 'COACH', _('Coach Sportif')
        RECEPTIONIST = 'RECEPTIONIST', _('Réceptionniste')
        MEMBER = 'MEMBER', _('Membre')
    
    # Champs de base
    email = models.EmailField(_('email address'), unique=True)
    phone = models.CharField(_('téléphone'), max_length=20, blank=True)
    role = models.CharField(
        _('rôle'),
        max_length=20,
        choices=Role.choices,
        default=Role.MEMBER
    )
    
    # Photo de profil
    profile_picture = models.ImageField(
        _('photo de profil'), 
        upload_to='profiles/', 
        blank=True, 
        null=True
    )
    
    # Informations supplémentaires
    date_of_birth = models.DateField(_('date de naissance'), null=True, blank=True)
    address = models.TextField(_('adresse'), blank=True)
    
    # Multi-tenant (optionnel)
    tenant_id = models.CharField(_('ID du centre'), max_length=100, blank=True)
    
    # Métadonnées
    created_at = models.DateTimeField(_('créé le'), auto_now_add=True)
    updated_at = models.DateTimeField(_('modifié le'), auto_now=True)
    
    # Configuration
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    class Meta:
        verbose_name = _('utilisateur')
        verbose_name_plural = _('utilisateurs')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.get_role_display()})"
    
    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN
    
    @property
    def is_coach(self):
        return self.role == self.Role.COACH
    
    @property
    def is_receptionist(self):
        return self.role == self.Role.RECEPTIONIST
    
    @property
    def is_member(self):
        return self.role == self.Role.MEMBER


class GymCenter(models.Model):
    """
    Modèle pour les centres de fitness/salles de sport
    """
    name = models.CharField(_('nom'), max_length=200)
    description = models.TextField(_('description'), blank=True)
    
    # Contact
    email = models.EmailField(_('email'))
    phone = models.CharField(_('téléphone'), max_length=20)
    address = models.TextField(_('adresse'))
    
    # Owner - IMPORTANT: utiliser 'authentication.User' comme string
    owner = models.ForeignKey(
        'authentication.User',  # String reference au lieu de User directement
        on_delete=models.CASCADE,
        related_name='owned_centers',
        limit_choices_to={'role': 'ADMIN'}
    )
    
    # Configuration
    logo = models.ImageField(_('logo'), upload_to='centers/logos/', blank=True, null=True)
    tenant_id = models.CharField(_('tenant ID'), max_length=100, unique=True)
    
    # Métadonnées
    is_active = models.BooleanField(_('actif'), default=True)
    created_at = models.DateTimeField(_('créé le'), auto_now_add=True)
    updated_at = models.DateTimeField(_('modifié le'), auto_now=True)
    
    class Meta:
        verbose_name = _('centre de fitness')
        verbose_name_plural = _('centres de fitness')
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name