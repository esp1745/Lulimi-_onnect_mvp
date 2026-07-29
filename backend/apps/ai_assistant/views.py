from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.utils import timezone as dj_timezone
import anthropic
import json
import os
from . import tools as ai_tools

CHAT_MODEL = "claude-haiku-4-5-20251001"

TEACHER_SYSTEM_PROMPT = (
    "You are a helpful teaching assistant specializing in African languages, "
    "particularly Zambian languages (Bemba, Nyanja, Tonga, Lozi, Kaonde, Luvale, Lunda, Tumbuka) "
    "and other African languages. Help teachers create high-quality lesson materials. "
    "Be concise, practical, and culturally respectful. "
    "Always remind teachers to review AI-generated content before sharing with students."
)

LEARNER_SYSTEM_PROMPT = (
    "You are a friendly, encouraging language-learning assistant specializing in African languages, "
    "particularly Zambian languages (Bemba, Nyanja, Tonga, Lozi, Kaonde, Luvale, Lunda, Tumbuka) "
    "and other African languages. You are talking directly to a learner practicing on their own — "
    "speak to them in second person ('you'), be patient and encouraging, and keep explanations simple "
    "and practical for self-study. Be concise and culturally respectful. "
    "Gently remind them to double-check tricky pronunciation with their teacher."
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

        system_prompt = TEACHER_SYSTEM_PROMPT if request.user.role == 'teacher' else LEARNER_SYSTEM_PROMPT

        try:
            client = anthropic.Anthropic(api_key=api_key)
            message = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=1200,
                system=system_prompt,
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


def _content_to_dicts(content_blocks):
    result = []
    for block in content_blocks:
        if block.type == 'text':
            result.append({'type': 'text', 'text': block.text})
        elif block.type == 'tool_use':
            result.append({'type': 'tool_use', 'id': block.id, 'name': block.name, 'input': block.input})
    return result


def _bookings_system_prompt(user):
    now = dj_timezone.now()
    return (
        f"You are a helpful booking assistant for {user.full_name}, a language learner on Lulimi Connect. "
        f"Their account timezone is {user.timezone or 'UTC'}. The current date/time is {now.isoformat()} (UTC) — "
        "use this to resolve relative dates like 'tomorrow' or 'next Tuesday'. "
        "Help them view their bookings, find teachers, check a teacher's availability, request a lesson, or cancel one. "
        "Always call check_teacher_availability before request_booking. "
        "Always pass ISO 8601 datetimes in UTC to tools. Be concise and friendly. "
        "A request_booking call only creates a pending request — the teacher still has to confirm it, same as the normal app."
    )


def _run_bookings_loop(user, messages, api_key):
    client = anthropic.Anthropic(api_key=api_key)
    system_prompt = _bookings_system_prompt(user)

    for _ in range(6):  # safety cap on tool round-trips per request
        response = client.messages.create(
            model=CHAT_MODEL, max_tokens=1200, system=system_prompt,
            messages=messages, tools=ai_tools.TOOL_SCHEMAS,
        )
        content = _content_to_dicts(response.content)
        messages = messages + [{'role': 'assistant', 'content': content}]

        tool_use_blocks = [b for b in content if b['type'] == 'tool_use']
        if not tool_use_blocks:
            return {'status': 'ok', 'messages': messages}

        write_block = next((b for b in tool_use_blocks if b['name'] in ai_tools.WRITE_TOOLS), None)
        if write_block:
            return {
                'status': 'confirm_required',
                'messages': messages,
                'confirmation': {
                    'tool_use_id': write_block['id'],
                    'tool_name': write_block['name'],
                    'tool_input': write_block['input'],
                    'summary': ai_tools.describe_write_tool(write_block['name'], write_block['input']),
                },
            }

        tool_results = [
            {'type': 'tool_result', 'tool_use_id': b['id'], 'content': json.dumps(ai_tools.execute_read_tool(user, b['name'], b['input']))}
            for b in tool_use_blocks
        ]
        messages = messages + [{'role': 'user', 'content': tool_results}]

    return {'status': 'ok', 'messages': messages}


class BookingsChatView(APIView):
    """Learner-only conversational assistant that can look up and (with confirmation) act on bookings."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'learner':
            return Response({'error': 'This assistant is only available to learners.'}, status=status.HTTP_403_FORBIDDEN)

        api_key = os.getenv('ANTHROPIC_API_KEY')
        if not api_key:
            return Response({'error': 'AI assistant is not configured. Please add ANTHROPIC_API_KEY.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        messages = request.data.get('messages', [])
        confirm = request.data.get('confirm')

        try:
            if confirm:
                if confirm.get('approved'):
                    result_payload = ai_tools.execute_write_tool(request.user, confirm['tool_name'], confirm['tool_input'])
                else:
                    result_payload = {'declined': True, 'message': 'The user chose not to proceed with this action.'}
                tool_result = [{'type': 'tool_result', 'tool_use_id': confirm['tool_use_id'], 'content': json.dumps(result_payload)}]
                messages = messages + [{'role': 'user', 'content': tool_result}]
                result = _run_bookings_loop(request.user, messages, api_key)
            else:
                result = _run_bookings_loop(request.user, messages, api_key)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)

        return Response(result)
