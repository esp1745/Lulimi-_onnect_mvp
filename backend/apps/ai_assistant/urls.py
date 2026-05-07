from django.urls import path
from .views import AIGenerateView, AIPromptTypesView

urlpatterns = [
    path('generate/', AIGenerateView.as_view(), name='ai-generate'),
    path('prompt-types/', AIPromptTypesView.as_view(), name='ai-prompt-types'),
]
