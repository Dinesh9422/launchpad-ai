from django.urls import path
from . import views

urlpatterns = [
    path('analyze/', views.skill_gap_view, name='skill_gap'),
    path('roadmap/', views.roadmap_view, name='roadmap'),
    path('roadmap/complete/<int:week_num>/', views.complete_week, name='complete_week'),
]