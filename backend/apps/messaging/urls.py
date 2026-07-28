from django.urls import path
from .views import ThreadListView, ThreadDetailView, MarkThreadReadView

urlpatterns = [
    path('threads/', ThreadListView.as_view(), name='thread-list'),
    path('threads/<int:user_id>/', ThreadDetailView.as_view(), name='thread-detail'),
    path('threads/<int:user_id>/read/', MarkThreadReadView.as_view(), name='thread-read'),
]
