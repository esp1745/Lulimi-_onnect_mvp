from django.urls import path
from .views import (
    TeacherProfileView, TeacherPublicProfileView, PublishTeacherProfileView,
    MarketplaceView,
    TeacherLanguageListCreateView, TeacherLanguageDeleteView,
    TeacherReviewListView,
    TeacherPackageListCreateView, TeacherPackageDeleteView,
    AvailabilityListCreateView, AvailabilityDetailView,
    TeacherAvailabilityPublicView,
    TeacherAvailabilityCheckView,
    TeacherDashboardView,
    TeacherStudentListView,
)

urlpatterns = [
    # Profile
    path('profile/', TeacherProfileView.as_view(), name='teacher-profile'),
    path('profile/publish/', PublishTeacherProfileView.as_view(), name='teacher-publish'),
    path('<int:pk>/public/', TeacherPublicProfileView.as_view(), name='teacher-public-profile'),
    path('<int:pk>/reviews/', TeacherReviewListView.as_view(), name='teacher-reviews'),

    # Marketplace
    path('marketplace/', MarketplaceView.as_view(), name='marketplace'),

    # Languages
    path('languages/', TeacherLanguageListCreateView.as_view(), name='teacher-languages'),
    path('languages/<int:pk>/', TeacherLanguageDeleteView.as_view(), name='teacher-language-delete'),

    # Packages
    path('packages/', TeacherPackageListCreateView.as_view(), name='teacher-packages'),
    path('packages/<int:pk>/', TeacherPackageDeleteView.as_view(), name='teacher-package-delete'),

    # Availability
    path('availability/', AvailabilityListCreateView.as_view(), name='availability-list'),
    path('availability/<int:pk>/', AvailabilityDetailView.as_view(), name='availability-detail'),

    # Public availability with optional timezone conversion
    path('<int:pk>/availability/', TeacherAvailabilityPublicView.as_view(), name='teacher-availability-public'),
    path('<int:pk>/availability/check/', TeacherAvailabilityCheckView.as_view(), name='teacher-availability-check'),

    # Dashboard
    path('dashboard/', TeacherDashboardView.as_view(), name='teacher-dashboard'),
    path('students/', TeacherStudentListView.as_view(), name='teacher-students'),
]
