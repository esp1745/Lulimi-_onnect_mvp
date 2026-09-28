from rest_framework import serializers
from .models import Booking


class BookingSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.user.full_name', read_only=True)
    teacher_user_id = serializers.IntegerField(source='teacher.user_id', read_only=True)
    learner_name = serializers.CharField(source='learner.full_name', read_only=True)
    teacher_whatsapp_number = serializers.CharField(source='teacher.whatsapp_number', read_only=True)
    payment_status = serializers.SerializerMethodField()
    payment_amount = serializers.SerializerMethodField()
    student_name = serializers.SerializerMethodField()

    def get_student_name(self, obj):
        """Who is actually attending — the account holder, or the child /
        relative they booked on behalf of."""
        profile = getattr(obj.learner, 'learner_profile', None)
        if profile and profile.booking_for_someone_else and profile.student_name:
            return profile.student_name
        return obj.learner.full_name

    def get_payment_status(self, obj):
        """'unpaid' when no payment row exists yet, else the payment's status."""
        payment = getattr(obj, 'payment', None)
        return payment.status if payment else 'unpaid'

    def get_payment_amount(self, obj):
        payment = getattr(obj, 'payment', None)
        return str(payment.amount) if payment else None

    class Meta:
        model = Booking
        fields = [
            'id', 'teacher', 'teacher_name', 'teacher_user_id', 'teacher_whatsapp_number', 'learner', 'learner_name',
            'student_name',
            'language_name', 'start_at', 'end_at', 'timezone_snapshot',
            'status', 'external_meeting_link', 'learner_whatsapp_number', 'teacher_notes', 'learner_notes',
            'payment_status', 'payment_amount',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'learner', 'status', 'created_at', 'updated_at']


class BookingStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['status', 'external_meeting_link']
