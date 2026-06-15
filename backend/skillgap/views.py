from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from .models import SkillGap, Roadmap
from .serializers import SkillGapSerializer, RoadmapSerializer
from .ai_helper import analyze_skill_gap, generate_roadmap


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def skill_gap_view(request):
    gap, created = SkillGap.objects.get_or_create(user=request.user)

    if request.method == 'GET':
        return Response(SkillGapSerializer(gap).data)

    if request.method == 'POST':
        target_role = request.data.get('target_role', '')
        current_skills = request.data.get('current_skills', [])

        result = analyze_skill_gap(current_skills, target_role)

        gap.target_role = target_role
        gap.current_skills = current_skills
        gap.gap_analysis = result
        gap.save()

        return Response(SkillGapSerializer(gap).data)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def roadmap_view(request):
    roadmap, created = Roadmap.objects.get_or_create(user=request.user)

    if request.method == 'GET':
        return Response(RoadmapSerializer(roadmap).data)

    if request.method == 'POST':
        target_role = request.data.get('target_role', '')
        current_skills = request.data.get('current_skills', [])
        missing_skills = request.data.get('missing_skills', [])

        result = generate_roadmap(current_skills, target_role, missing_skills)

        roadmap.target_role = target_role
        roadmap.weeks = result.get('weeks', [])
        roadmap.current_week = 1
        roadmap.completion_percentage = 0
        roadmap.save()

        return Response(RoadmapSerializer(roadmap).data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def complete_week(request, week_num):
    try:
        roadmap = Roadmap.objects.get(user=request.user)
    except Roadmap.DoesNotExist:
        return Response({'error': 'Roadmap not found'}, status=status.HTTP_404_NOT_FOUND)

    weeks = roadmap.weeks
    for week in weeks:
        if week['week'] == week_num:
            week['completed'] = True
            break

    completed = sum(1 for w in weeks if w.get('completed', False))
    roadmap.weeks = weeks
    roadmap.current_week = week_num + 1
    roadmap.completion_percentage = int((completed / len(weeks)) * 100) if weeks else 0

    today = timezone.now().date()
    if roadmap.last_activity == today:
        pass
    else:
        roadmap.streak += 1
        roadmap.last_activity = today

    roadmap.save()
    return Response(RoadmapSerializer(roadmap).data)