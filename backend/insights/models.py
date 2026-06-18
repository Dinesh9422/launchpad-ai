from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class MarketData(models.Model):
    role = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    avg_salary = models.IntegerField(default=0)
    min_salary = models.IntegerField(default=0)
    max_salary = models.IntegerField(default=0)
    demand_score = models.IntegerField(default=0)
    top_skills = models.JSONField(default=list)
    hiring_companies = models.JSONField(default=list)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.role} — {self.city}"