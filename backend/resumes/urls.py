from django.urls import path
from . import views

urlpatterns = [
    path('me/', views.my_resume, name='my_resume'),
    path('improve-summary/', views.improve_summary_view, name='improve_summary'),
    path('ats-score/', views.ats_score_view, name='ats_score'),
    path('optimize/', views.optimize_resume_view, name='optimize_resume'),
]