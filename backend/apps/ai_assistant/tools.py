"""Claude tool schemas + executors for the learner booking chatbot.

Read tools execute immediately when Claude calls them. Write tools
(`request_booking`, `cancel_booking`) are never executed directly from here —
`views.BookingsChatView` intercepts them and requires an explicit frontend
confirmation before calling `execute_write_tool`.
"""

from django.db.models import Q
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from apps.bookings.models import Booking
from apps.bookings import services as booking_services
from apps.teachers.models import Teacher
from apps.teachers import services as teacher_services

READ_TOOLS = {'list_my_bookings', 'search_teachers', 'check_teacher_availability'}
WRITE_TOOLS = {'request_booking', 'cancel_booking'}

TOOL_SCHEMAS = [
    {
        'name': 'list_my_bookings',
        'description': "Lists the learner's own bookings (pending requests, upcoming confirmed lessons, and past lessons).",
        'input_schema': {'type': 'object', 'properties': {}},
    },
    {
        'name': 'search_teachers',
        'description': 'Searches published teachers by name, language, headline, or bio. Returns up to 5 matches.',
        'input_schema': {
            'type': 'object',
            'properties': {'query': {'type': 'string', 'description': 'e.g. a language name like "Bemba" or a teacher name'}},
            'required': ['query'],
        },
    },
    {
        'name': 'check_teacher_availability',
        'description': 'Checks whether a specific teacher is free during a given time range.',
        'input_schema': {
            'type': 'object',
            'properties': {
                'teacher_id': {'type': 'integer'},
                'start_at': {'type': 'string', 'description': 'ISO 8601 datetime in UTC, e.g. 2026-08-05T15:00:00Z'},
                'end_at': {'type': 'string', 'description': 'ISO 8601 datetime in UTC'},
            },
            'required': ['teacher_id', 'start_at', 'end_at'],
        },
    },
    {
        'name': 'request_booking',
        'description': (
            'Requests a lesson with a teacher. This only creates a PENDING request — the teacher still has to '
            'confirm it, exactly like booking through the normal UI. Always call check_teacher_availability first.'
        ),
        'input_schema': {
            'type': 'object',
            'properties': {
                'teacher_id': {'type': 'integer'},
                'language_name': {'type': 'string'},
                'start_at': {'type': 'string', 'description': 'ISO 8601 datetime in UTC'},
                'end_at': {'type': 'string', 'description': 'ISO 8601 datetime in UTC'},
            },
            'required': ['teacher_id', 'language_name', 'start_at', 'end_at'],
        },
    },
    {
        'name': 'cancel_booking',
        'description': "Cancels one of the learner's own pending or confirmed bookings.",
        'input_schema': {
            'type': 'object',
            'properties': {'booking_id': {'type': 'integer'}},
            'required': ['booking_id'],
        },
    },
]


def _booking_summary(b):
    return {
        'id': b.id,
        'teacher_name': b.teacher.user.full_name,
        'language_name': b.language_name,
        'start_at': b.start_at.isoformat(),
        'end_at': b.end_at.isoformat(),
        'status': b.status,
    }


def list_my_bookings(user, tool_input):
    now = timezone.now()
    qs = Booking.objects.filter(learner=user).exclude(status__in=['declined', 'cancelled']).order_by('-start_at')[:20]
    return {'bookings': [_booking_summary(b) for b in qs], 'current_time_utc': now.isoformat()}


def search_teachers(user, tool_input):
    query = tool_input.get('query', '')
    qs = Teacher.objects.filter(is_published=True, approval_status='approved')
    if query:
        qs = qs.filter(
            Q(user__full_name__icontains=query) | Q(headline__icontains=query) |
            Q(bio__icontains=query) | Q(languages__language_name__icontains=query)
        ).distinct()
    results = []
    for t in qs[:5]:
        results.append({
            'teacher_id': t.id,
            'full_name': t.user.full_name,
            'headline': t.headline,
            'languages': list(t.languages.values_list('language_name', flat=True)),
            'price': str(t.price) if t.price is not None else None,
        })
    return {'teachers': results}


def check_teacher_availability(user, tool_input):
    teacher = Teacher.objects.filter(pk=tool_input['teacher_id'], is_published=True, approval_status='approved').first()
    if not teacher:
        return {'error': 'Teacher not found.'}
    start_at = parse_datetime(tool_input['start_at'])
    end_at = parse_datetime(tool_input['end_at'])
    if not start_at or not end_at:
        return {'error': 'start_at/end_at must be valid ISO 8601 datetimes.'}
    return {'available': teacher_services.is_teacher_available(teacher, start_at, end_at)}


def describe_write_tool(tool_name, tool_input):
    """Builds the human-readable confirmation summary shown in the UI before a write tool runs."""
    if tool_name == 'request_booking':
        teacher = Teacher.objects.filter(pk=tool_input.get('teacher_id')).first()
        teacher_name = teacher.user.full_name if teacher else f"teacher #{tool_input.get('teacher_id')}"
        return f"Request a {tool_input.get('language_name')} lesson with {teacher_name} from {tool_input.get('start_at')} to {tool_input.get('end_at')}?"
    if tool_name == 'cancel_booking':
        booking = Booking.objects.filter(pk=tool_input.get('booking_id')).first()
        if booking:
            return f"Cancel your {booking.language_name} lesson with {booking.teacher.user.full_name} on {booking.start_at.strftime('%d %b %Y at %H:%M UTC')}?"
        return f"Cancel booking #{tool_input.get('booking_id')}?"
    return f"Run {tool_name}?"


def execute_write_tool(user, tool_name, tool_input):
    """Only called after the frontend confirms. Returns a JSON-serializable tool result."""
    if tool_name == 'request_booking':
        teacher = Teacher.objects.filter(pk=tool_input['teacher_id'], is_published=True, approval_status='approved').first()
        if not teacher:
            return {'error': 'Teacher not found.'}
        start_at = parse_datetime(tool_input['start_at'])
        end_at = parse_datetime(tool_input['end_at'])
        if not start_at or not end_at:
            return {'error': 'start_at/end_at must be valid ISO 8601 datetimes.'}
        try:
            booking = booking_services.create_booking_request(
                learner=user, teacher=teacher, language_name=tool_input['language_name'],
                start_at=start_at, end_at=end_at, timezone_snapshot=user.timezone or 'UTC',
            )
        except Exception as e:
            return {'error': str(e)}
        return {'booking': _booking_summary(booking)}

    if tool_name == 'cancel_booking':
        booking = Booking.objects.filter(pk=tool_input['booking_id'], learner=user).first()
        if not booking:
            return {'error': 'Booking not found.'}
        try:
            booking_services.cancel_booking(booking, cancelled_by='learner')
        except ValueError as e:
            return {'error': str(e)}
        return {'booking': _booking_summary(booking)}

    return {'error': f'Unknown write tool: {tool_name}'}


def execute_read_tool(user, tool_name, tool_input):
    if tool_name == 'list_my_bookings':
        return list_my_bookings(user, tool_input)
    if tool_name == 'search_teachers':
        return search_teachers(user, tool_input)
    if tool_name == 'check_teacher_availability':
        return check_teacher_availability(user, tool_input)
    return {'error': f'Unknown read tool: {tool_name}'}
