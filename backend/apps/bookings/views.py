from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Booking
from .serializers import BookingSerializer, BookingStatusSerializer
from apps.teachers.models import Teacher
from apps.notifications.models import Notification
from apps.notifications import email as notify_email


def _create_notification(user, notification_type, title, body):
    Notification.objects.create(
        user=user,
        notification_type=notification_type,
        title=title,
        body=body,
    )


class BookingCreateView(generics.CreateAPIView):
    """Learner creates a booking request."""
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        booking = serializer.save(learner=self.request.user)
        teacher_user = booking.teacher.user
        _create_notification(
            teacher_user, 'booking_request',
            'New Booking Request',
            f'{booking.learner.full_name} has requested a lesson on {booking.start_at.strftime("%d %b %Y at %H:%M UTC")}.',
        )
        notify_email.send_booking_request_email(booking)


class LearnerBookingListView(generics.ListAPIView):
    """Learner views their own bookings."""
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Booking.objects.filter(learner=self.request.user).order_by('-start_at')
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs


class TeacherBookingListView(generics.ListAPIView):
    """Teacher views bookings for their profile."""
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        teacher = get_object_or_404(Teacher, user=self.request.user)
        qs = Booking.objects.filter(teacher=teacher).order_by('-start_at')
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs


class BookingDetailView(generics.RetrieveAPIView):
    """View a single booking."""
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'teacher':
            return Booking.objects.filter(teacher__user=user)
        return Booking.objects.filter(learner=user)


class BookingConfirmView(APIView):
    """Teacher confirms a booking."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        booking = get_object_or_404(Booking, pk=pk, teacher__user=request.user, status='pending')
        booking.status = 'confirmed'
        meeting_link = request.data.get('external_meeting_link', '')
        if meeting_link:
            booking.external_meeting_link = meeting_link
        booking.save()

        _create_notification(
            booking.learner, 'booking_confirmed',
            'Booking Confirmed',
            f'Your lesson with {booking.teacher.user.full_name} on {booking.start_at.strftime("%d %b %Y at %H:%M UTC")} has been confirmed.',
        )
        notify_email.send_booking_confirmed_email(booking)

        return Response(BookingSerializer(booking).data)


class BookingDeclineView(APIView):
    """Teacher declines a booking."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        booking = get_object_or_404(Booking, pk=pk, teacher__user=request.user, status='pending')
        booking.status = 'declined'
        booking.save()

        _create_notification(
            booking.learner, 'booking_declined',
            'Booking Declined',
            f'Your booking request with {booking.teacher.user.full_name} has been declined.',
        )
        notify_email.send_booking_declined_email(booking)

        return Response(BookingSerializer(booking).data)


class BookingCancelView(APIView):
    """Learner or teacher cancels a booking."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        user = request.user
        if user.role == 'teacher':
            booking = get_object_or_404(Booking, pk=pk, teacher__user=user)
            cancelled_by = 'teacher'
        else:
            booking = get_object_or_404(Booking, pk=pk, learner=user)
            cancelled_by = 'learner'

        if booking.status not in ['pending', 'confirmed']:
            return Response({'detail': 'Cannot cancel this booking.'}, status=status.HTTP_400_BAD_REQUEST)

        booking.status = 'cancelled'
        booking.save()

        if cancelled_by == 'teacher':
            _create_notification(
                booking.learner, 'booking_cancelled',
                'Booking Cancelled',
                f'Your lesson with {booking.teacher.user.full_name} on {booking.start_at.strftime("%d %b %Y at %H:%M UTC")} has been cancelled.',
            )
        else:
            _create_notification(
                booking.teacher.user, 'booking_cancelled',
                'Booking Cancelled',
                f'{booking.learner.full_name} cancelled their lesson on {booking.start_at.strftime("%d %b %Y at %H:%M UTC")}.',
            )
        notify_email.send_booking_cancelled_email(booking, cancelled_by)

        return Response(BookingSerializer(booking).data)


class BookingNotesView(APIView):
    """Teacher adds notes to a completed/confirmed lesson."""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        booking = get_object_or_404(Booking, pk=pk, teacher__user=request.user)
        notes = request.data.get('teacher_notes', '')
        booking.teacher_notes = notes
        booking.save()
        return Response(BookingSerializer(booking).data)
