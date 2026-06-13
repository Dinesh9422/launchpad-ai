from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Resume
from .serializers import ResumeSerializer
from .ai_helper import improve_summary, calculate_ats_score, optimize_resume_for_job


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def my_resume(request):
    resume, created = Resume.objects.get_or_create(user=request.user)

    if request.method == 'GET':
        return Response(ResumeSerializer(resume).data)

    if request.method == 'PUT':
        serializer = ResumeSerializer(resume, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def improve_summary_view(request):
    resume, created = Resume.objects.get_or_create(user=request.user)
    target_role = request.data.get('target_role', 'Software Developer')

    new_summary = improve_summary(resume.summary, target_role, resume.skills)
    return Response({'summary': new_summary})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ats_score_view(request):
    resume, created = Resume.objects.get_or_create(user=request.user)
    job_description = request.data.get('job_description', '')

    if not job_description:
        return Response({'error': 'job_description is required'}, status=status.HTTP_400_BAD_REQUEST)

    resume_data = ResumeSerializer(resume).data
    result = calculate_ats_score(resume_data, job_description)

    resume.ats_score = result.get('match_percentage', 0)
    resume.ats_feedback = result
    resume.save()

    return Response(ResumeSerializer(resume).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def optimize_resume_view(request):
    resume, created = Resume.objects.get_or_create(user=request.user)
    job_description = request.data.get('job_description', '')

    if not job_description:
        return Response({'error': 'job_description is required'}, status=status.HTTP_400_BAD_REQUEST)

    resume_data = ResumeSerializer(resume).data
    result = optimize_resume_for_job(resume_data, job_description)

    return Response(result)