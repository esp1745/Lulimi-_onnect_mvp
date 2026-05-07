from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
import anthropic
import os

SYSTEM_PROMPT = (
    "You are a helpful teaching assistant specializing in African languages, "
    "particularly Zambian languages (Bemba, Nyanja, Tonga, Lozi, Kaonde, Luvale, Lunda, Tumbuka) "
    "and other African languages. Help teachers create high-quality lesson materials. "
    "Be concise, practical, and culturally respectful. "
    "Always remind teachers to review AI-generated content before sharing with students."
)

PROMPT_TEMPLATES = {
    "lesson_ideas": (
        "Generate 5 practical lesson ideas for teaching {language} to {level} learners on the topic: {topic}. "
        "Format as a numbered list with a title and 2-sentence description for each idea."
    ),
    "vocabulary": (
        "Create a vocabulary practice list for {language} on the topic: {topic}. "
        "Include 10 words/phrases with their {language} form, pronunciation guide (if possible), and English meaning. "
        "Format as a table."
    ),
    "pronunciation": (
        "Write 8 pronunciation practice prompts for {language} learners at {level} level. "
        "Focus on sounds that English speakers find challenging. "
        "Include the phrase, phonetic guide, and a tip for each."
    ),
    "quiz": (
        "Draft a short quiz (10 questions) to test {level} learners on {language} topic: {topic}. "
        "Include a mix of multiple choice and fill-in-the-blank questions. Provide an answer key at the end."
    ),
    "homework": (
        "Create a homework assignment for {level} {language} learners on the topic: {topic}. "
        "Include clear instructions, 3-5 tasks, and estimated time to complete."
    ),
    "phrase_practice": (
        "I am a {level} learner of {language}. Teach me useful phrases about: {topic}. "
        "Give me the phrase in {language}, a pronunciation guide, the English meaning, and a simple example sentence."
    ),
}


class AIGenerateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        prompt_type = request.data.get('prompt_type')
        language = request.data.get('language', 'Bemba')
        topic = request.data.get('topic', '')
        level = request.data.get('level', 'beginner')
        custom_prompt = request.data.get('custom_prompt', '')

        api_key = os.getenv('ANTHROPIC_API_KEY')
        if not api_key:
            return Response({'error': 'AI assistant is not configured. Please add ANTHROPIC_API_KEY.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        if custom_prompt:
            user_message = custom_prompt
        elif prompt_type in PROMPT_TEMPLATES:
            user_message = PROMPT_TEMPLATES[prompt_type].format(
                language=language, topic=topic, level=level
            )
        else:
            return Response({'error': 'Invalid prompt_type.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            client = anthropic.Anthropic(api_key=api_key)
            message = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=1200,
                system=SYSTEM_PROMPT,
                messages=[{"role": "user", "content": user_message}],
            )
            result = message.content[0].text
            return Response({'result': result, 'prompt_used': user_message})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)


class AIPromptTypesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response([
            {'key': 'lesson_ideas', 'label': 'Lesson ideas', 'description': 'Get 5 lesson ideas for a topic', 'needs_topic': True},
            {'key': 'vocabulary', 'label': 'Vocabulary list', 'description': 'Build a vocabulary practice list', 'needs_topic': True},
            {'key': 'pronunciation', 'label': 'Pronunciation prompts', 'description': 'Create pronunciation practice exercises', 'needs_topic': False},
            {'key': 'quiz', 'label': 'Quiz / test', 'description': 'Draft a 10-question quiz', 'needs_topic': True},
            {'key': 'homework', 'label': 'Homework assignment', 'description': 'Write a homework task', 'needs_topic': True},
            {'key': 'phrase_practice', 'label': 'Phrase practice', 'description': 'Learn useful phrases on a topic', 'needs_topic': True},
        ])
