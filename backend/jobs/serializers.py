from rest_framework import serializers
from .models import Job, Application

class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = ['id', 'title', 'company', 'location', 'salary', 'experience',
                  'description', 'skills_required', 'source', 'url', 'posted_date']

class ApplicationSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)
    job_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Application
        fields = ['id', 'job', 'job_id', 'status', 'notes', 'applied_date', 'updated_at']