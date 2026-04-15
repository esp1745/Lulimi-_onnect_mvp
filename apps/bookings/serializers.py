from rest_framework import serializers
from .models import Booking


class BookingSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.user.full_name', read_only=True)
    learner_name = serializers.CharField(source='learner.full_name', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'teacher', 'teacher_name', 'learner', 'learner_name',
            'language_name', 'start_at', 'end_at', 'timezone_snapshot',
            'status', 'external_meeting_link', 'teacher_notes', 'learner_notes',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'learner', 'status', 'created_at', 'updated_at']


class BookingStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['status', 'external_meeting_link']
