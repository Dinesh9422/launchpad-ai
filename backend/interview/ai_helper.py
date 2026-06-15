from groq import Groq
import json
import os

client = Groq(api_key=os.getenv('GROQ_API_KEY'))


def generate_questions(role, company, question_type, count=5, language='Python'):
    if question_type == 'technical':
        prompt = f"""You are an expert technical interviewer at {company if company else 'a top tech company'}.

Generate {count} technical interview questions for a {role} position using {language}.
Include a mix of:
- Coding problems (with expected approach)
- Data structures & algorithms questions
- {language} specific questions
- System design concepts

Return ONLY valid JSON (no markdown, no preamble):
{{
  "questions": [
    {{
      "question_text": "Write a function to reverse a linked list in {language}",
      "answer_hint": "Use iterative approach with 3 pointers: prev, current, next. Time: O(n), Space: O(1)",
      "difficulty": "medium"
    }}
  ]
}}"""
    else:
        prompt = f"""You are an expert interviewer.

Generate {count} {question_type} interview questions for:
- Role: {role}
- Company: {company if company else 'a tech company'}

Return ONLY valid JSON (no markdown, no preamble):
{{
  "questions": [
    {{
      "question_text": "question here",
      "answer_hint": "key points to cover in answer",
      "difficulty": "easy/medium/hard"
    }}
  ]
}}"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.6,
            max_tokens=1500,
        )
        text = response.choices[0].message.content.strip()
        text = text.replace('```json', '').replace('```', '').strip()
        return json.loads(text)
    except Exception as e:
        print("AI Error:", e)
        return {"questions": []}


def evaluate_answer(question, answer, role):
    prompt = f"""You are an expert interviewer evaluating a candidate's answer.

Role: {role}
Question: {question}
Candidate's Answer: {answer}

Evaluate the answer and return ONLY valid JSON (no markdown, no preamble):
{{
  "score": <integer 0-10>,
  "feedback": "detailed feedback on the answer",
  "better_answer": "what a better answer would include",
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"]
}}"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=600,
        )
        text = response.choices[0].message.content.strip()
        text = text.replace('```json', '').replace('```', '').strip()
        return json.loads(text)
    except Exception as e:
        print("AI Error:", e)
        return {
            "score": 5,
            "feedback": "Unable to evaluate. Please try again.",
            "better_answer": "",
            "strengths": [],
            "improvements": []
        }