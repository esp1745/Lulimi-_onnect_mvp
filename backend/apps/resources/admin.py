from django.contrib import admin
from .models import Resource, LessonResource


def _make_public(modeladmin, request, queryset):
    queryset.update(visibility='public')


_make_public.short_description = 'Make selected resources public'


def _flag_resources(modeladmin, request, queryset):
    queryset.update(visibility='teacher_only')


_flag_resources.short_description = 'Flag (restrict to teacher only)'


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ('title', 'teacher_name', 'language_name', 'resource_type', 'visibility', 'created_at')
    list_filter = ('resource_type', 'visibility', 'language_name')
    search_fields = ('title', 'teacher__user__full_name', 'language_name')
    actions = [_make_public, _flag_resources]

    def teacher_name(self, obj):
        return obj.teacher.user.full_name
    teacher_name.short_description = 'Teacher'


@admin.register(LessonResource)
class LessonResourceAdmin(admin.ModelAdmin):
    list_display = ('booking', 'resource', 'created_at')
    search_fields = ('booking__teacher__user__full_name', 'resource__title')
