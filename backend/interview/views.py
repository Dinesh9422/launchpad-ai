from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Question, MockSession
from .serializers import QuestionSerializer, MockSessionSerializer
from .ai_helper import generate_questions, evaluate_answer


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def questions_view(request):
    if request.method == 'GET':
        role = request.GET.get('role', '')
        company = request.GET.get('company', '')
        question_type = request.GET.get('type', '')
        difficulty = request.GET.get('difficulty', '')

        queryset = Question.objects.all()
        if role:
            queryset = queryset.filter(role__icontains=role)
        if company:
            queryset = queryset.filter(company__icontains=company)
        if question_type:
            queryset = queryset.filter(question_type=question_type)
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)

        return Response(QuestionSerializer(queryset[:20], many=True).data)

    if request.method == 'POST':
        role = request.data.get('role', '')
        company = request.data.get('company', '')
        question_type = request.data.get('question_type', 'technical')
        language = request.data.get('language', 'Python')

        result = generate_questions(role, company, question_type, count=5, language=language)
        questions = result.get('questions', [])

        saved = []
        for q in questions:
            question = Question.objects.create(
                role=role,
                company=company,
                question_text=q.get('question_text', ''),
                answer_hint=q.get('answer_hint', ''),
                question_type=question_type,
                difficulty=q.get('difficulty', 'medium')
            )
            saved.append(question)

        return Response(QuestionSerializer(saved, many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_mock_session(request):
    role = request.data.get('role', '')
    company = request.data.get('company', '')
    question_type = request.data.get('question_type', 'technical')
    language = request.data.get('language', 'Python')

    result = generate_questions(role, company, question_type, count=5, language=language)
    questions = result.get('questions', [])

    session = MockSession.objects.create(
        user=request.user,
        role=role,
        company=company,
        questions=questions,
        answers=[],
        scores=[],
        total_score=0,
        completed=False
    )

    return Response(MockSessionSerializer(session).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_answer(request, session_id):
    try:
        session = MockSession.objects.get(id=session_id, user=request.user)
    except MockSession.DoesNotExist:
        return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)

    answer = request.data.get('answer', '')
    question_index = len(session.answers)

    if question_index >= len(session.questions):
        return Response({'error': 'All questions answered'}, status=status.HTTP_400_BAD_REQUEST)

    current_question = session.questions[question_index]
    evaluation = evaluate_answer(
        current_question.get('question_text', ''),
        answer,
        session.role
    )

    answers = session.answers + [answer]
    scores = session.scores + [evaluation]

    is_completed = len(answers) >= len(session.questions)
    total = int(sum(s.get('score', 0) for s in scores) / len(scores)) if scores else 0

    session.answers = answers
    session.scores = scores
    session.total_score = total
    session.completed = is_completed
    session.save()

    return Response({
        'evaluation': evaluation,
        'session': MockSessionSerializer(session).data,
        'is_completed': is_completed,
        'questions_remaining': len(session.questions) - len(answers)
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_sessions(request):
    sessions = MockSession.objects.filter(user=request.user).order_by('-created_at')
    return Response(MockSessionSerializer(sessions, many=True).data)