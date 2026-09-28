"""Simulated payment processing.

Everything here fakes a payment gateway so the booking flow can be exercised
end to end without a provider account. The seams a real integration (e.g.
Flutterwave) would replace are marked SIMULATED.
"""

import random
import string
from decimal import Decimal

from django.utils import timezone
from rest_framework.exceptions import ValidationError

from .models import Payment, money

# Used when a teacher hasn't set an hourly rate yet, so a lesson can still be
# priced instead of failing checkout.
DEFAULT_HOURLY_RATE = Decimal('20.00')


def _reference() -> str:
    """SIMULATED: stands in for the gateway's transaction reference."""
    suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
    return f'LUL-{suffix}'


def quote_for_booking(booking) -> Decimal:
    """Price a lesson: the teacher's hourly rate pro-rated over its duration."""
    rate = booking.teacher.price or DEFAULT_HOURLY_RATE
    hours = Decimal((booking.end_at - booking.start_at).total_seconds()) / Decimal(3600)
    if hours <= 0:
        raise ValidationError({'detail': 'Booking has no duration to charge for.'})
    return money(Decimal(rate) * hours)


def get_or_create_checkout(booking) -> Payment:
    """Return the pending Payment for a booking, creating it on first checkout."""
    existing = Payment.objects.filter(booking=booking).first()
    if existing:
        if existing.status == 'paid':
            raise ValidationError({'detail': 'This lesson has already been paid for.'})
        return existing

    amount, fee, earnings = Payment.split(quote_for_booking(booking))
    return Payment.objects.create(
        booking=booking,
        learner=booking.learner,
        teacher=booking.teacher,
        amount=amount,
        platform_fee=fee,
        teacher_earnings=earnings,
        reference=_reference(),
    )


def _mask(method: str, card_number: str, mobile_number: str) -> str:
    """Build the masked payer label a receipt would show."""
    if method == 'card':
        digits = ''.join(c for c in card_number if c.isdigit())
        return f'•••• {digits[-4:]}' if len(digits) >= 4 else 'Card'
    digits = ''.join(c for c in mobile_number if c.isdigit())
    return f'•••{digits[-3:]}' if len(digits) >= 3 else 'Mobile money'


def confirm_payment(payment: Payment, method: str, card_number: str = '', mobile_number: str = '') -> Payment:
    """SIMULATED: always succeeds. A real gateway would confirm via webhook."""
    if payment.status == 'paid':
        raise ValidationError({'detail': 'This payment has already been completed.'})
    if method not in dict(Payment.METHOD_CHOICES):
        raise ValidationError({'detail': 'Choose a valid payment method.'})

    if method == 'card':
        digits = ''.join(c for c in card_number if c.isdigit())
        if len(digits) < 12:
            raise ValidationError({'detail': 'Enter a valid card number.'})
    else:
        digits = ''.join(c for c in mobile_number if c.isdigit())
        if len(digits) < 9:
            raise ValidationError({'detail': 'Enter a valid mobile money number.'})

    payment.method = method
    payment.payer_label = _mask(method, card_number, mobile_number)
    payment.status = 'paid'
    payment.payout_status = 'held'
    payment.paid_at = timezone.now()
    payment.save(update_fields=['method', 'payer_label', 'status', 'payout_status', 'paid_at', 'updated_at'])
    return payment


def earnings_summary(teacher) -> dict:
    """Totals a teacher sees on their earnings dashboard."""
    payments = Payment.objects.filter(teacher=teacher).select_related('booking', 'learner')
    paid = payments.filter(status='paid')

    def total(qs) -> str:
        return str(money(sum((p.teacher_earnings for p in qs), Decimal('0'))))

    now = timezone.now()
    this_month = paid.filter(paid_at__year=now.year, paid_at__month=now.month)

    return {
        'total_earned': total(paid),
        'pending_payout': total(paid.filter(payout_status='held')),
        'paid_out': total(paid.filter(payout_status='paid_out')),
        'this_month': total(this_month),
        'awaiting_payment': total(payments.filter(status='pending')),
        'lessons_paid': paid.count(),
        'platform_fees': str(money(sum((p.platform_fee for p in paid), Decimal('0')))),
        'currency': 'USD',
    }
