from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Job(models.Model):
    SOURCE_CHOICES = [
        ('linkedin', 'LinkedIn'),
        ('naukri', 'Naukri'),
        ('indeed', 'Indeed'),
        ('internshala', 'Internshala'),
    ]
    title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    location = models.CharField(max_length=200, blank=True)
    salary = models.CharField(max_length=100, blank=True)
    experience = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    skills_required = models.JSONField(default=list, blank=True)
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES)
    url = models.URLField(max_length=500, blank=True)
    posted_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} at {self.company}"


class Application(models.Model):
    STATUS_CHOICES = [
        ('applied', 'Applied'),
        ('interview', 'Interview Scheduled'),
        ('offer', 'Offer'),
        ('rejected', 'Rejected'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='applied')
    notes = models.TextField(blank=True)
    applied_date = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'job')

    def __str__(self):
        return f"{self.user.username} -> {self.job.title} ({self.status})"