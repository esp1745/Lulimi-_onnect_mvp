from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Resource, LessonResource
from .serializers import ResourceSerializer, LessonResourceSerializer
from apps.teachers.models import Teacher
from apps.bookings.models import Booking


class IsTeacher(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'teacher'


class ResourceListCreateView(generics.ListCreateAPIView):
    """Teacher manages their resources."""
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def get_queryset(self):
        return Resource.objects.filter(teacher__user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        teacher = get_object_or_404(Teacher, user=self.request.user)
        serializer.save(teacher=teacher)


class ResourceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Teacher views/edits/deletes a resource."""
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def get_queryset(self):
        return Resource.objects.filter(teacher__user=self.request.user)


class LearnerResourceListView(generics.ListAPIView):
    """Learner views resources shared with them via bookings."""
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Resource.objects.filter(
            lesson_attachments__booking__learner=self.request.user,
            visibility='student_shared',
        ).distinct()


class PublicResourceListView(generics.ListAPIView):
    """Public resources visible to anyone."""
    serializer_class = ResourceSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Resource.objects.filter(visibility='public')
        language = self.request.query_params.get('language')
        if language:
            qs = qs.filter(language_name__icontains=language)
        return qs


class LessonResourceListCreateView(generics.ListCreateAPIView):
    """Teacher attaches resources to a lesson/booking."""
    serializer_class = LessonResourceSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def get_queryset(self):
        booking_id = self.kwargs['booking_id']
        return LessonResource.objects.filter(
            booking_id=booking_id,
            booking__teacher__user=self.request.user,
        )

    def perform_create(self, serializer):
        booking_id = self.kwargs['booking_id']
        booking = get_object_or_404(Booking, pk=booking_id, teacher__user=self.request.user)
        serializer.save(booking=booking)


class LessonResourceDeleteView(generics.DestroyAPIView):
    serializer_class = LessonResourceSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def get_queryset(self):
        return LessonResource.objects.filter(booking__teacher__user=self.request.user)
