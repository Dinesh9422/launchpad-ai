from rest_framework import serializers
from .models import SkillGap, Roadmap

class SkillGapSerializer(serializers.ModelSerializer):
    class Meta:
        model = SkillGap
        fields = ['id', 'target_role', 'current_skills', 'gap_analysis', 'created_at', 'updated_at']

class RoadmapSerializer(serializers.ModelSerializer):
    class Meta:
        model = Roadmap
        fields = ['id', 'target_role', 'weeks', 'current_week', 'completion_percentage', 'streak', 'last_activity', 'created_at', 'updated_at']