from django.urls import path
from . import views

urlpatterns = [
    path('search/', views.search_jobs, name='search_jobs'),
    path('applications/', views.applications, name='applications'),
    path('applications/<int:app_id>/', views.application_detail, name='application_detail'),
]