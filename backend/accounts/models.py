from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    USER_TYPE_CHOICES = [
        ('fresher', 'Fresher'),
        ('experienced', 'Experienced'),
        ('switcher', 'Non-IT to IT Switcher'),
    ]
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='fresher')
    phone = models.CharField(max_length=15, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email