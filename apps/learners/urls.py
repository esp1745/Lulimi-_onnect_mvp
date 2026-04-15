from django.urls import path
from .views import LearnerProfileView

urlpatterns = [
    path('profile/', LearnerProfileView.as_view(), name='learner-profile'),
]
