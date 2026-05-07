from datetime import datetime, date, timedelta
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Teacher, TeacherLanguage, Availability
from .serializers import TeacherSerializer, TeacherPublicSerializer, TeacherLanguageSerializer, AvailabilitySerializer
from apps.bookings.models import Booking
from apps.bookings.serializers import BookingSerializer
from apps.accounts.models import User


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


class TeacherAvailabilityPublicView(APIView):
    """Public endpoint returning a teacher's availability, optionally converted to a requested timezone."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        teacher = get_object_or_404(Teacher, pk=pk, is_published=True, approval_status='approved')
        slots = Availability.objects.filter(teacher=teacher, is_active=True)

        viewer_tz_str = request.query_params.get('timezone', '').strip()
        try:
            viewer_tz = ZoneInfo(viewer_tz_str) if viewer_tz_str else None
        except ZoneInfoNotFoundError:
            return Response({'detail': f'Unknown timezone: {viewer_tz_str}'}, status=status.HTTP_400_BAD_REQUEST)

        # Monday = 0 in isoweekday; day_of_week field stores 0=Monday..6=Sunday
        # Use a fixed Monday as anchor date for conversion
        anchor = date(2024, 1, 1)  # known Monday

        result = []
        for slot in slots:
            entry = AvailabilitySerializer(slot).data
            if viewer_tz:
                try:
                    teacher_tz = ZoneInfo(slot.timezone or 'UTC')
                    slot_date = anchor + timedelta(days=slot.day_of_week)

                    start_dt = datetime(slot_date.year, slot_date.month, slot_date.day,
                                        slot.start_time.hour, slot.start_time.minute,
                                        tzinfo=teacher_tz)
                    end_dt = datetime(slot_date.year, slot_date.month, slot_date.day,
                                      slot.end_time.hour, slot.end_time.minute,
                                      tzinfo=teacher_tz)

                    converted_start = start_dt.astimezone(viewer_tz)
                    converted_end = end_dt.astimezone(viewer_tz)

                    entry['converted_timezone'] = viewer_tz_str
                    entry['converted_start_time'] = converted_start.strftime('%H:%M')
                    entry['converted_end_time'] = converted_end.strftime('%H:%M')
                    entry['converted_day_of_week'] = converted_start.weekday()
                except Exception:
                    pass
            result.append(entry)

        return Response(result)


class TeacherDashboardView(APIView):
    """Aggregated dashboard summary for the logged-in teacher."""
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def get(self, request):
        teacher = get_object_or_404(Teacher, user=request.user)
        now = timezone.now()

        upcoming = Booking.objects.filter(
            teacher=teacher, status='confirmed', start_at__gte=now,
        ).order_by('start_at')[:10]

        pending = Booking.objects.filter(
            teacher=teacher, status='pending',
        ).order_by('created_at')

        recent_completions = Booking.objects.filter(
            teacher=teacher, status__in=['completed', 'confirmed'], start_at__lt=now,
        ).order_by('-start_at')[:5]

        student_ids = Booking.objects.filter(
            teacher=teacher, status__in=['confirmed', 'completed'],
        ).values_list('learner_id', flat=True).distinct()

        return Response({
            'upcoming_lessons': BookingSerializer(upcoming, many=True).data,
            'pending_requests': BookingSerializer(pending, many=True).data,
            'pending_requests_count': pending.count(),
            'total_students': len(student_ids),
            'recent_completions': BookingSerializer(recent_completions, many=True).data,
        })


class TeacherStudentListView(APIView):
    """List all students who have booked with this teacher."""
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def get(self, request):
        teacher = get_object_or_404(Teacher, user=request.user)
        bookings = Booking.objects.filter(
            teacher=teacher, status__in=['confirmed', 'completed'],
        ).select_related('learner').order_by('-created_at')

        seen = set()
        students = []
        for b in bookings:
            if b.learner_id not in seen:
                seen.add(b.learner_id)
                lesson_count = bookings.filter(learner=b.learner).count()
                students.append({
                    'id': b.learner_id,
                    'full_name': b.learner.full_name,
                    'email': b.learner.email,
                    'country': b.learner.country,
                    'lesson_count': lesson_count,
                    'last_lesson': b.start_at,
                    'language_name': b.language_name,
                })

        return Response(students)
