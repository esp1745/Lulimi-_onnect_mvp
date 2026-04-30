from django.urls import path
from .views import (
    ResourceListCreateView, ResourceDetailView,
    LearnerResourceListView, PublicResourceListView,
    LessonResourceListCreateView, LessonResourceDeleteView,
    FileUploadView,
)

urlpatterns = [
    # Teacher resource management
    path('', ResourceListCreateView.as_view(), name='resource-list'),
    path('<int:pk>/', ResourceDetailView.as_view(), name='resource-detail'),

    # Learner access
    path('my/', LearnerResourceListView.as_view(), name='learner-resources'),
    path('public/', PublicResourceListView.as_view(), name='public-resources'),

    # Lesson attachments
    path('lessons/<int:booking_id>/', LessonResourceListCreateView.as_view(), name='lesson-resources'),
    path('lessons/items/<int:pk>/', LessonResourceDeleteView.as_view(), name='lesson-resource-delete'),

    # File upload
    path('upload/', FileUploadView.as_view(), name='file-upload'),
]
