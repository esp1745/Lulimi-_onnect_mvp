from django.contrib import admin
from django.utils import timezone

from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        'reference', 'learner', 'teacher', 'amount', 'platform_fee',
        'teacher_earnings', 'status', 'payout_status', 'paid_at',
    )
    list_filter = ('status', 'payout_status', 'method', 'created_at')
    search_fields = ('reference', 'learner__email', 'learner__full_name', 'teacher__user__full_name')
    readonly_fields = ('reference', 'amount', 'platform_fee', 'teacher_earnings', 'paid_at', 'created_at')
    actions = ('mark_paid_out',)

    @admin.action(description='Mark selected payments as paid out to teacher')
    def mark_paid_out(self, request, queryset):
        # The manual-payout leg of the platform-collects model: run the bulk
        # transfer, then tick the payments off here.
        updated = queryset.filter(status='paid', payout_status='held').update(
            payout_status='paid_out', paid_out_at=timezone.now()
        )
        self.message_user(request, f'{updated} payment(s) marked as paid out.')
