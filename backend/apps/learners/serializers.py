from rest_framework import serializers
from .models import Learner


class LearnerSerializer(serializers.ModelSerializer):
    display_student_name = serializers.ReadOnlyField()

    class Meta:
        model = Learner
        fields = [
            'id', 'goals', 'proficiency_level', 'profile_photo_url',
            'booking_for_someone_else', 'student_name', 'display_student_name',
            'onboarding_completed', 'created_at',
        ]
        read_only_fields = ['id', 'display_student_name', 'created_at']

    def validate(self, attrs):
        """If the account is for someone else, we need that person's name."""
        instance = self.instance
        for_someone_else = attrs.get(
            'booking_for_someone_else',
            getattr(instance, 'booking_for_someone_else', False),
        )
        student_name = attrs.get('student_name', getattr(instance, 'student_name', ''))
        if for_someone_else and not (student_name or '').strip():
            raise serializers.ValidationError(
                {'student_name': "Tell us who the lessons are for."}
            )
        return attrs
