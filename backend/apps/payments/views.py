from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from . import services
from .models import Payment
from .serializers import PaymentSerializer
from apps.bookings.models import Booking
from apps.teachers.models import Teacher
from apps.notifications.models import Notification


class CheckoutView(APIView):
    """Start (or resume) checkout for one of the learner's own bookings.

    Returns the amount breakdown the fake gateway screen displays.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        booking_id = request.data.get('booking_id')
        booking = get_object_or_404(Booking, pk=booking_id, learner=request.user)
        if booking.status in ('cancelled', 'declined'):
            return Response({'detail': 'This booking is no longer active.'}, status=status.HTTP_400_BAD_REQUEST)

        payment = services.get_or_create_checkout(booking)
        return Response(PaymentSerializer(payment).data, status=status.HTTP_201_CREATED)


class ConfirmPaymentView(APIView):
    """SIMULATED gateway callback — marks the payment paid and tells the teacher."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, reference):
        payment = get_object_or_404(Payment, reference=reference, learner=request.user)
        services.confirm_payment(
            payment,
            method=request.data.get('method', ''),
            card_number=request.data.get('card_number', ''),
            mobile_number=request.data.get('mobile_number', ''),
        )

        Notification.objects.create(
            user=payment.teacher.user,
            notification_type='payment_received',
            title='Payment received',
            body=(
                f'{payment.learner.full_name} paid {payment.currency} {payment.amount} for the '
                f'{payment.booking.language_name} lesson on '
                f'{payment.booking.start_at.strftime("%d %b %Y at %H:%M UTC")}. '
                f'Your earnings: {payment.currency} {payment.teacher_earnings}.'
            ),
        )
        return Response(PaymentSerializer(payment).data)


class MyPaymentsView(generics.ListAPIView):
    """Learner's payment history / receipts."""
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(learner=self.request.user).select_related('booking', 'teacher__user')


class TeacherEarningsView(APIView):
    """Earnings summary + per-lesson breakdown for the signed-in teacher."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'teacher':
            return Response({'detail': 'Only teachers have earnings.'}, status=status.HTTP_403_FORBIDDEN)
        teacher = get_object_or_404(Teacher, user=request.user)

        payments = (
            Payment.objects.filter(teacher=teacher)
            .select_related('booking', 'learner')
            .order_by('-created_at')
        )
        return Response({
            'summary': services.earnings_summary(teacher),
            'payments': PaymentSerializer(payments, many=True).data,
        })
