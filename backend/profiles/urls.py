from django.urls import path
from . import views

urlpatterns = [
    path('me/', views.my_profile, name='my_profile'),
    path('analyze/', views.analyze_readiness, name='analyze_readiness'),
]