# backend/coaching/models.py

from django.db import models
from django.contrib.auth import get_user_model
from members.models import Member

User = get_user_model()

class ExerciseCategory(models.Model):
    """Catégories d'exercices (Cardio, Musculation, Étirement, etc.)"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Exercise Categories"
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Exercise(models.Model):
    """Bibliothèque d'exercices"""
    DIFFICULTY_CHOICES = [
        ('beginner', 'Débutant'),
        ('intermediate', 'Intermédiaire'),
        ('advanced', 'Avancé'),
    ]
    
    name = models.CharField(max_length=200)
    description = models.TextField()
    category = models.ForeignKey(ExerciseCategory, on_delete=models.SET_NULL, null=True, related_name='exercises')
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='beginner')
    equipment_needed = models.CharField(max_length=200, blank=True, help_text="Équipement nécessaire")
    video_url = models.URLField(blank=True, null=True, help_text="Lien vers vidéo de démonstration")
    image = models.ImageField(upload_to='exercises/', blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_exercises')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name


class TrainingProgram(models.Model):
    """Programme d'entraînement personnalisé"""
    STATUS_CHOICES = [
        ('draft', 'Brouillon'),
        ('active', 'Actif'),
        ('completed', 'Terminé'),
        ('archived', 'Archivé'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    # ✅ CORRECTION : Utiliser Member au lieu de User
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='training_programs')
    coach = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='coached_programs')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    start_date = models.DateField()
    end_date = models.DateField()
    duration_weeks = models.IntegerField(help_text="Durée en semaines")
    
    # Objectifs
    goal = models.TextField(help_text="Objectif principal du programme")
    target_weight = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    target_body_fat = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    
    # Notes
    notes = models.TextField(blank=True, help_text="Notes du coach")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.member.full_name}"


class WorkoutSession(models.Model):
    """Session d'entraînement dans un programme"""
    DAY_CHOICES = [
        (1, 'Lundi'),
        (2, 'Mardi'),
        (3, 'Mercredi'),
        (4, 'Jeudi'),
        (5, 'Vendredi'),
        (6, 'Samedi'),
        (7, 'Dimanche'),
    ]
    
    program = models.ForeignKey(TrainingProgram, on_delete=models.CASCADE, related_name='workout_sessions')
    title = models.CharField(max_length=200)
    day_of_week = models.IntegerField(choices=DAY_CHOICES)
    week_number = models.IntegerField(default=1, help_text="Semaine du programme")
    duration_minutes = models.IntegerField(default=60)
    notes = models.TextField(blank=True)
    order = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['week_number', 'day_of_week', 'order']
    
    def __str__(self):
        return f"{self.program.title} - Semaine {self.week_number} - {self.get_day_of_week_display()}"


class WorkoutExercise(models.Model):
    """Exercice dans une session avec sets/reps"""
    workout_session = models.ForeignKey(WorkoutSession, on_delete=models.CASCADE, related_name='exercises')
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    
    sets = models.IntegerField(default=3)
    reps = models.CharField(max_length=50, help_text="Nombre de répétitions (ex: 10-12, 30s)")
    rest_seconds = models.IntegerField(default=60, help_text="Repos entre séries en secondes")
    weight = models.CharField(max_length=50, blank=True, help_text="Poids recommandé (ex: 20kg, bodyweight)")
    
    notes = models.TextField(blank=True, help_text="Instructions spécifiques")
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.exercise.name} - {self.sets}x{self.reps}"


class ProgressTracking(models.Model):
    """Suivi de la progression du membre"""
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='progress_trackings')
    program = models.ForeignKey(TrainingProgram, on_delete=models.CASCADE, related_name='progress_trackings', null=True, blank=True)
    
    date = models.DateField()
    weight = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    body_fat_percentage = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    
    # Mensurations (en cm)
    chest = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True, verbose_name="Tour de poitrine")
    waist = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True, verbose_name="Tour de taille")
    hips = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True, verbose_name="Tour de hanches")
    arms = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True, verbose_name="Tour de bras")
    thighs = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True, verbose_name="Tour de cuisses")
    
    # Photos de progression
    front_photo = models.ImageField(upload_to='progress/', blank=True, null=True)
    side_photo = models.ImageField(upload_to='progress/', blank=True, null=True)
    back_photo = models.ImageField(upload_to='progress/', blank=True, null=True)
    
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date']
        verbose_name_plural = "Progress Trackings"
    
    def __str__(self):
        return f"{self.member.full_name} - {self.date}"


class WorkoutLog(models.Model):
    """Journal d'entraînement - enregistrement des séances réalisées"""
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='workout_logs')
    workout_session = models.ForeignKey(WorkoutSession, on_delete=models.SET_NULL, null=True, blank=True)
    
    date = models.DateTimeField()
    duration_minutes = models.IntegerField()
    notes = models.TextField(blank=True)
    feeling = models.CharField(max_length=20, choices=[
        ('excellent', 'Excellent'),
        ('good', 'Bon'),
        ('average', 'Moyen'),
        ('tired', 'Fatigué'),
        ('poor', 'Difficile'),
    ], blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.member.full_name} - {self.date.strftime('%d/%m/%Y')}"


class WorkoutLogExercise(models.Model):
    """Détails des exercices effectués dans une séance"""
    workout_log = models.ForeignKey(WorkoutLog, on_delete=models.CASCADE, related_name='exercises')
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    
    sets_completed = models.IntegerField()
    reps_completed = models.CharField(max_length=50)
    weight_used = models.CharField(max_length=50, blank=True)
    notes = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.exercise.name} - {self.sets_completed}x{self.reps_completed}"