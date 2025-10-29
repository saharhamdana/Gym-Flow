# Fichier: members/models.py
from django.db import models
from authentication.models import User # Importez le modèle User personnalisé
from subscriptions.models import MemberSubscription # Pour la relation

# Constantes pour le suivi de la progression
PROGRESSION_STATUS_CHOICES = [
    ('BEGINNER', 'Débutant'),
    ('INTERMEDIATE', 'Intermédiaire'),
    ('ADVANCED', 'Avancé'),
    ('PRO', 'Professionnel'),
]

class MemberProfile(models.Model):
    """
    Modèle étendant le modèle User pour stocker les informations spécifiques à l'adhérent.
    """
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        primary_key=True, 
        limit_choices_to={'role': 'MEMBER'}
    )
    
    # Informations d'adhésion
    join_date = models.DateField(auto_now_add=True)
    last_activity = models.DateTimeField(null=True, blank=True)
    
    # Suivi de performance et objectifs
    current_status = models.CharField(
        max_length=20, 
        choices=PROGRESSION_STATUS_CHOICES, 
        default='BEGINNER'
    )
    goals = models.TextField(blank=True, verbose_name="Objectifs du membre")
    
    def __str__(self):
        return f"Profil de {self.user.get_full_name()}"

class PerformanceMetric(models.Model):
    """
    Modèle pour l'historique de suivi des mensurations/performances.
    """
    member = models.ForeignKey(MemberProfile, on_delete=models.CASCADE, related_name='performance_metrics')
    
    # Métriques physiques
    date = models.DateField()
    weight_kg = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    height_cm = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    body_fat_percentage = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    
    # Autres métriques (par exemple, objectifs de levage, endurance)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-date']
        unique_together = ('member', 'date')
        
    def __str__(self):
        return f"Métriques du {self.date} pour {self.member.user.get_full_name()}"