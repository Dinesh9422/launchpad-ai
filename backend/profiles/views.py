from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Profile
from .serializers import ProfileSerializer
from .ai_helper import generate_readiness_score

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def my_profile(request):
    profile, created = Profile.objects.get_or_create(user=request.user)

    if request.method == 'GET':
        return Response(ProfileSerializer(profile).data)

    if request.method == 'PUT':
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_readiness(request):
    profile, created = Profile.objects.get_or_create(user=request.user)

    profile_data = {
        'education': profile.education,
        'graduation_year': profile.graduation_year,
        'skills': profile.skills,
        'target_role': profile.target_role,
        'experience_years': profile.experience_years,
        'user_type': request.user.user_type,
        'domain_background': profile.domain_background,
    }

    result = generate_readiness_score(profile_data)

    profile.readiness_score = result.get('score', 0)
    profile.readiness_feedback = result
    profile.onboarding_complete = True
    profile.save()

    return Response(ProfileSerializer(profile).data)