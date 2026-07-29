from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Booking
from .serializers import BookingSerializer, BookingStatusSerializer
from . import services
from apps.teachers.models import Teacher
from apps.notifications.models import Notification
from apps.notifications import email as notify_email
from apps.calendar_integration.models import GoogleCalendarAccount
from apps.calendar_integration import google_client


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
        data = serializer.validated_data
        booking = services.create_booking_request(
            learner=self.request.user,
            teacher=data['teacher'],
            language_name=data['language_name'],
            start_at=data['start_at'],
            end_at=data['end_at'],
            timezone_snapshot=data.get('timezone_snapshot', ''),
            learner_whatsapp_number=data.get('learner_whatsapp_number', ''),
        )
        serializer.instance = booking


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

        teacher_account = GoogleCalendarAccount.objects.filter(user=request.user).first()
        if teacher_account:
            try:
                event_id, hangout_link = google_client.create_event(
                    teacher_account, booking,
                    meeting_link=booking.external_meeting_link,
                    generate_meet_link=not booking.external_meeting_link,
                )
                booking.google_event_id = event_id
                if hangout_link:
                    booking.external_meeting_link = hangout_link
            except Exception:
                pass

        learner_account = GoogleCalendarAccount.objects.filter(user=booking.learner).first()
        if learner_account:
            try:
                event_id, _ = google_client.create_event(
                    learner_account, booking,
                    meeting_link=booking.external_meeting_link,
                    generate_meet_link=False,
                    notify_attendees=False,
                )
                booking.learner_google_event_id = event_id
            except Exception:
                pass

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

        try:
            services.cancel_booking(booking, cancelled_by)
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

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
