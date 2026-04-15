from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.shortcuts import get_object_or_404
from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):
    """List all notifications for the current user."""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Notification.objects.filter(user=self.request.user)
        unread = self.request.query_params.get('unread')
        if unread:
            qs = qs.filter(read_at__isnull=True)
        return qs


class MarkNotificationReadView(APIView):
    """Mark a single notification as read."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        notification = get_object_or_404(Notification, pk=pk, user=request.user)
        notification.read_at = timezone.now()
        notification.save()
        return Response(NotificationSerializer(notification).data)


class MarkAllNotificationsReadView(APIView):
    """Mark all notifications as read."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(user=request.user, read_at__isnull=True).update(read_at=timezone.now())
        return Response({'detail': 'All notifications marked as read.'})
