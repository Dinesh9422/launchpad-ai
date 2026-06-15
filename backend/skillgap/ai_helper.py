from groq import Groq
import json
import os

client = Groq(api_key=os.getenv('GROQ_API_KEY'))


def analyze_skill_gap(current_skills, target_role):
    prompt = f"""You are a career skills analyzer.

Candidate's current skills: {current_skills}
Target role: {target_role}

Analyze the skill gap and return ONLY valid JSON (no markdown, no preamble):
{{
  "matched_skills": ["skill1", "skill2"],
  "missing_skills": [
    {{"skill": "skill_name", "priority": "High/Medium/Low", "weeks_to_learn": 2, "reason": "why important"}},
    {{"skill": "skill_name", "priority": "High/Medium/Low", "weeks_to_learn": 3, "reason": "why important"}}
  ],
  "overall_readiness": <integer 0-100>,
  "summary": "<2 sentence summary>"
}}"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=800,
        )
        text = response.choices[0].message.content.strip()
        text = text.replace('```json', '').replace('```', '').strip()
        return json.loads(text)
    except Exception as e:
        print("AI Error:", e)
        return {
            "matched_skills": current_skills,
            "missing_skills": [],
            "overall_readiness": 50,
            "summary": "Unable to analyze. Please try again."
        }


def generate_roadmap(current_skills, target_role, missing_skills):
    prompt = f"""You are a career learning roadmap generator.

Target role: {target_role}
Current skills: {current_skills}
Skills to learn: {missing_skills}

Generate a 8-week learning roadmap. Return ONLY valid JSON (no markdown, no preamble):
{{
  "weeks": [
    {{
      "week": 1,
      "topic": "Topic name",
      "description": "What to learn this week",
      "resources": ["resource1", "resource2"],
      "practice_task": "Hands-on task to complete",
      "hours_needed": 10,
      "completed": false
    }}
  ]
}}

Generate exactly 8 weeks."""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
            max_tokens=2000,
        )
        text = response.choices[0].message.content.strip()
        text = text.replace('```json', '').replace('```', '').strip()
        return json.loads(text)
    except Exception as e:
        print("AI Error:", e)
        return {"weeks": []}