from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from .models import Learner
from .serializers import LearnerSerializer
from apps.bookings.models import Booking
from apps.bookings.serializers import BookingSerializer
from apps.resources.models import Resource
from apps.resources.serializers import ResourceSerializer
from apps.teachers.models import Review


class LearnerProfileView(generics.RetrieveUpdateAPIView):
    """Learner views/updates their own profile."""
    serializer_class = LearnerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        learner, _ = Learner.objects.get_or_create(user=self.request.user)
        return learner


class LearnerDashboardView(APIView):
    """Aggregated dashboard summary for the logged-in learner."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        now = timezone.now()
        user = request.user

        pending_requests = Booking.objects.filter(
            learner=user, status='pending',
        ).order_by('start_at')

        upcoming = Booking.objects.filter(
            learner=user, status='confirmed', start_at__gte=now,
        ).order_by('start_at')[:10]

        past = Booking.objects.filter(
            learner=user, start_at__lt=now,
        ).exclude(status='cancelled').order_by('-start_at')[:10]

        saved_resources = Resource.objects.filter(
            teacher__bookings__learner=user,
            visibility='student_shared',
        ).distinct().order_by('-created_at')[:20]

        past_data = BookingSerializer(past, many=True).data
        reviewed_ids = set(
            Review.objects.filter(learner=user, booking_id__in=[b.id for b in past]).values_list('booking_id', flat=True)
        )
        for item in past_data:
            item['reviewed'] = item['id'] in reviewed_ids

        return Response({
            'pending_requests': BookingSerializer(pending_requests, many=True).data,
            'upcoming_lessons': BookingSerializer(upcoming, many=True).data,
            'past_lessons': past_data,
            'saved_resources': ResourceSerializer(saved_resources, many=True).data,
        })
