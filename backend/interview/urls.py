from django.urls import path
from . import views

urlpatterns = [
    path('questions/', views.questions_view, name='questions'),
    path('session/start/', views.start_mock_session, name='start_session'),
    path('session/<int:session_id>/answer/', views.submit_answer, name='submit_answer'),
    path('sessions/', views.my_sessions, name='my_sessions'),
]