import os
import uuid
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.conf import settings
from .models import Resource, LessonResource
from .serializers import ResourceSerializer, LessonResourceSerializer
from apps.teachers.models import Teacher
from apps.bookings.models import Booking

ALLOWED_TYPES = {
    'audio': ['.mp3', '.wav', '.m4a', '.ogg'],
    'pdf': ['.pdf'],
    'image': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
}


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
    """Learner views resources shared by teachers they have a booking with."""
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Resource.objects.filter(
            teacher__bookings__learner=self.request.user,
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


class FileUploadView(APIView):
    """Upload a file (audio, PDF, or image) and receive a URL for use in a resource."""
    permission_classes = [permissions.IsAuthenticated, IsTeacher]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'detail': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        ext = os.path.splitext(file.name)[1].lower()
        resource_type = None
        for rtype, exts in ALLOWED_TYPES.items():
            if ext in exts:
                resource_type = rtype
                break

        if not resource_type:
            allowed = ', '.join(e for exts in ALLOWED_TYPES.values() for e in exts)
            return Response(
                {'detail': f'Unsupported file type. Allowed: {allowed}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        filename = f'{uuid.uuid4().hex}{ext}'
        upload_dir = os.path.join(settings.MEDIA_ROOT, 'uploads', resource_type)
        os.makedirs(upload_dir, exist_ok=True)
        filepath = os.path.join(upload_dir, filename)

        with open(filepath, 'wb') as f:
            for chunk in file.chunks():
                f.write(chunk)

        file_url = request.build_absolute_uri(
            f'{settings.MEDIA_URL}uploads/{resource_type}/{filename}'
        )
        return Response({'url': file_url, 'resource_type': resource_type}, status=status.HTTP_201_CREATED)
