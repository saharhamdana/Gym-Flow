# bookings/models.py

from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone
from authentication.models import User
from members.models import Member

class Room(models.Model):
    """Salles de sport"""
    name = models.CharField(max_length=100, verbose_name="Nom de la salle")
    capacity = models.PositiveIntegerField(validators=[MinValueValidator(1)], verbose_name="Capacité")
    description = models.TextField(blank=True, verbose_name="Description")
    is_active = models.BooleanField(default=True, verbose_name="Active")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = "Salle"
        verbose_name_plural = "Salles"

    def __str__(self):
        return f"{self.name} (Capacité: {self.capacity})"


class CourseType(models.Model):
    """Types de cours (Yoga, Musculation, Cardio, etc.)"""
    name = models.CharField(max_length=100, unique=True, verbose_name="Nom du type")
    description = models.TextField(blank=True, verbose_name="Description")
    color = models.CharField(max_length=7, default="#3B82F6", verbose_name="Couleur (hex)")
    duration_minutes = models.PositiveIntegerField(default=60, verbose_name="Durée par défaut (min)")
    is_active = models.BooleanField(default=True, verbose_name="Actif")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = "Type de cours"
        verbose_name_plural = "Types de cours"

    def __str__(self):
        return self.name


class Course(models.Model):
    """Cours planifiés"""
    STATUS_CHOICES = [
        ('SCHEDULED', 'Planifié'),
        ('ONGOING', 'En cours'),
        ('COMPLETED', 'Terminé'),
        ('CANCELLED', 'Annulé'),
    ]

    course_type = models.ForeignKey(CourseType, on_delete=models.CASCADE, related_name='courses', verbose_name="Type de cours")
    coach = models.ForeignKey(User, on_delete=models.CASCADE, related_name='courses_taught', limit_choices_to={'role__in': ['COACH', 'ADMIN']}, verbose_name="Coach")
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='courses', verbose_name="Salle")
    
    title = models.CharField(max_length=200, verbose_name="Titre du cours")
    description = models.TextField(blank=True, verbose_name="Description")
    
    date = models.DateField(verbose_name="Date")
    start_time = models.TimeField(verbose_name="Heure de début")
    end_time = models.TimeField(verbose_name="Heure de fin")
    
    max_participants = models.PositiveIntegerField(validators=[MinValueValidator(1)], verbose_name="Nombre max de participants")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SCHEDULED', verbose_name="Statut")
    
    notes = models.TextField(blank=True, verbose_name="Notes")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-start_time']
        verbose_name = "Cours"
        verbose_name_plural = "Cours"
        # Contrainte : Un coach ne peut pas avoir 2 cours en même temps
        unique_together = [['coach', 'date', 'start_time']]

    def __str__(self):
        return f"{self.title} - {self.date} {self.start_time}"

    @property
    def is_full(self):
        """Vérifier si le cours est complet"""
        return self.bookings.filter(status='CONFIRMED').count() >= self.max_participants

    @property
    def available_spots(self):
        """Nombre de places disponibles"""
        confirmed_count = self.bookings.filter(status='CONFIRMED').count()
        return self.max_participants - confirmed_count

    @property
    def is_past(self):
        """Vérifier si le cours est passé"""
        from datetime import datetime
        course_datetime = datetime.combine(self.date, self.start_time)
        return timezone.now() > timezone.make_aware(course_datetime)


class Booking(models.Model):
    """Réservations de cours par les membres"""
    STATUS_CHOICES = [
        ('PENDING', 'En attente'),
        ('CONFIRMED', 'Confirmé'),
        ('CANCELLED', 'Annulé'),
        ('COMPLETED', 'Complété'),
        ('NO_SHOW', 'Absent'),
    ]

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='bookings', verbose_name="Cours")
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='bookings', verbose_name="Membre")
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='CONFIRMED', verbose_name="Statut")
    booking_date = models.DateTimeField(auto_now_add=True, verbose_name="Date de réservation")
    
    notes = models.TextField(blank=True, verbose_name="Notes")
    
    # Check-in (présence)
    checked_in = models.BooleanField(default=False, verbose_name="Présent")
    check_in_time = models.DateTimeField(null=True, blank=True, verbose_name="Heure d'arrivée")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-booking_date']
        verbose_name = "Réservation"
        verbose_name_plural = "Réservations"
        # Un membre ne peut réserver qu'une fois le même cours
        unique_together = [['course', 'member']]

    def __str__(self):
        return f"{self.member.full_name} - {self.course.title}"

    def cancel(self):
        """Annuler la réservation"""
        self.status = 'CANCELLED'
        self.save()

    def check_in(self):
        """Marquer comme présent"""
        self.checked_in = True
        self.check_in_time = timezone.now()
        self.status = 'COMPLETED'
        self.save()