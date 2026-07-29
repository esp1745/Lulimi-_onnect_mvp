"""Teacher-related logic shared between REST views and the AI booking tools."""

from apps.bookings.models import Booking
from apps.calendar_integration.models import GoogleCalendarAccount
from apps.calendar_integration import google_client
from django.utils.dateparse import parse_datetime


def is_teacher_available(teacher, start_at, end_at):
    """Checks whether a teacher is free for the given range, factoring in existing
    bookings and (if connected) their live Google Calendar busy times."""
    overlap_exists = Booking.objects.filter(
        teacher=teacher,
        status__in=['pending', 'confirmed'],
        start_at__lt=end_at,
        end_at__gt=start_at,
    ).exists()
    if overlap_exists:
        return False

    account = GoogleCalendarAccount.objects.filter(user=teacher.user).first()
    if account:
        try:
            busy_intervals = google_client.get_busy_intervals(account, start_at, end_at)
            for busy in busy_intervals:
                busy_start = parse_datetime(busy['start'])
                busy_end = parse_datetime(busy['end'])
                if busy_start < end_at and busy_end > start_at:
                    return False
        except Exception:
            pass

    return True
