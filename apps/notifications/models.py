from django.db import models
from django.conf import settings


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('booking_request', 'Booking Request'),
        ('booking_confirmed', 'Booking Confirmed'),
        ('booking_declined', 'Booking Declined'),
        ('booking_cancelled', 'Booking Cancelled'),
        ('lesson_reminder', 'Lesson Reminder'),
        ('welcome', 'Welcome'),
        ('profile_approved', 'Profile Approved'),
        ('profile_rejected', 'Profile Rejected'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=30, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    body = models.TextField()
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.notification_type}"
