from django.urls import path
from .views import LearnerProfileView, LearnerDashboardView

urlpatterns = [
    path('profile/', LearnerProfileView.as_view(), name='learner-profile'),
    path('dashboard/', LearnerDashboardView.as_view(), name='learner-dashboard'),
]
