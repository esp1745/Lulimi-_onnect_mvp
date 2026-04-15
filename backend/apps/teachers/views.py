from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Teacher, TeacherLanguage, Availability
from .serializers import TeacherSerializer, TeacherPublicSerializer, TeacherLanguageSerializer, AvailabilitySerializer


class IsTeacher(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'teacher'


# --- Teacher Profile ---

class TeacherProfileView(generics.RetrieveUpdateAPIView):
    """GET/PUT own teacher profile."""
    serializer_class = TeacherSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def get_object(self):
        teacher, _ = Teacher.objects.get_or_create(user=self.request.user)
        return teacher


class TeacherPublicProfileView(generics.RetrieveAPIView):
    """Public profile view for learners."""
    serializer_class = TeacherPublicSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Teacher.objects.filter(is_published=True, approval_status='approved')


class PublishTeacherProfileView(APIView):
    """Teacher requests to publish their profile."""
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def post(self, request):
        teacher = get_object_or_404(Teacher, user=request.user)
        required_fields = [teacher.headline, teacher.bio]
        if not all(required_fields) or not teacher.languages.exists():
            return Response(
                {'detail': 'Complete your profile (headline, bio, and at least one language) before publishing.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        teacher.is_published = True
        teacher.approval_status = 'pending'
        teacher.save()
        return Response({'detail': 'Profile submitted for approval.'})


# --- Marketplace ---

class MarketplaceView(generics.ListAPIView):
    """Public teacher search and filter."""
    serializer_class = TeacherPublicSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Teacher.objects.filter(is_published=True, approval_status='approved')
        language = self.request.query_params.get('language')
        lesson_format = self.request.query_params.get('format')
        featured = self.request.query_params.get('featured')

        if language:
            qs = qs.filter(languages__language_name__icontains=language)
        if lesson_format:
            qs = qs.filter(lesson_format__in=[lesson_format, 'both'])
        if featured:
            qs = qs.filter(is_featured=True)

        return qs.distinct().order_by('-is_featured', '-id')


# --- Teacher Languages ---

class TeacherLanguageListCreateView(generics.ListCreateAPIView):
    serializer_class = TeacherLanguageSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def get_queryset(self):
        return TeacherLanguage.objects.filter(teacher__user=self.request.user)

    def perform_create(self, serializer):
        teacher, _ = Teacher.objects.get_or_create(user=self.request.user)
        serializer.save(teacher=teacher)


class TeacherLanguageDeleteView(generics.DestroyAPIView):
    serializer_class = TeacherLanguageSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def get_queryset(self):
        return TeacherLanguage.objects.filter(teacher__user=self.request.user)


# --- Availability ---

class AvailabilityListCreateView(generics.ListCreateAPIView):
    serializer_class = AvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def get_queryset(self):
        return Availability.objects.filter(teacher__user=self.request.user)

    def perform_create(self, serializer):
        teacher, _ = Teacher.objects.get_or_create(user=self.request.user)
        serializer.save(teacher=teacher)


class AvailabilityDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def get_queryset(self):
        return Availability.objects.filter(teacher__user=self.request.user)
