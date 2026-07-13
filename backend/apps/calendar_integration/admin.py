from django.contrib import admin
from .models import GoogleCalendarAccount


@admin.register(GoogleCalendarAccount)
class GoogleCalendarAccountAdmin(admin.ModelAdmin):
    list_display = ('id', 'user_name', 'google_email', 'token_expiry', 'created_at')
    search_fields = ('user__full_name', 'google_email')
    readonly_fields = ('access_token', 'refresh_token', 'created_at', 'updated_at')

    def user_name(self, obj):
        return obj.user.full_name
    user_name.short_description = 'User'
