"""Lulimi's admin site: Django's admin, rebranded, with a dashboard that leads
with the two things that actually need a human — approving teachers and paying
teachers out."""

from datetime import timedelta
from decimal import Decimal

from django.conf import settings
from django.contrib.admin import AdminSite
from django.db.models import Count, Sum
from django.urls import reverse
from django.utils import timezone


class LulimiAdminSite(AdminSite):
    site_header = 'Lulimi Connect'
    site_title = 'Lulimi admin'
    index_title = 'Overview'
    # Shown on the login screen and in the sidebar's "View site" link.
    site_url = 'http://localhost:5173'

    def each_context(self, request):
        context = super().each_context(request)
        # A visible reminder of which environment you're changing data in.
        # (`debug` from the context processor needs INTERNAL_IPS, so read
        # the setting directly.)
        context['lulimi_env'] = 'Local' if settings.DEBUG else ''
        return context

    # Roughly how often each section gets opened; anything unlisted sorts
    # after these, alphabetically, the way Django would have done anyway.
    APP_ORDER = [
        'teachers', 'bookings', 'payments', 'accounts', 'learners',
        'resources', 'messaging', 'notifications', 'calendar_integration',
        'auth',
    ]

    def get_app_list(self, request, app_label=None):
        app_list = super().get_app_list(request, app_label)
        order = {label: i for i, label in enumerate(self.APP_ORDER)}
        return sorted(
            app_list,
            key=lambda app: (order.get(app['app_label'], len(order)), app['name']),
        )

    def index(self, request, extra_context=None):
        extra_context = {**(extra_context or {}), **self._dashboard_context()}
        return super().index(request, extra_context)

    def _dashboard_context(self):
        """Counts for the dashboard cards.

        Imported lazily: this module is loaded while the admin app is still
        booting, before the app registry is ready for model imports.
        """
        from apps.accounts.models import User
        from apps.bookings.models import Booking
        from apps.payments.models import Payment
        from apps.teachers.models import Teacher

        now = timezone.now()
        week_ago = now - timedelta(days=7)

        # Only profiles the teacher actually submitted. Every Teacher row
        # starts at 'pending', so counting status alone would pad the queue
        # with people who never finished onboarding — publishing is what
        # sets is_published and puts a profile in front of a reviewer.
        pending_teachers = Teacher.objects.filter(
            approval_status='pending', is_published=True,
        ).count()
        unsubmitted = Teacher.objects.filter(
            approval_status='pending', is_published=False,
        ).count()

        held = Payment.objects.filter(status='paid', payout_status='held').aggregate(
            n=Count('id'), total=Sum('teacher_earnings'),
        )

        paid = Payment.objects.filter(status='paid').aggregate(
            gross=Sum('amount'), fees=Sum('platform_fee'),
        )

        roles = dict(
            User.objects.values_list('role').annotate(n=Count('id')).values_list('role', 'n')
        )

        bookings_this_week = Booking.objects.filter(created_at__gte=week_ago).count()
        pending_bookings = Booking.objects.filter(status='pending').count()

        # Submitted and waiting: both filters are in TeacherAdmin.list_filter.
        PENDING_QUERY = '?approval_status__exact=pending&is_published__exact=1'

        def changelist(app, model, query=''):
            return reverse(f'admin:{app}_{model}_changelist') + query

        # Only what a person can act on — an empty list means nothing is waiting.
        needs_attention = []
        if pending_teachers:
            needs_attention.append({
                'label': 'teacher profile' + ('s' if pending_teachers != 1 else '') + ' awaiting approval',
                'count': pending_teachers,
                'url': changelist('teachers', 'teacher', PENDING_QUERY),
                'action': 'Review',
            })
        if held['n']:
            needs_attention.append({
                'label': 'payment' + ('s' if held['n'] != 1 else '') + ' held for payout',
                'count': held['n'],
                'url': changelist('payments', 'payment', '?payout_status__exact=held&status__exact=paid'),
                'action': 'Pay out',
            })

        return {
            'lulimi_stats': [
                {
                    'label': 'Awaiting approval',
                    'value': pending_teachers,
                    'hint': f'{unsubmitted} still unsubmitted' if unsubmitted else 'Submitted profiles',
                    'url': changelist('teachers', 'teacher', PENDING_QUERY),
                    'tone': 'warn' if pending_teachers else 'calm',
                },
                {
                    'label': 'Held for payout',
                    'value': f"${held['total'] or Decimal('0.00'):,.2f}",
                    'hint': f"{held['n']} payment{'' if held['n'] == 1 else 's'}",
                    'url': changelist('payments', 'payment', '?payout_status__exact=held&status__exact=paid'),
                    'tone': 'warn' if held['n'] else 'calm',
                },
                {
                    'label': 'Platform revenue',
                    'value': f"${paid['fees'] or Decimal('0.00'):,.2f}",
                    'hint': f"from ${paid['gross'] or Decimal('0.00'):,.2f} collected",
                    'url': changelist('payments', 'payment', '?status__exact=paid'),
                    'tone': 'good',
                },
                {
                    'label': 'Teachers',
                    'value': roles.get('teacher', 0),
                    'hint': f"{roles.get('learner', 0)} learners",
                    'url': changelist('teachers', 'teacher'),
                    'tone': 'calm',
                },
                {
                    'label': 'New bookings',
                    'value': bookings_this_week,
                    'hint': 'Last 7 days',
                    'url': changelist('bookings', 'booking'),
                    'tone': 'calm',
                },
                {
                    'label': 'Pending lessons',
                    'value': pending_bookings,
                    'hint': 'Awaiting a teacher',
                    'url': changelist('bookings', 'booking', '?status__exact=pending'),
                    'tone': 'calm',
                },
            ],
            'lulimi_needs_attention': needs_attention,
        }
