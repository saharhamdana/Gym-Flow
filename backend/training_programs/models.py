from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class TrainingProgram(models.Model):
    """
    Represents a training program assigned to a member.
    """
    member = models.ForeignKey(User, on_delete=models.CASCADE, related_name='training_programs')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField()

    def __str__(self):
        return f"{self.name} for {self.member.email}"

class Exercise(models.Model):
    """
    Represents a single exercise within a training program.
    """
    program = models.ForeignKey(TrainingProgram, on_delete=models.CASCADE, related_name='exercises')
    name = models.CharField(max_length=100)
    sets = models.PositiveIntegerField()
    reps = models.CharField(max_length=50)  # e.g., "10-12" or "8"
    rest_period = models.CharField(max_length=50, blank=True, null=True)  # e.g., "60s"

    def __str__(self):
        return self.name
