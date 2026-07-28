from django.db.models import Avg
from django.utils import timezone
from rest_framework import serializers
from .models import Teacher, TeacherLanguage, Availability, Review, TeacherPackage


class TeacherLanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherLanguage
        fields = ['id', 'language_name', 'proficiency_type']


class AvailabilitySerializer(serializers.ModelSerializer):
    day_name = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = Availability
        fields = ['id', 'day_of_week', 'day_name', 'start_time', 'end_time', 'timezone', 'is_active']


class TeacherPackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherPackage
        fields = ['id', 'title', 'description', 'hours', 'price', 'savings', 'created_at']
        read_only_fields = ['id', 'created_at']


class ReviewSerializer(serializers.ModelSerializer):
    learner_name = serializers.CharField(source='learner.full_name', read_only=True)

    class Meta:
        model = Review
        fields = [
            'id', 'learner_name', 'rating', 'knowledge_score', 'value_score',
            'responsiveness_score', 'supportiveness_score', 'text', 'tag', 'created_at',
        ]


class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'booking', 'rating', 'text', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate(self, attrs):
        booking = attrs['booking']
        user = self.context['request'].user
        teacher_id = int(self.context['view'].kwargs['pk'])
        if user.role != 'learner':
            raise serializers.ValidationError('Only learners can leave reviews.')
        if booking.teacher_id != teacher_id:
            raise serializers.ValidationError('This booking is not with this teacher.')
        if booking.learner_id != user.id:
            raise serializers.ValidationError('You can only review your own bookings.')
        if booking.status not in ('confirmed', 'completed') or booking.start_at >= timezone.now():
            raise serializers.ValidationError('You can only review a lesson that has already happened.')
        if Review.objects.filter(booking=booking).exists():
            raise serializers.ValidationError("You've already reviewed this lesson.")
        return attrs


class TeacherStatsMixin(serializers.Serializer):
    """Computed marketplace stats shared by the owner-facing and public teacher serializers."""

    rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    follower_count = serializers.SerializerMethodField()
    minutes_coached = serializers.SerializerMethodField()
    score_breakdown = serializers.SerializerMethodField()
    packages = TeacherPackageSerializer(many=True, read_only=True)

    def get_rating(self, obj):
        avg = obj.reviews.aggregate(avg=Avg('rating'))['avg']
        return round(avg, 1) if avg is not None else None

    def get_review_count(self, obj):
        return obj.reviews.count()

    def get_follower_count(self, obj):
        return obj.followers.count()

    def get_minutes_coached(self, obj):
        completed = obj.bookings.filter(status='completed')
        total_seconds = sum((b.end_at - b.start_at).total_seconds() for b in completed)
        return int(total_seconds // 60)

    def get_score_breakdown(self, obj):
        aggregates = obj.reviews.aggregate(
            knowledge=Avg('knowledge_score'),
            value=Avg('value_score'),
            responsiveness=Avg('responsiveness_score'),
            supportiveness=Avg('supportiveness_score'),
        )
        if all(v is None for v in aggregates.values()):
            return None
        return {k: (round(v, 1) if v is not None else None) for k, v in aggregates.items()}


class TeacherSerializer(TeacherStatsMixin, serializers.ModelSerializer):
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
            'certifications', 'pricing_info', 'price', 'profile_photo_url', 'intro_audio_url',
            'whatsapp_number', 'region', 'institution', 'professional_role', 'education',
            'work_experience', 'specializations', 'services', 'badge', 'is_published',
            'approval_status', 'is_featured', 'languages', 'availability', 'rating',
            'review_count', 'follower_count', 'minutes_coached', 'score_breakdown',
            'packages', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'badge', 'approval_status', 'is_featured', 'created_at', 'updated_at']


class TeacherPublicSerializer(TeacherStatsMixin, serializers.ModelSerializer):
    """Reduced serializer for marketplace listing and public profile."""
    languages = TeacherLanguageSerializer(many=True, read_only=True)
    availability = AvailabilitySerializer(many=True, read_only=True)
    full_name = serializers.CharField(source='user.full_name', read_only=True)
    country = serializers.CharField(source='user.country', read_only=True)

    class Meta:
        model = Teacher
        fields = [
            'id', 'full_name', 'country', 'headline', 'bio', 'lesson_format',
            'teaching_levels', 'years_experience', 'certifications', 'pricing_info', 'price',
            'profile_photo_url', 'intro_audio_url', 'whatsapp_number', 'region',
            'institution', 'professional_role', 'education', 'specializations',
            'services', 'badge', 'is_featured', 'languages', 'availability', 'rating',
            'review_count', 'follower_count', 'minutes_coached', 'score_breakdown',
            'packages', 'created_at',
        ]
