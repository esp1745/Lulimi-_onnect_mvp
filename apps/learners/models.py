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
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.email
