from rest_framework import serializers

from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.user.full_name', read_only=True)
    learner_name = serializers.CharField(source='learner.full_name', read_only=True)
    language_name = serializers.CharField(source='booking.language_name', read_only=True)
    start_at = serializers.DateTimeField(source='booking.start_at', read_only=True)
    booking_status = serializers.CharField(source='booking.status', read_only=True)
    method_label = serializers.CharField(source='get_method_display', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'booking', 'reference', 'amount', 'platform_fee', 'teacher_earnings',
            'currency', 'method', 'method_label', 'status', 'payout_status', 'payer_label',
            'teacher_name', 'learner_name', 'language_name', 'start_at', 'booking_status',
            'paid_at', 'created_at',
        ]
        read_only_fields = fields
