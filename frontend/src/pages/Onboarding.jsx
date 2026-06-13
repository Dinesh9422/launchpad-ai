import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://127.0.0.1:8000/api/profiles';

export default function Onboarding() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const [form, setForm] = useState({
    full_name: '',
    education: '',
    graduation_year: '',
    skills: [],
    target_role: '',
    experience_years: 0,
    domain_background: '',
    work_style: { pace: '', collaboration: '', learning: '' },
  });

  const [skillInput, setSkillInput] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addSkill = () => {
    if (skillInput.trim()) {
      setForm({ ...form, skills: [...form.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const removeSkill = (i) => {
    setForm({ ...form, skills: form.skills.filter((_, idx) => idx !== i) });
  };

  const handleWorkStyle = (key, value) => {
    setForm({ ...form, work_style: { ...form.work_style, [key]: value } });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const submitProfile = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`${API_URL}/me/`, form, config);
      const res = await axios.post(`${API_URL}/analyze/`, {}, config);
      setResult(res.data);
      setStep(5);
    } catch (err) {
      alert('Something went wrong. Try again.');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 20, border: '1px solid #ddd', borderRadius: 10 }}>
      <h2>Profile Setup ({step}/5)</h2>

      {step === 1 && (
        <div>
          <h3>Basic Info</h3>
          <input name="full_name" placeholder="Full Name" value={form.full_name} onChange={handleChange}
            style={{ width: '100%', padding: 10, marginBottom: 10 }} />
          <input name="education" placeholder="Education (e.g. B.E Computer Science)" value={form.education} onChange={handleChange}
            style={{ width: '100%', padding: 10, marginBottom: 10 }} />
          <input name="graduation_year" type="number" placeholder="Graduation Year" value={form.graduation_year} onChange={handleChange}
            style={{ width: '100%', padding: 10, marginBottom: 10 }} />
          <button onClick={nextStep} style={{ width: '100%', padding: 10, background: '#3b4cca', color: '#fff', border: 'none', borderRadius: 5 }}>Next</button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3>Your Skills</h3>
          <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
            <input placeholder="e.g. Python" value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSkill()}
              style={{ flex: 1, padding: 10 }} />
            <button onClick={addSkill} style={{ padding: '10px 15px' }}>Add</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
            {form.skills.map((s, i) => (
              <span key={i} style={{ background: '#eee', padding: '5px 10px', borderRadius: 15 }}>
                {s} <span onClick={() => removeSkill(i)} style={{ cursor: 'pointer', color: 'red' }}> ×</span>
              </span>
            ))}
          </div>
          <button onClick={prevStep} style={{ padding: 10, marginRight: 10 }}>Back</button>
          <button onClick={nextStep} style={{ padding: 10, background: '#3b4cca', color: '#fff', border: 'none', borderRadius: 5 }}>Next</button>
        </div>
      )}

      {step === 3 && (
        <div>
          <h3>Target Role & Experience</h3>
          <input name="target_role" placeholder="Target Role (e.g. Full Stack Developer)" value={form.target_role} onChange={handleChange}
            style={{ width: '100%', padding: 10, marginBottom: 10 }} />
          <input name="experience_years" type="number" placeholder="Years of Experience" value={form.experience_years} onChange={handleChange}
            style={{ width: '100%', padding: 10, marginBottom: 10 }} />
          {user?.user_type === 'switcher' && (
            <input name="domain_background" placeholder="Current Domain (e.g. Banking, Sales)" value={form.domain_background} onChange={handleChange}
              style={{ width: '100%', padding: 10, marginBottom: 10 }} />
          )}
          <button onClick={prevStep} style={{ padding: 10, marginRight: 10 }}>Back</button>
          <button onClick={nextStep} style={{ padding: 10, background: '#3b4cca', color: '#fff', border: 'none', borderRadius: 5 }}>Next</button>
        </div>
      )}

      {step === 4 && (
        <div>
          <h3>Work Style</h3>
          <p>Preferred pace:</p>
          {['Fast & intense', 'Steady & balanced'].map(opt => (
            <button key={opt} onClick={() => handleWorkStyle('pace', opt)}
              style={{ display: 'block', width: '100%', padding: 10, marginBottom: 5, background: form.work_style.pace === opt ? '#3b4cca' : '#eee', color: form.work_style.pace === opt ? '#fff' : '#000', border: 'none', borderRadius: 5 }}>
              {opt}
            </button>
          ))}
          <p>Collaboration:</p>
          {['Team player', 'Independent worker'].map(opt => (
            <button key={opt} onClick={() => handleWorkStyle('collaboration', opt)}
              style={{ display: 'block', width: '100%', padding: 10, marginBottom: 5, background: form.work_style.collaboration === opt ? '#3b4cca' : '#eee', color: form.work_style.collaboration === opt ? '#fff' : '#000', border: 'none', borderRadius: 5 }}>
              {opt}
            </button>
          ))}
          <p>Learning style:</p>
          {['Hands-on practice', 'Theory first'].map(opt => (
            <button key={opt} onClick={() => handleWorkStyle('learning', opt)}
              style={{ display: 'block', width: '100%', padding: 10, marginBottom: 5, background: form.work_style.learning === opt ? '#3b4cca' : '#eee', color: form.work_style.learning === opt ? '#fff' : '#000', border: 'none', borderRadius: 5 }}>
              {opt}
            </button>
          ))}
          <button onClick={prevStep} style={{ padding: 10, marginRight: 10, marginTop: 10 }}>Back</button>
          <button onClick={submitProfile} disabled={loading}
            style={{ padding: 10, background: '#3b4cca', color: '#fff', border: 'none', borderRadius: 5, marginTop: 10 }}>
            {loading ? 'Analyzing...' : 'Finish & Get My Score'}
          </button>
        </div>
      )}

      {step === 5 && result && (
        <div>
          <h3>Your Career Readiness Score</h3>
          <div style={{ fontSize: 48, fontWeight: 'bold', textAlign: 'center', color: '#3b4cca' }}>
            {result.readiness_score}/100
          </div>
          <p>{result.readiness_feedback.summary}</p>
          <h4>✅ Strengths</h4>
          <ul>{result.readiness_feedback.strengths?.map((s, i) => <li key={i}>{s}</li>)}</ul>
          <h4>⚠️ Areas to Improve</h4>
          <ul>{result.readiness_feedback.weak_areas?.map((s, i) => <li key={i}>{s}</li>)}</ul>
          <button onClick={() => navigate('/dashboard')} style={{ width: '100%', padding: 10, background: '#3b4cca', color: '#fff', border: 'none', borderRadius: 5, marginTop: 10 }}>
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}