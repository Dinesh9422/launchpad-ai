from rest_framework import serializers
from .models import MarketData

class MarketDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketData
        fields = ['id', 'role', 'city', 'avg_salary', 'min_salary', 'max_salary',
                  'demand_score', 'top_skills', 'hiring_companies', 'updated_at']