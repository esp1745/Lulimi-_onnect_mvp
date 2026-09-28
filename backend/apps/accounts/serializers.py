from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=['teacher', 'learner'])

    class Meta:
        model = User
        fields = ['email', 'full_name', 'role', 'country', 'timezone', 'password']

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    # Surfaced here so the header avatar and dashboards can show the photo
    # without every page fetching the role-specific profile itself.
    avatar_url = serializers.SerializerMethodField()
    onboarding_completed = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'role', 'country', 'timezone',
            'avatar_url', 'onboarding_completed', 'created_at',
        ]
        read_only_fields = ['id', 'avatar_url', 'onboarding_completed', 'created_at']

    def get_avatar_url(self, obj):
        profile = getattr(obj, 'teacher_profile', None) or getattr(obj, 'learner_profile', None)
        return getattr(profile, 'profile_photo_url', '') or ''

    def get_onboarding_completed(self, obj):
        """Whether this user has finished the setup flow for their role.

        Teachers finish by publishing; learners by completing the short
        learner onboarding. Anyone else (admins) is never nagged.
        """
        if obj.role == 'teacher':
            return bool(getattr(getattr(obj, 'teacher_profile', None), 'is_published', False))
        if obj.role == 'learner':
            return bool(getattr(getattr(obj, 'learner_profile', None), 'onboarding_completed', False))
        return True
