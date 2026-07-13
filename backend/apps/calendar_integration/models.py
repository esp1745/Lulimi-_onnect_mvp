from django.db import models
from django.conf import settings


class GoogleCalendarAccount(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='google_calendar_account')
    google_email = models.EmailField()
    access_token = models.TextField()
    refresh_token = models.TextField()
    token_expiry = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.full_name} - {self.google_email}"
