from django.conf import settings
from django.core.signing import TimestampSigner
from django.http import HttpResponseRedirect
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from . import google_client
from .models import GoogleCalendarAccount

STATE_SALT = 'calendar-integration-oauth-state'


class GoogleCalendarConnectView(APIView):
    """Returns a Google OAuth consent URL for the logged-in user (teacher or learner) to visit."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        signer = TimestampSigner(salt=STATE_SALT)
        state = signer.sign(str(request.user.id))
        return Response({'authorization_url': google_client.authorization_url(state)})


class GoogleCalendarCallbackView(APIView):
    """Google redirects the user's browser here after consent. No auth header available."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from apps.accounts.models import User

        state = request.GET.get('state', '')
        code = request.GET.get('code', '')
        signer = TimestampSigner(salt=STATE_SALT)

        return_path = '/teacher/profile'
        try:
            user_id = signer.unsign(state, max_age=600)
            user = User.objects.get(pk=user_id)
            return_path = '/teacher/profile' if user.role == 'teacher' else '/learner/dashboard'
            tokens = google_client.exchange_code(code, state)
            GoogleCalendarAccount.objects.update_or_create(
                user=user,
                defaults={
                    'google_email': tokens['google_email'],
                    'access_token': tokens['access_token'],
                    'refresh_token': tokens['refresh_token'],
                    'token_expiry': tokens['token_expiry'],
                },
            )
            return HttpResponseRedirect(f'{settings.FRONTEND_URL}{return_path}?calendar=connected')
        except google_client.CalendarAccessNotGranted:
            return HttpResponseRedirect(f'{settings.FRONTEND_URL}{return_path}?calendar=no_access')
        except Exception:
            import traceback
            traceback.print_exc()
            return HttpResponseRedirect(f'{settings.FRONTEND_URL}{return_path}?calendar=error')


class GoogleCalendarStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        account = GoogleCalendarAccount.objects.filter(user=request.user).first()
        if not account:
            return Response({'connected': False, 'google_email': None})
        return Response({'connected': True, 'google_email': account.google_email})


class GoogleCalendarDisconnectView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        GoogleCalendarAccount.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
