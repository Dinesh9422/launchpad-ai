from groq import Groq
import json
import os

client = Groq(api_key=os.getenv('GROQ_API_KEY'))

def generate_readiness_score(profile_data):
    prompt = f"""You are a career readiness analyzer for a job platform.

Analyze this candidate profile and return ONLY valid JSON (no markdown, no preamble, no explanation):

Profile:
- Education: {profile_data.get('education')}
- Graduation Year: {profile_data.get('graduation_year')}
- Skills: {profile_data.get('skills')}
- Target Role: {profile_data.get('target_role')}
- Experience Years: {profile_data.get('experience_years')}
- User Type: {profile_data.get('user_type')}
- Domain Background: {profile_data.get('domain_background')}

Return JSON in this exact format:
{{
  "score": <integer 0-100>,
  "strengths": ["strength1", "strength2", "strength3"],
  "weak_areas": ["weakness1", "weakness2", "weakness3"],
  "summary": "<2 sentence summary of readiness>"
}}"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=500,
        )
        text = response.choices[0].message.content.strip()
        text = text.replace('```json', '').replace('```', '').strip()
        return json.loads(text)
    except Exception as e:
        print("AI Error:", e)
        return {
            "score": 40,
            "strengths": ["Profile created successfully"],
            "weak_areas": ["Add more skills and details to get better score"],
            "summary": "Complete your profile for AI-powered insights."
        }