from django.contrib import admin
from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'teacher_name', 'learner_name', 'language_name', 'start_at', 'status', 'created_at')
    list_filter = ('status', 'language_name')
    search_fields = ('teacher__user__full_name', 'learner__full_name', 'language_name')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-start_at',)

    def teacher_name(self, obj):
        return obj.teacher.user.full_name
    teacher_name.short_description = 'Teacher'

    def learner_name(self, obj):
        return obj.learner.full_name
    learner_name.short_description = 'Learner'
