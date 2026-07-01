import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const API_URL = 'http://127.0.0.1:8000/api/skillgap';

export default function SkillGap() {
  const { token } = useAuth();
  const [targetRole, setTargetRole] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);
  const [gapData, setGapData] = useState(null);
  const [roadmapData, setRoadmapData] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('gap');

  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gapRes, roadmapRes] = await Promise.all([
          axios.get(`${API_URL}/analyze/`, config),
          axios.get(`${API_URL}/roadmap/`, config),
        ]);
        if (gapRes.data.gap_analysis?.matched_skills) {
          setGapData(gapRes.data);
          setSkills(gapRes.data.current_skills || []);
          setTargetRole(gapRes.data.target_role || '');
        }
        if (roadmapRes.data.weeks?.length > 0) setRoadmapData(roadmapRes.data);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchData();
  }, []); // eslint-disable-line

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const analyzeGap = async () => {
    if (!targetRole || skills.length === 0) { toast.error('Enter role and skills'); return; }
    setAnalyzing(true);
    try {
      const res = await axios.post(`${API_URL}/analyze/`, { target_role: targetRole, current_skills: skills }, config);
      setGapData(res.data);
      toast.success('Analysis complete!');
    } catch { toast.error('Analysis failed'); }
    setAnalyzing(false);
  };

  const generateRoadmap = async () => {
    if (!gapData) { toast.error('Analyze skill gap first'); return; }
    setGeneratingRoadmap(true);
    try {
      const missingSkills = gapData.gap_analysis.missing_skills?.map(s => s.skill) || [];
      const res = await axios.post(`${API_URL}/roadmap/`, { target_role: targetRole, current_skills: skills, missing_skills: missingSkills }, config);
      setRoadmapData(res.data);
      setActiveTab('roadmap');
      toast.success('Roadmap generated!');
    } catch { toast.error('Roadmap generation failed'); }
    setGeneratingRoadmap(false);
  };

  const completeWeek = async (weekNum) => {
    try {
      const res = await axios.put(`${API_URL}/roadmap/complete/${weekNum}/`, {}, config);
      setRoadmapData(res.data);
      toast.success(`Week ${weekNum} completed! 🎉`);
    } catch { console.error('error'); }
  };

  const priorityConfig = {
    High: { color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30', badge: 'bg-red-500' },
    Medium: { color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30', badge: 'bg-amber-500' },
    Low: { color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30', badge: 'bg-emerald-500' },
  };

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-gray-200 dark:bg-gray-800 rounded-2xl" />)}</div></div>;

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Skill Gap Analyzer</h1>
        <p className="text-gray-500 dark:text-gray-400">AI-powered skill analysis & personalized learning roadmap</p>
      </div>

      {/* Input */}
      <div className="rounded-2xl p-6 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Your Profile</h3>
        <input placeholder="Target Role (e.g. Full Stack Developer)" value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-transparent focus:border-indigo-500 outline-none text-sm mb-3" />
        <div className="flex gap-2 mb-3">
          <input placeholder="Add your skill (press Enter)" value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addSkill()}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-transparent focus:border-indigo-500 outline-none text-sm" />
          <button onClick={addSkill} className="px-4 py-2.5 rounded-xl text-white text-sm font-medium" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>Add</button>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {skills.map((s, i) => (
            <span key={i} className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">
              {s} <button onClick={() => setSkills(skills.filter((_, idx) => idx !== i))} className="text-indigo-400 hover:text-indigo-600 ml-1">×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={analyzeGap} disabled={analyzing}
            className="flex-1 py-3 rounded-xl text-white font-semibold text-sm"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
            {analyzing ? '⏳ Analyzing...' : '🔍 Analyze Skill Gap'}
          </button>
          {gapData && (
            <button onClick={generateRoadmap} disabled={generatingRoadmap}
              className="flex-1 py-3 rounded-xl text-white font-semibold text-sm"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
              {generatingRoadmap ? '⏳ Generating...' : '🗺️ Generate Roadmap'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      {(gapData || roadmapData) && (
        <div className="flex gap-2 mb-6">
          {[['gap', '📊 Skill Gap'], ['roadmap', '🗺️ Roadmap']].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className="px-5 py-2 rounded-xl text-sm font-semibold transition-all"
              style={activeTab === key
                ? { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white' }
                : { background: 'transparent', color: '#6b7280', border: '1px solid #e5e7eb' }}>
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Gap Results */}
      {activeTab === 'gap' && gapData?.gap_analysis && (
        <div>
          <div className="rounded-2xl p-6 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Overall Readiness</h3>
              <span className="text-2xl font-bold" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {gapData.gap_analysis.overall_readiness}%
              </span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
              <div className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${gapData.gap_analysis.overall_readiness}%`, background: 'linear-gradient(90deg, #4f46e5, #7c3aed)' }} />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{gapData.gap_analysis.summary}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl p-5 border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950">
              <h4 className="font-semibold text-emerald-700 dark:text-emerald-400 mb-3">✅ Matched Skills ({gapData.gap_analysis.matched_skills?.length})</h4>
              <div className="flex flex-wrap gap-2">
                {gapData.gap_analysis.matched_skills?.map((s, i) => (
                  <span key={i} className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">{s}</span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl p-5 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
              <h4 className="font-semibold text-red-700 dark:text-red-400 mb-3">❌ Missing Skills ({gapData.gap_analysis.missing_skills?.length})</h4>
              <div className="space-y-2">
                {gapData.gap_analysis.missing_skills?.map((s, i) => {
                  const pc = priorityConfig[s.priority] || priorityConfig['Low'];
                  return (
                    <div key={i} className={`rounded-xl p-3 ${pc.bg}`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{s.skill}</span>
                        <span className={`text-xs text-white px-2 py-0.5 rounded-full ${pc.badge}`}>{s.priority}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{s.reason} · ⏱ {s.weeks_to_learn}w</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Roadmap */}
      {activeTab === 'roadmap' && roadmapData?.weeks?.length > 0 && (
        <div>
          <div className="rounded-2xl p-5 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mb-5">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-gray-900 dark:text-white">Progress</span>
              <span className="font-bold text-indigo-600">{roadmapData.completion_percentage}%</span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
              <div className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${roadmapData.completion_percentage}%`, background: 'linear-gradient(90deg, #4f46e5, #7c3aed)' }} />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">🔥 Streak: {roadmapData.streak} days · Week {roadmapData.current_week}</p>
          </div>

          <div className="space-y-4">
            {roadmapData.weeks.map((week, i) => (
              <div key={i} className={`rounded-2xl p-5 border transition-all ${week.completed ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-1 block">Week {week.week}</span>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{week.topic}</h4>
                  </div>
                  {week.completed
                    ? <span className="text-emerald-500 font-semibold text-sm">✅ Done</span>
                    : <button onClick={() => completeWeek(week.week)}
                      className="px-4 py-1.5 rounded-xl text-white text-xs font-semibold"
                      style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                      Mark Done
                    </button>}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{week.description}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500"><strong>📚 Resources:</strong> {week.resources?.join(', ')}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1"><strong>🛠 Task:</strong> {week.practice_task}</p>
                <p className="text-xs text-gray-400 mt-1">⏱ {week.hours_needed} hrs needed</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}