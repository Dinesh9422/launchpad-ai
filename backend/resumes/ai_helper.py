from groq import Groq
import json
import os

client = Groq(api_key=os.getenv('GROQ_API_KEY'))


def improve_summary(current_summary, target_role, skills):
    prompt = f"""Rewrite this resume summary to be professional and impactful for a {target_role} role.
Skills: {skills}
Current summary: "{current_summary}"

Return ONLY the improved summary text (2-3 sentences), no quotes, no markdown, no explanation."""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.6,
            max_tokens=200,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print("AI Error:", e)
        return current_summary


def calculate_ats_score(resume_data, job_description):
    prompt = f"""You are an ATS (Applicant Tracking System) resume scorer.

Resume data:
- Summary: {resume_data.get('summary')}
- Skills: {resume_data.get('skills')}
- Experience: {resume_data.get('experience')}
- Projects: {resume_data.get('projects')}

Job Description:
{job_description}

Compare the resume against the job description. Return ONLY valid JSON (no markdown, no preamble):
{{
  "match_percentage": <integer 0-100>,
  "missing_keywords": ["keyword1", "keyword2", "keyword3"],
  "matched_keywords": ["keyword1", "keyword2"],
  "suggestions": ["suggestion1", "suggestion2"]
}}"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=500,
        )
        text = response.choices[0].message.content.strip()
        text = text.replace('```json', '').replace('```', '').strip()
        return json.loads(text)
    except Exception as e:
        print("AI Error:", e)
        return {
            "match_percentage": 50,
            "missing_keywords": [],
            "matched_keywords": [],
            "suggestions": ["Unable to analyze. Try again."]
        }


def optimize_resume_for_job(resume_data, job_description):
    prompt = f"""You are a resume optimization expert.

Current resume:
- Summary: {resume_data.get('summary')}
- Skills: {resume_data.get('skills')}

Job Description:
{job_description}

Rewrite the summary and suggest additional skills to add, optimized for this job. Return ONLY valid JSON:
{{
  "optimized_summary": "<rewritten summary>",
  "suggested_skills_to_add": ["skill1", "skill2"]
}}"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=400,
        )
        text = response.choices[0].message.content.strip()
        text = text.replace('```json', '').replace('```', '').strip()
        return json.loads(text)
    except Exception as e:
        print("AI Error:", e)
        return {
            "optimized_summary": resume_data.get('summary'),
            "suggested_skills_to_add": []
        }