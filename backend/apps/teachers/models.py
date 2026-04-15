from django.db import models
from django.conf import settings


class Teacher(models.Model):
    APPROVAL_STATUS = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    LESSON_FORMAT = [
        ('online', 'Online'),
        ('in_person', 'In Person'),
        ('both', 'Both'),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='teacher_profile')
    headline = models.CharField(max_length=255, blank=True)
    bio = models.TextField(blank=True)
    lesson_format = models.CharField(max_length=10, choices=LESSON_FORMAT, default='online')
    teaching_levels = models.JSONField(default=list)  # ['beginner', 'intermediate', 'advanced']
    age_groups = models.JSONField(default=list, blank=True)
    years_experience = models.PositiveIntegerField(null=True, blank=True)
    certifications = models.TextField(blank=True)
    pricing_info = models.CharField(max_length=255, blank=True)
    profile_photo_url = models.URLField(blank=True)
    intro_audio_url = models.URLField(blank=True)
    is_published = models.BooleanField(default=False)
    approval_status = models.CharField(max_length=10, choices=APPROVAL_STATUS, default='pending')
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.full_name} - {self.approval_status}"


class TeacherLanguage(models.Model):
    PROFICIENCY_CHOICES = [
        ('native', 'Native Speaker'),
        ('fluent', 'Fluent'),
        ('professional', 'Professional'),
    ]

    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='languages')
    language_name = models.CharField(max_length=100)
    proficiency_type = models.CharField(max_length=20, choices=PROFICIENCY_CHOICES, default='native')

    class Meta:
        unique_together = ('teacher', 'language_name')

    def __str__(self):
        return f"{self.teacher.user.full_name} - {self.language_name}"


class Availability(models.Model):
    DAY_CHOICES = [
        (0, 'Monday'), (1, 'Tuesday'), (2, 'Wednesday'),
        (3, 'Thursday'), (4, 'Friday'), (5, 'Saturday'), (6, 'Sunday'),
    ]

    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='availability')
    day_of_week = models.IntegerField(choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    timezone = models.CharField(max_length=100, default='UTC')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.teacher.user.full_name} - {self.get_day_of_week_display()} {self.start_time}-{self.end_time}"
