import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const API_URL = 'http://127.0.0.1:8000/api/resumes';

export default function ResumeEditor() {
  const { token } = useAuth();
  const [resume, setResume] = useState({
    full_name: '', email: '', phone: '', location: '', summary: '',
    education: [], experience: [], projects: [], skills: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [improving, setImproving] = useState(false);
  const [checkingATS, setCheckingATS] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [activeSection, setActiveSection] = useState('contact');

  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchResume = async () => {
    try {
      const res = await axios.get(`${API_URL}/me/`, config);
      setResume(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchResume(); }, []); // eslint-disable-line

  const handleChange = (e) => setResume({ ...resume, [e.target.name]: e.target.value });

  const saveResume = async () => {
    setSaving(true);
    try {
      await axios.put(`${API_URL}/me/`, resume, config);
      toast.success('Resume saved!');
    } catch { toast.error('Save failed'); }
    setSaving(false);
  };

  const improveSummary = async () => {
    setImproving(true);
    try {
      await axios.put(`${API_URL}/me/`, resume, config);
      const res = await axios.post(`${API_URL}/improve-summary/`, { target_role: 'Full Stack Developer' }, config);
      setResume({ ...resume, summary: res.data.summary });
      toast.success('Summary improved!');
    } catch { toast.error('AI improvement failed'); }
    setImproving(false);
  };

  const checkATS = async () => {
    if (!jobDesc.trim()) { toast.error('Paste a job description first'); return; }
    setCheckingATS(true);
    try {
      await axios.put(`${API_URL}/me/`, resume, config);
      const res = await axios.post(`${API_URL}/ats-score/`, { job_description: jobDesc }, config);
      setResume(res.data);
      toast.success(`ATS Score: ${res.data.ats_score}%`);
    } catch { toast.error('ATS check failed'); }
    setCheckingATS(false);
  };

  const optimizeForJob = async () => {
    if (!jobDesc.trim()) { toast.error('Paste a job description first'); return; }
    setOptimizing(true);
    try {
      const res = await axios.post(`${API_URL}/optimize/`, { job_description: jobDesc }, config);
      setResume({ ...resume, summary: res.data.optimized_summary, skills: [...new Set([...resume.skills, ...res.data.suggested_skills_to_add])] });
      toast.success('Resume optimized! Save to keep changes.');
    } catch { toast.error('Optimization failed'); }
    setOptimizing(false);
  };

  const addSkill = () => {
    if (skillInput.trim()) { setResume({ ...resume, skills: [...resume.skills, skillInput.trim()] }); setSkillInput(''); }
  };

  const addEducation = () => setResume({ ...resume, education: [...resume.education, { degree: '', institution: '', year: '' }] });
  const updateEducation = (i, field, value) => { const edu = [...resume.education]; edu[i][field] = value; setResume({ ...resume, education: edu }); };
  const removeEducation = (i) => setResume({ ...resume, education: resume.education.filter((_, idx) => idx !== i) });

  const addExperience = () => setResume({ ...resume, experience: [...resume.experience, { role: '', company: '', duration: '', description: '' }] });
  const updateExperience = (i, field, value) => { const exp = [...resume.experience]; exp[i][field] = value; setResume({ ...resume, experience: exp }); };
  const removeExperience = (i) => setResume({ ...resume, experience: resume.experience.filter((_, idx) => idx !== i) });

  const addProject = () => setResume({ ...resume, projects: [...resume.projects, { title: '', description: '', tech_stack: '' }] });
  const updateProject = (i, field, value) => { const proj = [...resume.projects]; proj[i][field] = value; setResume({ ...resume, projects: proj }); };
  const removeProject = (i) => setResume({ ...resume, projects: resume.projects.filter((_, idx) => idx !== i) });

  const sections = [
    { key: 'contact', label: '👤 Contact', icon: '👤' },
    { key: 'summary', label: '📝 Summary', icon: '📝' },
    { key: 'skills', label: '🛠 Skills', icon: '🛠' },
    { key: 'education', label: '🎓 Education', icon: '🎓' },
    { key: 'experience', label: '💼 Experience', icon: '💼' },
    { key: 'projects', label: '🚀 Projects', icon: '🚀' },
    { key: 'ats', label: '📊 ATS Check', icon: '📊' },
  ];

  const inputCls = "w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-transparent focus:border-indigo-500 outline-none text-sm transition-all";
  const textareaCls = `${inputCls} resize-none`;

  if (loading) return <div className="p-8 animate-pulse space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl" />)}</div>;

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Resume Studio</h1>
          <p className="text-gray-500 dark:text-gray-400">AI-powered resume builder with ATS scoring</p>
        </div>
        <button onClick={saveResume} disabled={saving}
          className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm transition-all"
          style={{ background: 'linear-gradient(135deg, #059669, #047857)', boxShadow: '0 4px 12px rgba(5,150,105,0.3)' }}>
          {saving ? '⏳ Saving...' : '💾 Save Resume'}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Section nav */}
        <div className="hidden md:flex flex-col gap-1 w-44 shrink-0">
          {sections.map(s => (
            <button key={s.key} onClick={() => setActiveSection(s.key)}
              className={`text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeSection === s.key ? 'text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              style={activeSection === s.key ? { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' } : {}}>
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex-1 grid md:grid-cols-2 gap-6">
          {/* Editor */}
          <div className="rounded-2xl p-6 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            {/* Mobile section tabs */}
            <div className="flex gap-2 flex-wrap mb-4 md:hidden">
              {sections.map(s => (
                <button key={s.key} onClick={() => setActiveSection(s.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeSection === s.key ? 'text-white' : 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800'}`}
                  style={activeSection === s.key ? { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' } : {}}>
                  {s.icon}
                </button>
              ))}
            </div>

            {activeSection === 'contact' && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
                <input name="full_name" placeholder="Full Name" value={resume.full_name} onChange={handleChange} className={inputCls} />
                <input name="email" placeholder="Email" value={resume.email} onChange={handleChange} className={inputCls} />
                <input name="phone" placeholder="Phone" value={resume.phone} onChange={handleChange} className={inputCls} />
                <input name="location" placeholder="Location" value={resume.location} onChange={handleChange} className={inputCls} />
              </div>
            )}

            {activeSection === 'summary' && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Professional Summary</h3>
                <textarea name="summary" placeholder="Write your professional summary..." value={resume.summary} onChange={handleChange} className={`${textareaCls} h-32`} />
                <button onClick={improveSummary} disabled={improving}
                  className="mt-3 w-full py-2.5 rounded-xl text-white text-sm font-semibold"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                  {improving ? '⏳ Improving...' : '✨ Improve with AI'}
                </button>
              </div>
            )}

            {activeSection === 'skills' && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Skills</h3>
                <div className="flex gap-2 mb-3">
                  <input placeholder="Add skill (press Enter)" value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addSkill()} className={`${inputCls} flex-1`} />
                  <button onClick={addSkill} className="px-4 py-2.5 rounded-xl text-white text-sm font-medium" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {resume.skills.map((s, i) => (
                    <span key={i} className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">
                      {s} <button onClick={() => setResume({ ...resume, skills: resume.skills.filter((_, idx) => idx !== i) })} className="ml-1 text-indigo-400 hover:text-red-500">×</button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'education' && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Education</h3>
                {resume.education.map((edu, i) => (
                  <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 mb-3 space-y-2">
                    <input placeholder="Degree" value={edu.degree} onChange={(e) => updateEducation(i, 'degree', e.target.value)} className={inputCls} />
                    <input placeholder="Institution" value={edu.institution} onChange={(e) => updateEducation(i, 'institution', e.target.value)} className={inputCls} />
                    <input placeholder="Year" value={edu.year} onChange={(e) => updateEducation(i, 'year', e.target.value)} className={inputCls} />
                    <button onClick={() => removeEducation(i)} className="text-xs text-red-500 hover:text-red-700">Remove ×</button>
                  </div>
                ))}
                <button onClick={addEducation} className="w-full py-2.5 rounded-xl text-indigo-600 dark:text-indigo-400 text-sm font-medium border-2 border-dashed border-indigo-300 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-all">+ Add Education</button>
              </div>
            )}

            {activeSection === 'experience' && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Experience</h3>
                {resume.experience.map((exp, i) => (
                  <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 mb-3 space-y-2">
                    <input placeholder="Role" value={exp.role} onChange={(e) => updateExperience(i, 'role', e.target.value)} className={inputCls} />
                    <input placeholder="Company" value={exp.company} onChange={(e) => updateExperience(i, 'company', e.target.value)} className={inputCls} />
                    <input placeholder="Duration" value={exp.duration} onChange={(e) => updateExperience(i, 'duration', e.target.value)} className={inputCls} />
                    <textarea placeholder="Description" value={exp.description} onChange={(e) => updateExperience(i, 'description', e.target.value)} className={`${textareaCls} h-20`} />
                    <button onClick={() => removeExperience(i)} className="text-xs text-red-500 hover:text-red-700">Remove ×</button>
                  </div>
                ))}
                <button onClick={addExperience} className="w-full py-2.5 rounded-xl text-indigo-600 dark:text-indigo-400 text-sm font-medium border-2 border-dashed border-indigo-300 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-all">+ Add Experience</button>
              </div>
            )}

            {activeSection === 'projects' && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Projects</h3>
                {resume.projects.map((proj, i) => (
                  <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 mb-3 space-y-2">
                    <input placeholder="Project Title" value={proj.title} onChange={(e) => updateProject(i, 'title', e.target.value)} className={inputCls} />
                    <textarea placeholder="Description" value={proj.description} onChange={(e) => updateProject(i, 'description', e.target.value)} className={`${textareaCls} h-20`} />
                    <input placeholder="Tech Stack" value={proj.tech_stack} onChange={(e) => updateProject(i, 'tech_stack', e.target.value)} className={inputCls} />
                    <button onClick={() => removeProject(i)} className="text-xs text-red-500 hover:text-red-700">Remove ×</button>
                  </div>
                ))}
                <button onClick={addProject} className="w-full py-2.5 rounded-xl text-indigo-600 dark:text-indigo-400 text-sm font-medium border-2 border-dashed border-indigo-300 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-all">+ Add Project</button>
              </div>
            )}

            {activeSection === 'ats' && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">ATS Score Checker</h3>
                <textarea placeholder="Paste job description here..." value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} className={`${textareaCls} h-32 mb-3`} />
                <div className="flex gap-3 mb-4">
                  <button onClick={checkATS} disabled={checkingATS} className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #d97706, #b45309)' }}>
                    {checkingATS ? '⏳ Checking...' : '📊 Check ATS Score'}
                  </button>
                  <button onClick={optimizeForJob} disabled={optimizing} className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                    {optimizing ? '⏳ Optimizing...' : '⚡ Optimize'}
                  </button>
                </div>
                {resume.ats_score > 0 && (
                  <div className="rounded-xl p-4 bg-gray-50 dark:bg-gray-800">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-900 dark:text-white text-sm">Match Score</span>
                      <span className={`text-xl font-bold ${resume.ats_score >= 70 ? 'text-emerald-500' : resume.ats_score >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
                        {resume.ats_score}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
                      <div className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${resume.ats_score}%`, background: resume.ats_score >= 70 ? '#059669' : resume.ats_score >= 40 ? '#d97706' : '#dc2626' }} />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1"><strong>✅ Matched:</strong> {resume.ats_feedback?.matched_keywords?.join(', ')}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400"><strong>❌ Missing:</strong> {resume.ats_feedback?.missing_keywords?.join(', ')}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="rounded-2xl p-6 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Live Preview</h3>
            <h2 className="text-xl font-bold mb-1">{resume.full_name || 'Your Name'}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{[resume.email, resume.phone, resume.location].filter(Boolean).join(' · ')}</p>
            {resume.summary && <><hr className="border-gray-200 dark:border-gray-700 mb-3" /><p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{resume.summary}</p></>}
            {resume.skills.length > 0 && <><h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Skills</h4><p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{resume.skills.join(', ')}</p></>}
            {resume.education.length > 0 && <><h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Education</h4>{resume.education.map((e, i) => <p key={i} className="text-sm mb-1"><strong>{e.degree}</strong> — {e.institution} ({e.year})</p>)}</>}
            {resume.experience.length > 0 && <><h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mt-3 mb-2">Experience</h4>{resume.experience.map((e, i) => <div key={i} className="mb-2"><p className="text-sm font-semibold">{e.role} at {e.company}</p><p className="text-xs text-gray-500">{e.duration}</p><p className="text-sm text-gray-700 dark:text-gray-300">{e.description}</p></div>)}</>}
            {resume.projects.length > 0 && <><h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mt-3 mb-2">Projects</h4>{resume.projects.map((p, i) => <div key={i} className="mb-2"><p className="text-sm font-semibold">{p.title} <span className="text-xs text-gray-500 font-normal">— {p.tech_stack}</span></p><p className="text-sm text-gray-700 dark:text-gray-300">{p.description}</p></div>)}</>}
          </div>
        </div>
      </div>
    </div>
  );
}