from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Avg, Count
from .models import MarketData
from .serializers import MarketDataSerializer
from jobs.models import Job, Application
from profiles.models import Profile


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def market_overview(request):
    # Top roles by demand
    top_roles = MarketData.objects.values('role').annotate(
        avg_demand=Avg('demand_score')
    ).order_by('-avg_demand')[:8]

    # Top cities by job count
    top_cities = Job.objects.values('location').annotate(
        job_count=Count('id')
    ).order_by('-job_count')[:6]

    # Most in-demand skills from jobs
    all_skills = {}
    for job in Job.objects.all():
        for skill in job.skills_required:
            all_skills[skill] = all_skills.get(skill, 0) + 1
    top_skills = sorted(all_skills.items(), key=lambda x: x[1], reverse=True)[:10]

    # Source distribution
    source_data = Job.objects.values('source').annotate(count=Count('id'))

    return Response({
        'top_roles': list(top_roles),
        'top_cities': list(top_cities),
        'top_skills': [{'skill': s[0], 'count': s[1]} for s in top_skills],
        'source_distribution': list(source_data),
        'total_jobs': Job.objects.count(),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def salary_intelligence(request):
    role = request.GET.get('role', '')
    city = request.GET.get('city', '')

    queryset = MarketData.objects.all()
    if role:
        queryset = queryset.filter(role__icontains=role)
    if city:
        queryset = queryset.filter(city__icontains=city)

    return Response(MarketDataSerializer(queryset, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def peer_benchmarking(request):
    try:
        user_profile = Profile.objects.get(user=request.user)
        target_role = user_profile.target_role
        user_skills = user_profile.skills
        user_score = user_profile.readiness_score
    except Profile.DoesNotExist:
        return Response({'error': 'Profile not found'})

    # Compare with all users targeting same role
    peers = Profile.objects.filter(
        target_role__icontains=target_role
    ).exclude(user=request.user)

    total_peers = peers.count()
    if total_peers == 0:
        return Response({
            'message': 'No peers found for your target role yet',
            'your_score': user_score,
            'target_role': target_role,
        })

    better_than = peers.filter(readiness_score__lt=user_score).count()
    percentile = int((better_than / total_peers) * 100) if total_peers > 0 else 50

    avg_score = peers.aggregate(avg=Avg('readiness_score'))['avg'] or 0

    return Response({
        'target_role': target_role,
        'your_score': user_score,
        'avg_peer_score': round(avg_score),
        'percentile': percentile,
        'total_peers': total_peers,
        'your_skills': user_skills,
        'message': f"You're in the top {100 - percentile}% among {target_role} applicants!"
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_stats(request):
    applications = Application.objects.filter(user=request.user)
    total = applications.count()
    interview_count = applications.filter(status='interview').count()
    offer_count = applications.filter(status='offer').count()
    rejected_count = applications.filter(status='rejected').count()

    from interview.models import MockSession
    sessions = MockSession.objects.filter(user=request.user)
    avg_interview_score = sessions.aggregate(avg=Avg('total_score'))['avg'] or 0

    return Response({
        'total_applications': total,
        'interview_rate': round((interview_count / total * 100) if total > 0 else 0),
        'offer_rate': round((offer_count / total * 100) if total > 0 else 0),
        'rejected_count': rejected_count,
        'avg_mock_interview_score': round(avg_interview_score, 1),
        'total_mock_sessions': sessions.count(),
    })