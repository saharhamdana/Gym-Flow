
from django.db import models
from django.conf import settings 
# Assurez-vous d'importer le modèle User si vous ne l'avez pas fait via settings.AUTH_USER_MODEL

class ProgrammeEntrainement(models.Model):
    # Coach qui a créé le programme
    coach = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='programmes_crees')
    # Placeholder pour le membre. Ce champ sera lié à un modèle Membre réel plus tard.
    membre_id = models.IntegerField(help_text="ID du membre ciblé par ce programme.")
    
    titre = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    date_debut = models.DateField()
    date_fin = models.DateField()
    date_creation = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.titre} pour Membre ID {self.membre_id}"

class FicheSuivi(models.Model):
    # Fiche liée à un programme spécifique
    programme = models.ForeignKey(ProgrammeEntrainement, on_delete=models.CASCADE, related_name='suivis')
    date_enregistrement = models.DateField(auto_now_add=True)
    poids = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    mensuration_bras = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True)
    
    def __str__(self):
        return f"Suivi du {self.date_enregistrement} pour {self.programme.titre}"