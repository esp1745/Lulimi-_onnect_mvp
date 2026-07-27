from django.contrib import admin
from django.utils.html import format_html
from .models import Teacher, TeacherLanguage, Availability, Review, Follow, TeacherPackage
from apps.notifications.models import Notification
from apps.notifications import email as notify_email


def _approve_teachers(modeladmin, request, queryset):
    for teacher in queryset.filter(approval_status__in=['pending', 'rejected']):
        teacher.approval_status = 'approved'
        teacher.is_published = True
        teacher.save()
        Notification.objects.create(
            user=teacher.user,
            notification_type='profile_approved',
            title='Your Profile Has Been Approved',
            body='Your teacher profile is now live on the Lulimi Connect marketplace.',
        )
        notify_email.send_profile_approved_email(teacher.user)


_approve_teachers.short_description = 'Approve selected teachers'


def _reject_teachers(modeladmin, request, queryset):
    for teacher in queryset.filter(approval_status='pending'):
        teacher.approval_status = 'rejected'
        teacher.is_published = False
        teacher.save()
        Notification.objects.create(
            user=teacher.user,
            notification_type='profile_rejected',
            title='Profile Approval Update',
            body='Your profile was not approved. Please update it and resubmit.',
        )
        notify_email.send_profile_rejected_email(teacher.user)


_reject_teachers.short_description = 'Reject selected teachers'


def _feature_teachers(modeladmin, request, queryset):
    queryset.update(is_featured=True)


_feature_teachers.short_description = 'Mark as featured'


def _unfeature_teachers(modeladmin, request, queryset):
    queryset.update(is_featured=False)


_unfeature_teachers.short_description = 'Remove from featured'


@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ('user_email', 'user_name', 'lesson_format', 'region', 'badge', 'approval_status', 'is_published', 'is_featured', 'language_list')
    list_filter = ('approval_status', 'is_published', 'is_featured', 'lesson_format', 'region')
    search_fields = ('user__email', 'user__full_name', 'headline', 'institution')
    actions = [_approve_teachers, _reject_teachers, _feature_teachers, _unfeature_teachers]
    readonly_fields = ('user',)

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'Email'

    def user_name(self, obj):
        return obj.user.full_name
    user_name.short_description = 'Name'

    def language_list(self, obj):
        langs = obj.languages.values_list('language_name', flat=True)
        return ', '.join(langs) if langs else '—'
    language_list.short_description = 'Languages'


@admin.register(TeacherLanguage)
class TeacherLanguageAdmin(admin.ModelAdmin):
    list_display = ('teacher', 'language_name', 'proficiency_type')
    list_filter = ('proficiency_type',)
    search_fields = ('language_name', 'teacher__user__full_name')


@admin.register(Availability)
class AvailabilityAdmin(admin.ModelAdmin):
    list_display = ('teacher', 'day_of_week', 'start_time', 'end_time', 'timezone', 'is_active')
    list_filter = ('day_of_week', 'is_active')
    search_fields = ('teacher__user__full_name',)


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('teacher', 'learner', 'rating', 'created_at')
    list_filter = ('rating',)
    search_fields = ('teacher__user__full_name', 'learner__full_name', 'text')


@admin.register(Follow)
class FollowAdmin(admin.ModelAdmin):
    list_display = ('learner', 'teacher', 'created_at')
    search_fields = ('teacher__user__full_name', 'learner__full_name')


@admin.register(TeacherPackage)
class TeacherPackageAdmin(admin.ModelAdmin):
    list_display = ('teacher', 'title', 'hours', 'price', 'savings')
    search_fields = ('teacher__user__full_name', 'title')
