from django.contrib import admin
from .models import Message


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'recipient', 'read_at', 'created_at')
    search_fields = ('sender__email', 'recipient__email', 'text')
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)
