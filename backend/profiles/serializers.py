from rest_framework import serializers
from .models import Profile

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = [
            'id', 'full_name', 'education', 'graduation_year', 'skills',
            'target_role', 'experience_years', 'work_style', 'domain_background',
            'readiness_score', 'readiness_feedback', 'onboarding_complete',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['readiness_score', 'readiness_feedback']