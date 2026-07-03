import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import API_BASE from '../config';

const API_URL = `${API_BASE}/api`;

function AnimatedCounter({ target, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count}</span>;
}

function Card3D({ children, className = '' }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02,1.02,1.02)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{ transition: 'transform 0.15s ease', transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    axios.get(`${API_URL}/insights/stats/`, config).then(r => setStats(r.data)).catch(() => {});
    axios.get(`${API_URL}/profiles/me/`, config).then(r => setProfile(r.data)).catch(() => {});
  }, []);

  const statCards = [
    { label: 'Career Score', value: profile?.readiness_score || 0, suffix: '/100', icon: '🎯', gradient: 'from-violet-600 to-indigo-600', glow: 'shadow-violet-500/30' },
    { label: 'Applications', value: stats?.total_applications || 0, suffix: '', icon: '📨', gradient: 'from-blue-600 to-cyan-600', glow: 'shadow-blue-500/30' },
    { label: 'Interview Rate', value: stats?.interview_rate || 0, suffix: '%', icon: '🎤', gradient: 'from-emerald-600 to-teal-600', glow: 'shadow-emerald-500/30' },
    { label: 'Mock Score', value: stats?.avg_mock_interview_score || 0, suffix: '/10', icon: '⭐', gradient: 'from-amber-500 to-orange-600', glow: 'shadow-amber-500/30' },
  ];

  const quickLinks = [
    { label: 'Build Resume', icon: '📄', path: '/resume', desc: 'AI-powered resume studio', color: 'from-pink-500 to-rose-600' },
    { label: 'Find Jobs', icon: '🔍', path: '/jobs', desc: 'Search 150+ openings', color: 'from-blue-500 to-indigo-600' },
    { label: 'Skill Gap', icon: '📈', path: '/skillgap', desc: 'AI skill analysis', color: 'from-emerald-500 to-teal-600' },
    { label: 'Mock Interview', icon: '🎯', path: '/interview', desc: 'Practice with AI', color: 'from-purple-500 to-violet-600' },
    { label: 'Track Apps', icon: '📋', path: '/tracker', desc: 'Kanban board', color: 'from-amber-500 to-orange-600' },
    { label: 'Insights', icon: '📊', path: '/insights', desc: 'Career analytics', color: 'from-cyan-500 to-blue-600' },
  ];

  return (
    <div className="min-h-screen p-6 md:p-8">
      {/* Hero section */}
      <div className="relative overflow-hidden rounded-2xl mb-8 p-8"
        style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #2563eb 100%)' }}>
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #a78bfa, transparent)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #60a5fa, transparent)', transform: 'translate(-20%, 20%)' }} />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-indigo-200 text-sm font-medium mb-1">Welcome back 👋</p>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{user?.username}</h1>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-medium text-white"
                style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                {user?.user_type === 'fresher' ? '🎓 Fresher' : user?.user_type === 'experienced' ? '💼 Experienced' : '🔄 Career Switcher'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium text-white"
                style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                {user?.email}
              </span>
            </div>
          </div>

          {/* Readiness ring */}
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                <circle cx="48" cy="48" r="40" fill="none" stroke="white" strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - (profile?.readiness_score || 0) / 100)}`}
                  strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.5s ease' }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">{profile?.readiness_score || 0}</span>
                <span className="text-xs text-indigo-200">Score</span>
              </div>
            </div>
            <p className="text-xs text-indigo-200 mt-1">Career Readiness</p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <Card3D key={i} className={`rounded-2xl p-5 bg-gradient-to-br ${card.gradient} shadow-xl ${card.glow}`}>
            <div className="flex justify-between items-start mb-3">
              <span className="text-2xl">{card.icon}</span>
              <span className="text-xs text-white/70 font-medium">{card.label}</span>
            </div>
            <div className="text-3xl font-bold text-white">
              <AnimatedCounter target={Number(card.value)} />
              <span className="text-lg">{card.suffix}</span>
            </div>
          </Card3D>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {quickLinks.map((link, i) => (
            <Card3D key={i}
              className="cursor-pointer rounded-2xl p-5 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-indigo-500 dark:hover:border-indigo-500"
              onClick={() => navigate(link.path)}>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center text-xl mb-3 shadow-lg`}>
                {link.icon}
              </div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{link.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{link.desc}</p>
            </Card3D>
          ))}
        </div>
      </div>

      {/* Profile feedback */}
      {profile?.readiness_feedback?.strengths && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl p-5 border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950">
            <h3 className="font-semibold text-emerald-700 dark:text-emerald-400 mb-3">✅ Your Strengths</h3>
            <ul className="space-y-2">
              {profile.readiness_feedback.strengths.map((s, i) => (
                <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">→</span>{s}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl p-5 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950">
            <h3 className="font-semibold text-amber-700 dark:text-amber-400 mb-3">⚠️ Areas to Improve</h3>
            <ul className="space-y-2">
              {profile.readiness_feedback.weak_areas?.map((s, i) => (
                <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">→</span>{s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}