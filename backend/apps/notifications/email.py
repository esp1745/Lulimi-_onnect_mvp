from django.core.mail import send_mail
from django.conf import settings


def _send(subject, body, to_email):
    try:
        send_mail(
            subject=subject,
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[to_email],
            fail_silently=True,
        )
    except Exception:
        pass


def send_welcome_email(user):
    _send(
        subject='Welcome to Lulimi Connect',
        body=(
            f'Hi {user.full_name},\n\n'
            'Welcome to Lulimi Connect! We\'re glad to have you.\n\n'
            'You can now explore African language teachers and start your learning journey.\n\n'
            'The Lulimi Connect Team'
        ),
        to_email=user.email,
    )


def send_booking_request_email(booking):
    teacher_user = booking.teacher.user
    _send(
        subject='New Booking Request',
        body=(
            f'Hi {teacher_user.full_name},\n\n'
            f'{booking.learner.full_name} has requested a lesson with you.\n\n'
            f'Language: {booking.language_name}\n'
            f'Date/Time: {booking.start_at.strftime("%d %b %Y at %H:%M UTC")}\n\n'
            'Log in to confirm or decline the request.\n\n'
            'The Lulimi Connect Team'
        ),
        to_email=teacher_user.email,
    )


def send_booking_confirmed_email(booking):
    _send(
        subject='Booking Confirmed',
        body=(
            f'Hi {booking.learner.full_name},\n\n'
            f'Your lesson with {booking.teacher.user.full_name} has been confirmed.\n\n'
            f'Language: {booking.language_name}\n'
            f'Date/Time: {booking.start_at.strftime("%d %b %Y at %H:%M UTC")}\n'
            + (f'Meeting link: {booking.external_meeting_link}\n' if booking.external_meeting_link else '')
            + '\nSee you then!\n\nThe Lulimi Connect Team'
        ),
        to_email=booking.learner.email,
    )


def send_booking_declined_email(booking):
    _send(
        subject='Booking Request Declined',
        body=(
            f'Hi {booking.learner.full_name},\n\n'
            f'Unfortunately your booking request with {booking.teacher.user.full_name} '
            f'on {booking.start_at.strftime("%d %b %Y at %H:%M UTC")} was declined.\n\n'
            'You can search for other available teachers on Lulimi Connect.\n\n'
            'The Lulimi Connect Team'
        ),
        to_email=booking.learner.email,
    )


def send_booking_cancelled_email(booking, cancelled_by):
    if cancelled_by == 'teacher':
        recipient = booking.learner
        other_name = booking.teacher.user.full_name
    else:
        recipient = booking.teacher.user
        other_name = booking.learner.full_name

    _send(
        subject='Booking Cancelled',
        body=(
            f'Hi {recipient.full_name},\n\n'
            f'Your lesson with {other_name} on '
            f'{booking.start_at.strftime("%d %b %Y at %H:%M UTC")} has been cancelled.\n\n'
            'The Lulimi Connect Team'
        ),
        to_email=recipient.email,
    )


def send_profile_approved_email(teacher_user):
    _send(
        subject='Your Profile Has Been Approved',
        body=(
            f'Hi {teacher_user.full_name},\n\n'
            'Great news — your teacher profile on Lulimi Connect has been approved. '
            'You are now visible to learners in the marketplace.\n\n'
            'The Lulimi Connect Team'
        ),
        to_email=teacher_user.email,
    )


def send_new_message_email(message):
    _send(
        subject=f'New message from {message.sender.full_name}',
        body=(
            f'Hi {message.recipient.full_name},\n\n'
            f'{message.sender.full_name} sent you a message on Lulimi Connect:\n\n'
            f'"{message.text}"\n\n'
            'Log in to reply.\n\n'
            'The Lulimi Connect Team'
        ),
        to_email=message.recipient.email,
    )


def send_profile_rejected_email(teacher_user):
    _send(
        subject='Profile Approval Update',
        body=(
            f'Hi {teacher_user.full_name},\n\n'
            'Thank you for applying to Lulimi Connect. Unfortunately your profile was not approved at this time. '
            'Please review our guidelines and update your profile before resubmitting.\n\n'
            'The Lulimi Connect Team'
        ),
        to_email=teacher_user.email,
    )
