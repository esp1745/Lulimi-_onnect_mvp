from django.db import models
from django.conf import settings


class Resource(models.Model):
    RESOURCE_TYPE = [
        ('text', 'Text'),
        ('pdf', 'PDF'),
        ('audio', 'Audio'),
        ('image', 'Image'),
        ('link', 'Link'),
    ]
    VISIBILITY = [
        ('public', 'Public'),
        ('teacher_only', 'Teacher Only'),
        ('student_shared', 'Student Shared'),
    ]

    teacher = models.ForeignKey('teachers.Teacher', on_delete=models.CASCADE, related_name='resources')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    language_name = models.CharField(max_length=100)
    resource_type = models.CharField(max_length=15, choices=RESOURCE_TYPE)
    file_url = models.URLField(blank=True)
    content_text = models.TextField(blank=True)  # for text type resources
    visibility = models.CharField(max_length=15, choices=VISIBILITY, default='teacher_only')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.resource_type})"


class LessonResource(models.Model):
    """Links a resource to a specific booking/lesson."""
    booking = models.ForeignKey('bookings.Booking', on_delete=models.CASCADE, related_name='lesson_resources')
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='lesson_attachments')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('booking', 'resource')
