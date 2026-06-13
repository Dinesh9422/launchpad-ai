from rest_framework import serializers
from .models import Resume

class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = [
            'id', 'full_name', 'email', 'phone', 'location', 'summary',
            'education', 'experience', 'projects', 'skills',
            'ats_score', 'ats_feedback', 'created_at', 'updated_at'
        ]
        read_only_fields = ['ats_score', 'ats_feedback']