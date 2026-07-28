from datetime import datetime, date, timedelta
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Avg, Count, Q, F
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from .models import Teacher, TeacherLanguage, Availability, Review, TeacherPackage
from .serializers import (
    TeacherSerializer, TeacherPublicSerializer, TeacherLanguageSerializer, AvailabilitySerializer,
    ReviewSerializer, ReviewCreateSerializer, TeacherPackageSerializer,
)
from apps.bookings.models import Booking
from apps.bookings.serializers import BookingSerializer
from apps.accounts.models import User
from apps.calendar_integration.models import GoogleCalendarAccount
from apps.calendar_integration import google_client


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
        params = self.request.query_params
        language = params.get('language')
        lesson_format = params.get('format')
        featured = params.get('featured')
        regions = params.getlist('region')
        search = params.get('search')
        min_price = params.get('min_price')
        max_price = params.get('max_price')

        if language:
            qs = qs.filter(languages__language_name__icontains=language)
        if lesson_format:
            qs = qs.filter(lesson_format__in=[lesson_format, 'both'])
        if featured:
            qs = qs.filter(is_featured=True)
        if regions:
            qs = qs.filter(region__in=regions)
        if search:
            qs = qs.filter(
                Q(user__full_name__icontains=search) | Q(headline__icontains=search) |
                Q(bio__icontains=search) | Q(user__country__icontains=search) |
                Q(languages__language_name__icontains=search)
            )
        if min_price or max_price:
            price_range = Q()
            if min_price:
                price_range &= Q(price__gte=min_price)
            if max_price:
                price_range &= Q(price__lte=max_price)
            # A teacher with no price set is never excluded by the range.
            qs = qs.filter(Q(price__isnull=True) | price_range)

        qs = qs.distinct()

        ordering = params.get('ordering')
        if ordering == 'popular':
            qs = qs.annotate(follower_total=Count('followers', distinct=True)).order_by('-follower_total', '-is_featured', '-id')
        elif ordering == 'topRated':
            # Avg + Count both over the same 'reviews' relation — deliberately not combined
            # with a followers annotation in one query, which would trigger Django's known
            # multi-relation aggregate fan-out bug (inflated/incorrect aggregates).
            qs = qs.annotate(avg_rating=Avg('reviews__rating'), review_total=Count('reviews', distinct=True)).order_by(
                F('avg_rating').desc(nulls_last=True), '-review_total'
            )
        elif ordering == 'budget':
            qs = qs.order_by(F('price').asc(nulls_last=True))
        elif ordering == 'new':
            qs = qs.order_by('-created_at')
        elif ordering == 'mostExperience':
            qs = qs.order_by(F('years_experience').desc(nulls_last=True))
        else:
            qs = qs.order_by('-is_featured', '-id')

        # JSONField list membership isn't consistently queryable across backends
        # (sqlite vs postgres), so specialization/service tag filters are applied
        # in Python after the DB-level filters above narrow the candidate set.
        specializations = params.getlist('specializations')
        services = params.getlist('services')
        if specializations:
            qs = [t for t in qs if any(s in t.specializations for s in specializations)]
        if services:
            qs = [t for t in qs if any(s in t.services for s in services)]

        return qs


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


# --- Reviews ---

class TeacherReviewListCreateView(generics.ListCreateAPIView):
    """Public list of a teacher's reviews; learners with a past lesson can submit one."""

    def get_serializer_class(self):
        return ReviewCreateSerializer if self.request.method == 'POST' else ReviewSerializer

    def get_permissions(self):
        return [permissions.AllowAny()] if self.request.method == 'GET' else [permissions.IsAuthenticated()]

    def get_queryset(self):
        teacher = get_object_or_404(Teacher, pk=self.kwargs['pk'], is_published=True, approval_status='approved')
        return teacher.reviews.order_by('-created_at')

    def perform_create(self, serializer):
        teacher = get_object_or_404(Teacher, pk=self.kwargs['pk'])
        serializer.save(learner=self.request.user, teacher=teacher)


# --- Teacher Packages ---

class TeacherPackageListCreateView(generics.ListCreateAPIView):
    serializer_class = TeacherPackageSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def get_queryset(self):
        return TeacherPackage.objects.filter(teacher__user=self.request.user)

    def perform_create(self, serializer):
        teacher, _ = Teacher.objects.get_or_create(user=self.request.user)
        serializer.save(teacher=teacher)


class TeacherPackageDeleteView(generics.DestroyAPIView):
    serializer_class = TeacherPackageSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacher]

    def get_queryset(self):
        return TeacherPackage.objects.filter(teacher__user=self.request.user)


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


class TeacherAvailabilityCheckView(APIView):
    """Checks whether a teacher is actually free for a given time range, factoring in
    existing bookings and (if connected) their live Google Calendar busy times."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        teacher = get_object_or_404(Teacher, pk=pk, is_published=True, approval_status='approved')

        start_at = parse_datetime(request.query_params.get('start', ''))
        end_at = parse_datetime(request.query_params.get('end', ''))
        if not start_at or not end_at:
            return Response({'detail': 'start and end query params (ISO 8601) are required.'}, status=status.HTTP_400_BAD_REQUEST)

        overlap_exists = Booking.objects.filter(
            teacher=teacher,
            status__in=['pending', 'confirmed'],
            start_at__lt=end_at,
            end_at__gt=start_at,
        ).exists()
        if overlap_exists:
            return Response({'available': False})

        account = GoogleCalendarAccount.objects.filter(user=teacher.user).first()
        if account:
            try:
                busy_intervals = google_client.get_busy_intervals(account, start_at, end_at)
                for busy in busy_intervals:
                    busy_start = parse_datetime(busy['start'])
                    busy_end = parse_datetime(busy['end'])
                    if busy_start < end_at and busy_end > start_at:
                        return Response({'available': False})
            except Exception:
                pass

        return Response({'available': True})


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
