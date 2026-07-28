from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Message
from .serializers import MessageSerializer
from apps.accounts.models import User
from apps.bookings.models import Booking
from apps.notifications.models import Notification
from apps.notifications import email as notify_email


def _can_message(user_a, user_b):
    return Booking.objects.filter(
        Q(teacher__user=user_a, learner=user_b) | Q(teacher__user=user_b, learner=user_a)
    ).exists()


class ThreadListView(APIView):
    """List the current user's message threads, one row per counterpart."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        messages = Message.objects.filter(
            Q(sender=user) | Q(recipient=user)
        ).select_related('sender', 'recipient').order_by('-created_at')[:500]

        threads = {}
        for m in messages:
            counterpart = m.recipient if m.sender_id == user.id else m.sender
            if counterpart.id not in threads:
                threads[counterpart.id] = {
                    'user_id': counterpart.id,
                    'full_name': counterpart.full_name,
                    'last_message': m.text,
                    'last_message_at': m.created_at,
                    'unread_count': 0,
                }
            if m.recipient_id == user.id and m.read_at is None:
                threads[counterpart.id]['unread_count'] += 1

        return Response(sorted(threads.values(), key=lambda t: t['last_message_at'], reverse=True))


class ThreadDetailView(APIView):
    """Read or send messages with a specific counterpart."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id):
        target = get_object_or_404(User, pk=user_id)
        qs = Message.objects.filter(
            Q(sender=request.user, recipient=target) | Q(sender=target, recipient=request.user)
        ).order_by('-created_at')[:100]
        return Response(MessageSerializer(reversed(qs), many=True).data)

    def post(self, request, user_id):
        target = get_object_or_404(User, pk=user_id)
        text = (request.data.get('text') or '').strip()
        if not text:
            return Response({'detail': 'Message text is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not _can_message(request.user, target):
            return Response({'detail': 'You can only message someone you have a booking with.'}, status=status.HTTP_403_FORBIDDEN)

        message = Message.objects.create(sender=request.user, recipient=target, text=text)

        Notification.objects.create(
            user=target,
            notification_type='new_message',
            title=f'New message from {request.user.full_name}',
            body=text[:140],
        )
        unread_streak = Message.objects.filter(sender=request.user, recipient=target, read_at__isnull=True).count()
        if unread_streak == 1:
            notify_email.send_new_message_email(message)

        return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)


class MarkThreadReadView(APIView):
    """Mark all messages from a specific counterpart as read."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, user_id):
        Message.objects.filter(sender_id=user_id, recipient=request.user, read_at__isnull=True).update(read_at=timezone.now())
        return Response({'detail': 'Thread marked as read.'})
