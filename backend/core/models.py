from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('coach', 'Coach'),
        ('member', 'Member'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')

    def __str__(self):
        return self.username
