import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', user_type: 'fresher' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/onboarding');
    } catch {
      setError('Registration failed. Try a different username/email.');
    }
    setLoading(false);
  };

  const userTypes = [
    { value: 'fresher', label: '🎓 Fresher', desc: '0-1 years experience' },
    { value: 'experienced', label: '💼 Experienced', desc: '2+ years experience' },
    { value: 'switcher', label: '🔄 Career Switcher', desc: 'Non-IT to IT' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-8"
      style={{ background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' }}>

      <div className="absolute top-20 right-20 w-72 h-72 rounded-full opacity-20 animate-pulse"
        style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
      <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full opacity-15 animate-pulse"
        style={{ background: 'radial-gradient(circle, #2563eb, transparent)', animationDelay: '1s' }} />

      <div className="relative z-10 w-full max-w-md mx-4 rounded-3xl p-8"
        style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>

        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-3xl"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 8px 32px rgba(79,70,229,0.4)' }}>
            🚀
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Create Account</h1>
          <p className="text-gray-400 text-sm">Start your job-ready journey</p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm text-red-300"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Username</label>
            <input name="username" placeholder="Choose a username" onChange={handleChange} required
              className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
              onFocus={e => e.target.style.border = '1px solid rgba(99,102,241,0.8)'}
              onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.12)'} />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Email</label>
            <input name="email" type="email" placeholder="your@email.com" onChange={handleChange} required
              className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
              onFocus={e => e.target.style.border = '1px solid rgba(99,102,241,0.8)'}
              onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.12)'} />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Password</label>
            <input name="password" type="password" placeholder="Create a password" onChange={handleChange} required
              className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
              onFocus={e => e.target.style.border = '1px solid rgba(99,102,241,0.8)'}
              onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.12)'} />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">I am a...</label>
            <div className="grid grid-cols-3 gap-2">
              {userTypes.map(type => (
                <button key={type.value} type="button"
                  onClick={() => setForm({ ...form, user_type: type.value })}
                  className="p-3 rounded-xl text-center transition-all"
                  style={{
                    background: form.user_type === type.value ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)',
                    border: form.user_type === type.value ? '1px solid rgba(99,102,241,0.8)' : '1px solid rgba(255,255,255,0.1)'
                  }}>
                  <div className="text-lg mb-1">{type.label.split(' ')[0]}</div>
                  <div className="text-xs text-gray-300 font-medium">{type.label.split(' ').slice(1).join(' ')}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{type.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold transition-all mt-2"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 8px 24px rgba(79,70,229,0.4)' }}
            onMouseEnter={e => e.target.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.target.style.transform = 'translateY(0)'}>
            {loading ? 'Creating account...' : 'Get Started →'}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}