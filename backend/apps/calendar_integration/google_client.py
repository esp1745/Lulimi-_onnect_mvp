import os
from datetime import timezone as dt_timezone

# Google's consent screen lets a user grant a subset of the requested scopes.
# Without this, oauthlib raises on any mismatch between requested and granted
# scopes instead of just returning the (possibly reduced) credentials.
os.environ.setdefault('OAUTHLIB_RELAX_TOKEN_SCOPE', '1')

from django.conf import settings
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from google.auth.transport.requests import Request as GoogleAuthRequest
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/userinfo.email',
]


class CalendarAccessNotGranted(Exception):
    """Raised when the user completed Google's consent screen but didn't grant Calendar access."""


def _client_config():
    return {
        'web': {
            'client_id': settings.GOOGLE_OAUTH_CLIENT_ID,
            'client_secret': settings.GOOGLE_OAUTH_CLIENT_SECRET,
            'auth_uri': 'https://accounts.google.com/o/oauth2/auth',
            'token_uri': 'https://oauth2.googleapis.com/token',
            'redirect_uris': [settings.GOOGLE_OAUTH_REDIRECT_URI],
        }
    }


def build_flow(state=None):
    # PKCE is off: this is a confidential client (has a client_secret), and the
    # authorization and callback requests build two separate Flow instances, so
    # a per-instance auto-generated code_verifier can never be reused between them.
    flow = Flow.from_client_config(
        _client_config(), scopes=SCOPES, state=state, autogenerate_code_verifier=False,
    )
    flow.redirect_uri = settings.GOOGLE_OAUTH_REDIRECT_URI
    return flow


def authorization_url(state):
    flow = build_flow(state=state)
    url, _ = flow.authorization_url(
        access_type='offline',
        prompt='consent',
        include_granted_scopes='true',
    )
    return url


def exchange_code(code, state):
    flow = build_flow(state=state)
    flow.fetch_token(code=code)
    creds = flow.credentials

    if not creds.has_scopes(['https://www.googleapis.com/auth/calendar']):
        raise CalendarAccessNotGranted('User did not grant the Calendar scope during consent.')

    oauth2_service = build('oauth2', 'v2', credentials=creds)
    google_email = oauth2_service.userinfo().get().execute()['email']

    # google-auth stores `expiry` as a naive UTC datetime. Django's DateTimeField
    # (USE_TZ=True) expects an aware value, so tag it as UTC before persisting.
    expiry = creds.expiry
    if expiry is not None and expiry.tzinfo is None:
        expiry = expiry.replace(tzinfo=dt_timezone.utc)

    return {
        'google_email': google_email,
        'access_token': creds.token,
        'refresh_token': creds.refresh_token,
        'token_expiry': expiry,
    }


def get_credentials(account):
    creds = Credentials(
        token=account.access_token,
        refresh_token=account.refresh_token,
        token_uri='https://oauth2.googleapis.com/token',
        client_id=settings.GOOGLE_OAUTH_CLIENT_ID,
        client_secret=settings.GOOGLE_OAUTH_CLIENT_SECRET,
        scopes=SCOPES,
    )
    # google-auth compares `expiry` against a naive UTC now(), so it must be
    # naive. Django hands us an aware datetime — convert to naive UTC here.
    expiry = account.token_expiry
    if expiry is not None and expiry.tzinfo is not None:
        expiry = expiry.astimezone(dt_timezone.utc).replace(tzinfo=None)
    creds.expiry = expiry

    if creds.expired:
        creds.refresh(GoogleAuthRequest())
        account.access_token = creds.token
        account.token_expiry = creds.expiry
        account.save(update_fields=['access_token', 'token_expiry', 'updated_at'])

    return creds


def create_event(account, booking, meeting_link='', generate_meet_link=False, notify_attendees=True):
    """Creates a calendar event for a booking on `account`'s calendar.

    `generate_meet_link` requests a new Google Meet room — only pass True once per
    booking (e.g. for the teacher's event), otherwise reuse `meeting_link` so both
    sides don't end up with two separate, disconnected Meet rooms for one lesson.
    """
    creds = get_credentials(account)
    service = build('calendar', 'v3', credentials=creds)

    description = f'Lulimi Connect lesson booking #{booking.id}.'
    if meeting_link:
        description += f'\nMeeting link: {meeting_link}'

    event = {
        'summary': f'{booking.language_name} lesson: {booking.teacher.user.full_name} & {booking.learner.full_name}',
        'description': description,
        'start': {'dateTime': booking.start_at.isoformat()},
        'end': {'dateTime': booking.end_at.isoformat()},
        'attendees': [
            {'email': booking.teacher.user.email},
            {'email': booking.learner.email},
        ],
    }
    if meeting_link:
        event['location'] = meeting_link

    insert_kwargs = {
        'calendarId': 'primary',
        'body': event,
        'sendUpdates': 'all' if notify_attendees else 'none',
    }
    if generate_meet_link:
        event['conferenceData'] = {
            'createRequest': {
                'requestId': f'lulimi-booking-{booking.id}',
                'conferenceSolutionKey': {'type': 'hangoutsMeet'},
            }
        }
        insert_kwargs['conferenceDataVersion'] = 1

    created = service.events().insert(**insert_kwargs).execute()

    return created['id'], created.get('hangoutLink', '')


def delete_event(account, event_id):
    creds = get_credentials(account)
    service = build('calendar', 'v3', credentials=creds)
    try:
        service.events().delete(calendarId='primary', eventId=event_id, sendUpdates='all').execute()
    except HttpError as e:
        if e.resp.status != 404:
            raise


def get_busy_intervals(account, time_min, time_max):
    creds = get_credentials(account)
    service = build('calendar', 'v3', credentials=creds)
    body = {
        'timeMin': time_min.isoformat(),
        'timeMax': time_max.isoformat(),
        'items': [{'id': 'primary'}],
    }
    result = service.freebusy().query(body=body).execute()
    return result['calendars']['primary']['busy']
