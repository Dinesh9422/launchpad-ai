from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=100, blank=True)
    education = models.CharField(max_length=200, blank=True)
    graduation_year = models.IntegerField(null=True, blank=True)
    skills = models.JSONField(default=list, blank=True)
    target_role = models.CharField(max_length=100, blank=True)
    experience_years = models.IntegerField(default=0)
    work_style = models.JSONField(default=dict, blank=True)
    domain_background = models.CharField(max_length=100, blank=True)
    readiness_score = models.IntegerField(default=0)
    readiness_feedback = models.JSONField(default=dict, blank=True)
    onboarding_complete = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s profile"