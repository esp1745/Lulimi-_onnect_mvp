from django.urls import path
from .views import (
    BookingCreateView,
    LearnerBookingListView,
    TeacherBookingListView,
    BookingDetailView,
    BookingConfirmView,
    BookingDeclineView,
    BookingCancelView,
    BookingNotesView,
)

urlpatterns = [
    path('', BookingCreateView.as_view(), name='booking-create'),
    path('my/', LearnerBookingListView.as_view(), name='learner-bookings'),
    path('teaching/', TeacherBookingListView.as_view(), name='teacher-bookings'),
    path('<int:pk>/', BookingDetailView.as_view(), name='booking-detail'),
    path('<int:pk>/confirm/', BookingConfirmView.as_view(), name='booking-confirm'),
    path('<int:pk>/decline/', BookingDeclineView.as_view(), name='booking-decline'),
    path('<int:pk>/cancel/', BookingCancelView.as_view(), name='booking-cancel'),
    path('<int:pk>/notes/', BookingNotesView.as_view(), name='booking-notes'),
]
