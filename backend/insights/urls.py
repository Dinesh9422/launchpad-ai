from django.urls import path
from . import views

urlpatterns = [
    path('market/', views.market_overview, name='market_overview'),
    path('salary/', views.salary_intelligence, name='salary_intelligence'),
    path('benchmarking/', views.peer_benchmarking, name='peer_benchmarking'),
    path('stats/', views.user_stats, name='user_stats'),
]