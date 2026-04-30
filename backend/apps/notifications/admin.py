from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'notification_type', 'title', 'read_at', 'created_at')
    list_filter = ('notification_type',)
    search_fields = ('user__email', 'title')
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)
