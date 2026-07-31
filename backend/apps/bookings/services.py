"""Booking mutations shared between the REST views and the AI booking tools,
so both go through the exact same validation, notifications, and Calendar sync."""

from django.utils import timezone
from rest_framework.exceptions import ValidationError
from .models import Booking
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


def create_booking_request(learner, teacher, language_name, start_at, end_at, timezone_snapshot, learner_whatsapp_number=''):
    """Creates a pending booking request. Raises ValidationError on bad times or a conflict."""
    if start_at >= end_at:
        raise ValidationError({'detail': 'start_at must be before end_at.'})
    if start_at < timezone.now():
        raise ValidationError({'detail': 'Cannot request a booking in the past.'})
    if not language_name or len(language_name) > 100:
        raise ValidationError({'detail': 'language_name is required and must be at most 100 characters.'})

    overlap_exists = Booking.objects.filter(
        teacher=teacher,
        status__in=['pending', 'confirmed'],
        start_at__lt=end_at,
        end_at__gt=start_at,
    ).exists()
    if overlap_exists:
        raise ValidationError({'detail': 'This teacher already has a booking during that time.'})

    booking = Booking.objects.create(
        learner=learner,
        teacher=teacher,
        language_name=language_name,
        start_at=start_at,
        end_at=end_at,
        timezone_snapshot=timezone_snapshot,
        learner_whatsapp_number=learner_whatsapp_number,
    )

    _create_notification(
        booking.teacher.user, 'booking_request',
        'New Booking Request',
        f'{booking.learner.full_name} has requested a lesson on {booking.start_at.strftime("%d %b %Y at %H:%M UTC")}.',
    )
    notify_email.send_booking_request_email(booking)
    return booking


def cancel_booking(booking, cancelled_by):
    """Cancels a pending/confirmed booking. `cancelled_by` is 'learner' or 'teacher'.
    Raises ValueError if the booking isn't in a cancellable state."""
    if booking.status not in ['pending', 'confirmed']:
        raise ValueError('Cannot cancel this booking.')

    if booking.google_event_id:
        account = GoogleCalendarAccount.objects.filter(user=booking.teacher.user).first()
        if account:
            try:
                google_client.delete_event(account, booking.google_event_id)
            except Exception:
                pass

    if booking.learner_google_event_id:
        account = GoogleCalendarAccount.objects.filter(user=booking.learner).first()
        if account:
            try:
                google_client.delete_event(account, booking.learner_google_event_id)
            except Exception:
                pass

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
    return booking
