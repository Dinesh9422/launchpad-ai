from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from .models import Job, Application
from .serializers import JobSerializer, ApplicationSerializer


class JobPagination(PageNumberPagination):
    page_size = 10


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_jobs(request):
    queryset = Job.objects.all().order_by('-posted_date')

    q = request.GET.get('q', '')
    location = request.GET.get('location', '')
    source = request.GET.get('source', '')
    experience = request.GET.get('experience', '')

    if q:
        queryset = queryset.filter(
            Q(title__icontains=q) | Q(skills_required__icontains=q)
        )
    if location:
        queryset = queryset.filter(location__icontains=location)
    if source:
        queryset = queryset.filter(source=source)
    if experience:
        queryset = queryset.filter(experience__icontains=experience)

    total_count = queryset.count()

    paginator = JobPagination()
    page = paginator.paginate_queryset(queryset, request)
    serializer = JobSerializer(page, many=True)

    return paginator.get_paginated_response({
        'total_count': total_count,
        'jobs': serializer.data
    })


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def applications(request):
    if request.method == 'GET':
        apps = Application.objects.filter(user=request.user).order_by('-applied_date')
        return Response(ApplicationSerializer(apps, many=True).data)

    if request.method == 'POST':
        job_id = request.data.get('job_id')
        try:
            job = Job.objects.get(id=job_id)
        except Job.DoesNotExist:
            return Response({'error': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)

        app, created = Application.objects.get_or_create(
            user=request.user, job=job,
            defaults={'status': 'applied'}
        )
        if not created:
            return Response({'message': 'Already applied'}, status=status.HTTP_200_OK)

        return Response(ApplicationSerializer(app).data, status=status.HTTP_201_CREATED)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def application_detail(request, app_id):
    try:
        app = Application.objects.get(id=app_id, user=request.user)
    except Application.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        app.status = request.data.get('status', app.status)
        app.notes = request.data.get('notes', app.notes)
        app.save()
        return Response(ApplicationSerializer(app).data)

    if request.method == 'DELETE':
        app.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)