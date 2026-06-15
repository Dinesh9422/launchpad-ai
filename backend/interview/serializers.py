from rest_framework import serializers
from .models import Question, MockSession

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'role', 'company', 'question_text', 'answer_hint',
                  'question_type', 'difficulty', 'created_at']

class MockSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MockSession
        fields = ['id', 'role', 'company', 'questions', 'answers', 'scores',
                  'total_score', 'completed', 'created_at']