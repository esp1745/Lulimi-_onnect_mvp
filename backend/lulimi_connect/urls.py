from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.views.static import serve

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/teachers/', include('apps.teachers.urls')),
    path('api/learners/', include('apps.learners.urls')),
    path('api/bookings/', include('apps.bookings.urls')),
    path('api/resources/', include('apps.resources.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/ai/', include('apps.ai_assistant.urls')),
    path('api/calendar/', include('apps.calendar_integration.urls')),
    path('api/messaging/', include('apps.messaging.urls')),
    # Serve user uploads. Django's static() helper only registers this when
    # DEBUG=True, so serve MEDIA explicitly to keep uploads reachable in
    # production too. NOTE: on ephemeral-disk hosts (e.g. Render's default),
    # these files are lost on redeploy — move MEDIA to object storage (S3/
    # Cloudinary) for durable uploads.
    re_path(
        r'^%s(?P<path>.*)$' % settings.MEDIA_URL.lstrip('/'),
        serve,
        {'document_root': settings.MEDIA_ROOT},
    ),
]
