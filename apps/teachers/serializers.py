from rest_framework import serializers
from .models import Teacher, TeacherLanguage, Availability


class TeacherLanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherLanguage
        fields = ['id', 'language_name', 'proficiency_type']


class AvailabilitySerializer(serializers.ModelSerializer):
    day_name = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = Availability
        fields = ['id', 'day_of_week', 'day_name', 'start_time', 'end_time', 'timezone', 'is_active']


class TeacherSerializer(serializers.ModelSerializer):
    languages = TeacherLanguageSerializer(many=True, read_only=True)
    availability = AvailabilitySerializer(many=True, read_only=True)
    full_name = serializers.CharField(source='user.full_name', read_only=True)
    country = serializers.CharField(source='user.country', read_only=True)
    timezone = serializers.CharField(source='user.timezone', read_only=True)

    class Meta:
        model = Teacher
        fields = [
            'id', 'full_name', 'country', 'timezone', 'headline', 'bio',
            'lesson_format', 'teaching_levels', 'age_groups', 'years_experience',
            'certifications', 'pricing_info', 'profile_photo_url', 'intro_audio_url',
            'is_published', 'approval_status', 'is_featured', 'languages', 'availability',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'approval_status', 'is_featured', 'created_at', 'updated_at']


class TeacherPublicSerializer(serializers.ModelSerializer):
    """Reduced serializer for marketplace listing."""
    languages = TeacherLanguageSerializer(many=True, read_only=True)
    full_name = serializers.CharField(source='user.full_name', read_only=True)
    country = serializers.CharField(source='user.country', read_only=True)

    class Meta:
        model = Teacher
        fields = [
            'id', 'full_name', 'country', 'headline', 'bio', 'lesson_format',
            'teaching_levels', 'profile_photo_url', 'intro_audio_url',
            'is_featured', 'languages',
        ]
