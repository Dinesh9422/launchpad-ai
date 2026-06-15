from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Question(models.Model):
    TYPE_CHOICES = [
        ('technical', 'Technical'),
        ('hr', 'HR'),
        ('behavioral', 'Behavioral'),
    ]
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]
    role = models.CharField(max_length=100)
    company = models.CharField(max_length=100, blank=True)
    question_text = models.TextField()
    answer_hint = models.TextField(blank=True)
    question_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='technical')
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.role} — {self.question_text[:50]}"


class MockSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mock_sessions')
    role = models.CharField(max_length=100)
    company = models.CharField(max_length=100, blank=True)
    questions = models.JSONField(default=list)
    answers = models.JSONField(default=list)
    scores = models.JSONField(default=list)
    total_score = models.IntegerField(default=0)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} — {self.role} mock interview"