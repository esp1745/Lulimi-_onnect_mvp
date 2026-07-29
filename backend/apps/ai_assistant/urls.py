from django.urls import path
from .views import AIGenerateView, AIPromptTypesView, BookingsChatView

urlpatterns = [
    path('generate/', AIGenerateView.as_view(), name='ai-generate'),
    path('prompt-types/', AIPromptTypesView.as_view(), name='ai-prompt-types'),
    path('bookings-chat/', BookingsChatView.as_view(), name='ai-bookings-chat'),
]
