from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from .serializers import RegisterSerializer, UserSerializer
from apps.notifications.models import Notification
from apps.notifications import email as notify_email

User = get_user_model()
_token_generator = PasswordResetTokenGenerator()


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)

        Notification.objects.create(
            user=user,
            notification_type='welcome',
            title='Welcome to Lulimi Connect',
            body='Your account is ready. Start exploring African language teachers.',
        )
        notify_email.send_welcome_email(user)

        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)


class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'detail': 'Logged out successfully.'})
        except Exception:
            return Response({'detail': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        # Always return 200 to avoid email enumeration
        try:
            user = User.objects.get(email=email)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = _token_generator.make_token(user)
            reset_link = f"{request.data.get('reset_url', 'http://localhost:3000/reset-password')}?uid={uid}&token={token}"
            notify_email._send(
                subject='Reset Your Password',
                body=(
                    f'Hi {user.full_name},\n\n'
                    f'Click the link below to reset your password:\n\n{reset_link}\n\n'
                    'This link expires after 24 hours. If you did not request this, ignore this email.\n\n'
                    'The Lulimi Connect Team'
                ),
                to_email=user.email,
            )
        except User.DoesNotExist:
            pass
        return Response({'detail': 'If that email exists, a reset link has been sent.'})


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        uid = request.data.get('uid', '')
        token = request.data.get('token', '')
        new_password = request.data.get('new_password', '')

        if not all([uid, token, new_password]):
            return Response({'detail': 'uid, token, and new_password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except (User.DoesNotExist, ValueError, TypeError):
            return Response({'detail': 'Invalid reset link.'}, status=status.HTTP_400_BAD_REQUEST)

        if not _token_generator.check_token(user, token):
            return Response({'detail': 'Reset link is invalid or has expired.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({'detail': 'Password reset successful.'})
