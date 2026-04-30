from django.contrib import admin
from .models import Learner


@admin.register(Learner)
class LearnerAdmin(admin.ModelAdmin):
    list_display = ('user_email', 'user_name', 'proficiency_level')
    search_fields = ('user__email', 'user__full_name')
    list_filter = ('proficiency_level',)

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'Email'

    def user_name(self, obj):
        return obj.user.full_name
    user_name.short_description = 'Name'
