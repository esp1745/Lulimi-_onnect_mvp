from django.db import models
from django.conf import settings


class Learner(models.Model):
    PROFICIENCY_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='learner_profile')
    goals = models.TextField(blank=True)
    proficiency_level = models.CharField(max_length=15, choices=PROFICIENCY_CHOICES, blank=True)
    profile_photo_url = models.URLField(blank=True)

    # Parents, guardians and sponsors often sign up on behalf of the person who
    # will actually attend the lessons, so teachers need to know who to expect.
    booking_for_someone_else = models.BooleanField(default=False)
    student_name = models.CharField(max_length=255, blank=True)

    onboarding_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def display_student_name(self):
        """Who actually shows up to the lesson."""
        if self.booking_for_someone_else and self.student_name:
            return self.student_name
        return self.user.full_name

    def __str__(self):
        return self.user.email
