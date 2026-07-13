from django.urls import path
from .views import (
    GoogleCalendarConnectView,
    GoogleCalendarCallbackView,
    GoogleCalendarStatusView,
    GoogleCalendarDisconnectView,
)

urlpatterns = [
    path('google/connect/', GoogleCalendarConnectView.as_view(), name='google-calendar-connect'),
    path('google/callback/', GoogleCalendarCallbackView.as_view(), name='google-calendar-callback'),
    path('google/status/', GoogleCalendarStatusView.as_view(), name='google-calendar-status'),
    path('google/disconnect/', GoogleCalendarDisconnectView.as_view(), name='google-calendar-disconnect'),
]
