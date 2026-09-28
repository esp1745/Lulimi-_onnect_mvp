from decimal import Decimal, ROUND_HALF_UP

from django.conf import settings
from django.db import models


# Platform-collects model: the learner pays Lulimi up front, Lulimi holds the
# money and pays teachers out manually (weekly bulk payout), keeping this
# commission. No real gateway is wired yet — payments are simulated end to end.
PLATFORM_COMMISSION_RATE = Decimal(str(getattr(settings, 'PLATFORM_COMMISSION_RATE', '0.15')))


def money(value) -> Decimal:
    """Round to 2dp the way an invoice would."""
    return Decimal(value).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)


class Payment(models.Model):
    """A learner's payment for one booking.

    SIMULATED: `reference` and `payer_label` mimic what a gateway would return
    so the UI is realistic, but no money moves. Swapping in a real provider
    means filling these from the provider's webhook instead of `simulate_*`.
    """

    METHOD_CHOICES = [
        ('card', 'Card'),
        ('mtn_momo', 'MTN Mobile Money'),
        ('airtel_money', 'Airtel Money'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    # Flow #1: platform holds funds after payment, then pays the teacher out
    # manually. This tracks that second leg.
    PAYOUT_CHOICES = [
        ('held', 'Held by platform'),
        ('paid_out', 'Paid out to teacher'),
    ]

    booking = models.OneToOneField('bookings.Booking', on_delete=models.CASCADE, related_name='payment')
    learner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments_made')
    teacher = models.ForeignKey('teachers.Teacher', on_delete=models.CASCADE, related_name='payments_received')

    amount = models.DecimalField(max_digits=8, decimal_places=2)           # what the learner pays
    platform_fee = models.DecimalField(max_digits=8, decimal_places=2)     # Lulimi's commission
    teacher_earnings = models.DecimalField(max_digits=8, decimal_places=2)  # what the teacher is owed
    currency = models.CharField(max_length=3, default='USD')

    method = models.CharField(max_length=20, choices=METHOD_CHOICES, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    payout_status = models.CharField(max_length=10, choices=PAYOUT_CHOICES, default='held')

    reference = models.CharField(max_length=40, unique=True)
    payer_label = models.CharField(max_length=40, blank=True)  # masked, e.g. "•••• 4242"

    paid_at = models.DateTimeField(null=True, blank=True)
    paid_out_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.reference} — {self.amount} {self.currency} ({self.status})"

    @staticmethod
    def split(amount) -> tuple[Decimal, Decimal, Decimal]:
        """Split a gross amount into (amount, platform_fee, teacher_earnings)."""
        gross = money(amount)
        fee = money(gross * PLATFORM_COMMISSION_RATE)
        return gross, fee, money(gross - fee)
