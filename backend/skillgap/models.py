from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class SkillGap(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='skillgap')
    target_role = models.CharField(max_length=100, blank=True)
    current_skills = models.JSONField(default=list)
    gap_analysis = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s skill gap"


class Roadmap(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='roadmap')
    target_role = models.CharField(max_length=100, blank=True)
    weeks = models.JSONField(default=list)
    current_week = models.IntegerField(default=1)
    completion_percentage = models.IntegerField(default=0)
    streak = models.IntegerField(default=0)
    last_activity = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s roadmap"