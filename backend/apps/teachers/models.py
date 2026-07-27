from django.core.validators import MinValueValidator, MaxValueValidator
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
    price = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)  # numeric hourly rate (USD)
    profile_photo_url = models.URLField(blank=True)
    intro_audio_url = models.URLField(blank=True)
    whatsapp_number = models.CharField(max_length=20, blank=True)
    region = models.CharField(max_length=100, blank=True)
    institution = models.CharField(max_length=255, blank=True)
    professional_role = models.CharField(max_length=255, blank=True)
    education = models.JSONField(default=list, blank=True)  # [{"degree": "...", "institution": "..."}]
    work_experience = models.JSONField(default=list, blank=True)  # [{"role","organization","startDate","endDate","description"}]
    specializations = models.JSONField(default=list, blank=True)  # ["Conversational", "Business Language", ...]
    services = models.JSONField(default=list, blank=True)  # ["1-on-1 Lessons", "Group Classes", ...]
    badge = models.CharField(max_length=100, blank=True)  # admin-assigned recognition label, e.g. "Top Rated"
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


SCORE_VALIDATORS = [MinValueValidator(1), MaxValueValidator(5)]


class Review(models.Model):
    """A learner's review of a teacher. Submission is not yet exposed in the
    frontend; rows are created via the admin (seed/manual) for now."""

    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='reviews')
    learner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='teacher_reviews')
    booking = models.ForeignKey('bookings.Booking', on_delete=models.SET_NULL, null=True, blank=True, related_name='reviews')
    rating = models.PositiveSmallIntegerField(validators=SCORE_VALIDATORS)
    knowledge_score = models.PositiveSmallIntegerField(validators=SCORE_VALIDATORS, null=True, blank=True)
    value_score = models.PositiveSmallIntegerField(validators=SCORE_VALIDATORS, null=True, blank=True)
    responsiveness_score = models.PositiveSmallIntegerField(validators=SCORE_VALIDATORS, null=True, blank=True)
    supportiveness_score = models.PositiveSmallIntegerField(validators=SCORE_VALIDATORS, null=True, blank=True)
    text = models.TextField(blank=True)
    tag = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.learner.full_name} -> {self.teacher.user.full_name} ({self.rating}★)"


class Follow(models.Model):
    """A learner following a teacher. Follow/unfollow isn't exposed in the
    frontend yet; rows are created via the admin (seed/manual) for now."""

    learner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='following')
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='followers')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('learner', 'teacher')

    def __str__(self):
        return f"{self.learner.full_name} follows {self.teacher.user.full_name}"


class TeacherPackage(models.Model):
    """A teacher-defined, informational pricing bundle (e.g. "10-hour package").
    Display-only: booking still goes through the normal single-lesson request
    flow, there is no payment processing behind these."""

    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='packages')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    hours = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=7, decimal_places=2)
    savings = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.teacher.user.full_name} - {self.title}"
