import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import API_BASE from '../config';

const API_URL = `${API_BASE}/api/profiles`;

export default function Onboarding() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [skillInput, setSkillInput] = useState('');
  const [form, setForm] = useState({
    full_name: '', education: '', graduation_year: '', skills: [],
    target_role: '', experience_years: 0, domain_background: '',
    work_style: { pace: '', collaboration: '', learning: '' },
  });

  

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addSkill = () => {
    if (skillInput.trim() && !form.skills.includes(skillInput.trim())) {
      setForm({ ...form, skills: [...form.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const handleWorkStyle = (key, value) => setForm({ ...form, work_style: { ...form.work_style, [key]: value } });

  const submitProfile = async () => {
    setLoading(true);
    try {
      const config2 = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`${API_URL}/me/`, form, config2);
      const res = await axios.post(`${API_URL}/analyze/`, {}, config2);
      setResult(res.data);
      setStep(5);
      toast.success('Profile analyzed!');
    } catch { toast.error('Something went wrong. Try again.'); }
    setLoading(false);
  };

  const steps = ['Basic Info', 'Skills', 'Target Role', 'Work Style', 'Results'];

  const inputCls = "w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-transparent focus:border-indigo-500 outline-none text-sm transition-all";

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' }}>

      <div className="absolute top-20 right-20 w-72 h-72 rounded-full opacity-20 animate-pulse"
        style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
      <div className="absolute bottom-20 left-20 w-64 h-64 rounded-full opacity-15 animate-pulse"
        style={{ background: 'radial-gradient(circle, #2563eb, transparent)', animationDelay: '1s' }} />

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-3xl"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 8px 32px rgba(79,70,229,0.4)' }}>
            🚀
          </div>
          <h1 className="text-2xl font-bold text-white">Build Your Profile</h1>
          <p className="text-gray-400 text-sm mt-1">Step {step} of 5 — {steps[step - 1]}</p>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-white/10 rounded-full mb-8 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${(step / 5) * 100}%`, background: 'linear-gradient(90deg, #4f46e5, #7c3aed)' }} />
        </div>

        {/* Card */}
        <div className="rounded-3xl p-8"
          style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-white font-semibold text-lg mb-4">Basic Information</h3>
              <input name="full_name" placeholder="Full Name" value={form.full_name} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                onFocus={e => e.target.style.border = '1px solid rgba(99,102,241,0.8)'}
                onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.12)'} />
              <input name="education" placeholder="Education (e.g. B.E Computer Science)" value={form.education} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                onFocus={e => e.target.style.border = '1px solid rgba(99,102,241,0.8)'}
                onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.12)'} />
              <input name="graduation_year" type="number" placeholder="Graduation Year" value={form.graduation_year} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                onFocus={e => e.target.style.border = '1px solid rgba(99,102,241,0.8)'}
                onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.12)'} />
              <button onClick={() => setStep(2)} className="w-full py-3 rounded-xl text-white font-semibold"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>Next →</button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">Your Skills</h3>
              <div className="flex gap-2 mb-3">
                <input placeholder="Add skill (press Enter)" value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                  className="flex-1 px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
                <button onClick={addSkill} className="px-4 py-3 rounded-xl text-white font-medium text-sm"
                  style={{ background: 'rgba(99,102,241,0.4)', border: '1px solid rgba(99,102,241,0.5)' }}>Add</button>
              </div>
              <div className="flex flex-wrap gap-2 mb-6 min-h-16">
                {form.skills.map((s, i) => (
                  <span key={i} className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-white"
                    style={{ background: 'rgba(99,102,241,0.3)', border: '1px solid rgba(99,102,241,0.5)' }}>
                    {s} <button onClick={() => setForm({ ...form, skills: form.skills.filter((_, idx) => idx !== i) })} className="ml-1 opacity-60 hover:opacity-100">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl text-gray-300 font-semibold text-sm" style={{ background: 'rgba(255,255,255,0.08)' }}>← Back</button>
                <button onClick={() => setStep(3)} className="flex-1 py-3 rounded-xl text-white font-semibold" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>Next →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-white font-semibold text-lg mb-4">Target Role & Experience</h3>
              <input name="target_role" placeholder="Target Role (e.g. Full Stack Developer)" value={form.target_role} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                onFocus={e => e.target.style.border = '1px solid rgba(99,102,241,0.8)'}
                onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.12)'} />
              <input name="experience_years" type="number" placeholder="Years of Experience" value={form.experience_years} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                onFocus={e => e.target.style.border = '1px solid rgba(99,102,241,0.8)'}
                onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.12)'} />
              {user?.user_type === 'switcher' && (
                <input name="domain_background" placeholder="Current Domain (e.g. Banking)" value={form.domain_background} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
              )}
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl text-gray-300 font-semibold text-sm" style={{ background: 'rgba(255,255,255,0.08)' }}>← Back</button>
                <button onClick={() => setStep(4)} className="flex-1 py-3 rounded-xl text-white font-semibold" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>Next →</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h3 className="text-white font-semibold text-lg mb-5">Work Style</h3>
              {[
                { key: 'pace', label: 'Preferred pace', options: ['Fast & intense', 'Steady & balanced'] },
                { key: 'collaboration', label: 'Collaboration style', options: ['Team player', 'Independent worker'] },
                { key: 'learning', label: 'Learning style', options: ['Hands-on practice', 'Theory first'] },
              ].map(({ key, label, options }) => (
                <div key={key} className="mb-4">
                  <p className="text-gray-400 text-sm mb-2">{label}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {options.map(opt => (
                      <button key={opt} onClick={() => handleWorkStyle(key, opt)}
                        className="py-2.5 px-3 rounded-xl text-sm font-medium transition-all text-white"
                        style={{
                          background: form.work_style[key] === opt ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.05)',
                          border: form.work_style[key] === opt ? '1px solid rgba(99,102,241,0.8)' : '1px solid rgba(255,255,255,0.1)'
                        }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(3)} className="flex-1 py-3 rounded-xl text-gray-300 font-semibold text-sm" style={{ background: 'rgba(255,255,255,0.08)' }}>← Back</button>
                <button onClick={submitProfile} disabled={loading} className="flex-1 py-3 rounded-xl text-white font-semibold" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                  {loading ? '⏳ Analyzing...' : '🎯 Get My Score'}
                </button>
              </div>
            </div>
          )}

          {step === 5 && result && (
            <div className="text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-white font-bold text-xl mb-2">Your Career Readiness Score</h3>
              <div className="text-7xl font-bold mb-2" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {result.readiness_score}
              </div>
              <p className="text-gray-400 text-sm mb-1">out of 100</p>
              <p className="text-gray-300 text-sm mb-6">{result.readiness_feedback?.summary}</p>

              <div className="text-left space-y-3 mb-6">
                <div className="rounded-xl p-4" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
                  <p className="text-emerald-400 font-semibold text-sm mb-2">✅ Strengths</p>
                  {result.readiness_feedback?.strengths?.map((s, i) => <p key={i} className="text-gray-300 text-xs mb-1">→ {s}</p>)}
                </div>
                <div className="rounded-xl p-4" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
                  <p className="text-amber-400 font-semibold text-sm mb-2">⚠️ Areas to Improve</p>
                  {result.readiness_feedback?.weak_areas?.map((s, i) => <p key={i} className="text-gray-300 text-xs mb-1">→ {s}</p>)}
                </div>
              </div>

              <button onClick={() => navigate('/dashboard')} className="w-full py-3 rounded-xl text-white font-semibold"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                Go to Dashboard 🚀
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}