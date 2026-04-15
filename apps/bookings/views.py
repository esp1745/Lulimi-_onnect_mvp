from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Booking
from .serializers import BookingSerializer, BookingStatusSerializer
from apps.teachers.models import Teacher


class BookingCreateView(generics.CreateAPIView):
    """Learner creates a booking request."""
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(learner=self.request.user)


class LearnerBookingListView(generics.ListAPIView):
    """Learner views their own bookings."""
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Booking.objects.filter(learner=self.request.user).order_by('-start_at')
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs


class TeacherBookingListView(generics.ListAPIView):
    """Teacher views bookings for their profile."""
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        teacher = get_object_or_404(Teacher, user=self.request.user)
        qs = Booking.objects.filter(teacher=teacher).order_by('-start_at')
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs


class BookingDetailView(generics.RetrieveAPIView):
    """View a single booking."""
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'teacher':
            return Booking.objects.filter(teacher__user=user)
        return Booking.objects.filter(learner=user)


class BookingConfirmView(APIView):
    """Teacher confirms a booking."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        booking = get_object_or_404(Booking, pk=pk, teacher__user=request.user, status='pending')
        booking.status = 'confirmed'
        meeting_link = request.data.get('external_meeting_link', '')
        if meeting_link:
            booking.external_meeting_link = meeting_link
        booking.save()
        return Response(BookingSerializer(booking).data)


class BookingDeclineView(APIView):
    """Teacher declines a booking."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        booking = get_object_or_404(Booking, pk=pk, teacher__user=request.user, status='pending')
        booking.status = 'declined'
        booking.save()
        return Response(BookingSerializer(booking).data)


class BookingCancelView(APIView):
    """Learner or teacher cancels a booking."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        user = request.user
        if user.role == 'teacher':
            booking = get_object_or_404(Booking, pk=pk, teacher__user=user)
        else:
            booking = get_object_or_404(Booking, pk=pk, learner=user)

        if booking.status not in ['pending', 'confirmed']:
            return Response({'detail': 'Cannot cancel this booking.'}, status=status.HTTP_400_BAD_REQUEST)

        booking.status = 'cancelled'
        booking.save()
        return Response(BookingSerializer(booking).data)


class BookingNotesView(APIView):
    """Teacher adds notes to a completed/confirmed lesson."""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        booking = get_object_or_404(Booking, pk=pk, teacher__user=request.user)
        notes = request.data.get('teacher_notes', '')
        booking.teacher_notes = notes
        booking.save()
        return Response(BookingSerializer(booking).data)
