import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

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
  const [skillInput, setSkillInput] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [checkingATS, setCheckingATS] = useState(false);
  const [optimizing, setOptimizing] = useState(false);

  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchResume = async () => {
    try {
      const res = await axios.get(`${API_URL}/me/`, config);
      setResume(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchResume();
  }, []);

  const handleChange = (e) => setResume({ ...resume, [e.target.name]: e.target.value });

  const saveResume = async () => {
    setSaving(true);
    try {
      await axios.put(`${API_URL}/me/`, resume, config);
      alert('Resume saved!');
    } catch (err) {
      alert('Save failed');
      console.error(err);
    }
    setSaving(false);
  };

  const improveSummary = async () => {
    setImproving(true);
    try {
      await axios.put(`${API_URL}/me/`, resume, config);
      const res = await axios.post(`${API_URL}/improve-summary/`, { target_role: 'Full Stack Developer' }, config);
      setResume({ ...resume, summary: res.data.summary });
    } catch (err) {
      alert('AI improvement failed');
      console.error(err);
    }
    setImproving(false);
  };

  const checkATS = async () => {
    if (!jobDesc.trim()) {
      alert('Paste a job description first');
      return;
    }
    setCheckingATS(true);
    try {
      await axios.put(`${API_URL}/me/`, resume, config);
      const res = await axios.post(`${API_URL}/ats-score/`, { job_description: jobDesc }, config);
      setResume(res.data);
    } catch (err) {
      alert('ATS check failed');
      console.error(err);
    }
    setCheckingATS(false);
  };

  const optimizeForJob = async () => {
    if (!jobDesc.trim()) {
      alert('Paste a job description first');
      return;
    }
    setOptimizing(true);
    try {
      const res = await axios.post(`${API_URL}/optimize/`, { job_description: jobDesc }, config);
      setResume({
        ...resume,
        summary: res.data.optimized_summary,
        skills: [...new Set([...resume.skills, ...res.data.suggested_skills_to_add])]
      });
      alert('Resume optimized! Skills and summary updated. Click Save to keep changes.');
    } catch (err) {
      alert('Optimization failed');
      console.error(err);
    }
    setOptimizing(false);
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      setResume({ ...resume, skills: [...resume.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const removeSkill = (i) => {
    setResume({ ...resume, skills: resume.skills.filter((_, idx) => idx !== i) });
  };

  // Education handlers
  const addEducation = () => {
    setResume({ ...resume, education: [...resume.education, { degree: '', institution: '', year: '' }] });
  };
  const updateEducation = (i, field, value) => {
    const edu = [...resume.education];
    edu[i][field] = value;
    setResume({ ...resume, education: edu });
  };
  const removeEducation = (i) => {
    setResume({ ...resume, education: resume.education.filter((_, idx) => idx !== i) });
  };

  // Experience handlers
  const addExperience = () => {
    setResume({ ...resume, experience: [...resume.experience, { role: '', company: '', duration: '', description: '' }] });
  };
  const updateExperience = (i, field, value) => {
    const exp = [...resume.experience];
    exp[i][field] = value;
    setResume({ ...resume, experience: exp });
  };
  const removeExperience = (i) => {
    setResume({ ...resume, experience: resume.experience.filter((_, idx) => idx !== i) });
  };

  // Projects handlers
  const addProject = () => {
    setResume({ ...resume, projects: [...resume.projects, { title: '', description: '', tech_stack: '' }] });
  };
  const updateProject = (i, field, value) => {
    const proj = [...resume.projects];
    proj[i][field] = value;
    setResume({ ...resume, projects: proj });
  };
  const removeProject = (i) => {
    setResume({ ...resume, projects: resume.projects.filter((_, idx) => idx !== i) });
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: 50 }}>Loading resume...</p>;

  return (
    <div style={{ display: 'flex', gap: 20, maxWidth: 1100, margin: '20px auto', padding: 20 }}>
      {/* EDITOR */}
      <div style={{ flex: 1, border: '1px solid #ddd', borderRadius: 10, padding: 20 }}>
        <h2>Resume Editor</h2>

        <h4>Contact Info</h4>
        <input name="full_name" placeholder="Full Name" value={resume.full_name} onChange={handleChange} style={inputStyle} />
        <input name="email" placeholder="Email" value={resume.email} onChange={handleChange} style={inputStyle} />
        <input name="phone" placeholder="Phone" value={resume.phone} onChange={handleChange} style={inputStyle} />
        <input name="location" placeholder="Location" value={resume.location} onChange={handleChange} style={inputStyle} />

        <h4>Summary</h4>
        <textarea name="summary" placeholder="Professional summary..." value={resume.summary} onChange={handleChange}
          style={{ ...inputStyle, height: 80 }} />
        <button onClick={improveSummary} disabled={improving} style={aiBtnStyle}>
          {improving ? 'Improving...' : '✨ Improve with AI'}
        </button>

        <h4>Skills</h4>
        <div style={{ display: 'flex', gap: 5, marginBottom: 5 }}>
          <input placeholder="Add skill" value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addSkill()} style={{ flex: 1, padding: 8 }} />
          <button onClick={addSkill}>Add</button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
          {resume.skills.map((s, i) => (
            <span key={i} style={chipStyle}>{s} <span onClick={() => removeSkill(i)} style={{ cursor: 'pointer', color: 'red' }}> ×</span></span>
          ))}
        </div>

        <h4>Education</h4>
        {resume.education.map((edu, i) => (
          <div key={i} style={cardStyle}>
            <input placeholder="Degree" value={edu.degree} onChange={(e) => updateEducation(i, 'degree', e.target.value)} style={inputStyle} />
            <input placeholder="Institution" value={edu.institution} onChange={(e) => updateEducation(i, 'institution', e.target.value)} style={inputStyle} />
            <input placeholder="Year" value={edu.year} onChange={(e) => updateEducation(i, 'year', e.target.value)} style={inputStyle} />
            <button onClick={() => removeEducation(i)} style={removeBtnStyle}>Remove</button>
          </div>
        ))}
        <button onClick={addEducation} style={addBtnStyle}>+ Add Education</button>

        <h4>Experience</h4>
        {resume.experience.map((exp, i) => (
          <div key={i} style={cardStyle}>
            <input placeholder="Role" value={exp.role} onChange={(e) => updateExperience(i, 'role', e.target.value)} style={inputStyle} />
            <input placeholder="Company" value={exp.company} onChange={(e) => updateExperience(i, 'company', e.target.value)} style={inputStyle} />
            <input placeholder="Duration" value={exp.duration} onChange={(e) => updateExperience(i, 'duration', e.target.value)} style={inputStyle} />
            <textarea placeholder="Description" value={exp.description} onChange={(e) => updateExperience(i, 'description', e.target.value)} style={{ ...inputStyle, height: 60 }} />
            <button onClick={() => removeExperience(i)} style={removeBtnStyle}>Remove</button>
          </div>
        ))}
        <button onClick={addExperience} style={addBtnStyle}>+ Add Experience</button>

        <h4>Projects</h4>
        {resume.projects.map((proj, i) => (
          <div key={i} style={cardStyle}>
            <input placeholder="Project Title" value={proj.title} onChange={(e) => updateProject(i, 'title', e.target.value)} style={inputStyle} />
            <textarea placeholder="Description" value={proj.description} onChange={(e) => updateProject(i, 'description', e.target.value)} style={{ ...inputStyle, height: 60 }} />
            <input placeholder="Tech Stack" value={proj.tech_stack} onChange={(e) => updateProject(i, 'tech_stack', e.target.value)} style={inputStyle} />
            <button onClick={() => removeProject(i)} style={removeBtnStyle}>Remove</button>
          </div>
        ))}
        <button onClick={addProject} style={addBtnStyle}>+ Add Project</button>

        <h4>ATS Score Checker</h4>
        <textarea placeholder="Paste job description here..." value={jobDesc} onChange={(e) => setJobDesc(e.target.value)}
          style={{ ...inputStyle, height: 100 }} />
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <button onClick={checkATS} disabled={checkingATS} style={{ ...aiBtnStyle, flex: 1, background: '#e65100' }}>
            {checkingATS ? 'Checking...' : '📊 Check ATS Score'}
          </button>
          <button onClick={optimizeForJob} disabled={optimizing} style={{ ...aiBtnStyle, flex: 1 }}>
            {optimizing ? 'Optimizing...' : '⚡ Optimize for Job'}
          </button>
        </div>

        {resume.ats_score > 0 && (
          <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, marginBottom: 10 }}>
            <h4>Match Score: <span style={{ color: resume.ats_score >= 70 ? 'green' : resume.ats_score >= 40 ? 'orange' : 'red' }}>{resume.ats_score}%</span></h4>
            <div style={{ background: '#eee', borderRadius: 10, height: 12, marginBottom: 10 }}>
              <div style={{
                width: `${resume.ats_score}%`, height: '100%', borderRadius: 10,
                background: resume.ats_score >= 70 ? 'green' : resume.ats_score >= 40 ? 'orange' : 'red'
              }} />
            </div>
            <p><strong>✅ Matched Keywords:</strong> {resume.ats_feedback.matched_keywords?.join(', ') || 'None'}</p>
            <p><strong>❌ Missing Keywords:</strong> {resume.ats_feedback.missing_keywords?.join(', ') || 'None'}</p>
            <p><strong>💡 Suggestions:</strong></p>
            <ul>{resume.ats_feedback.suggestions?.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </div>
        )}

        <button onClick={saveResume} disabled={saving} style={{ ...aiBtnStyle, background: '#0a6640', marginTop: 20, width: '100%' }}>
          {saving ? 'Saving...' : 'Save Resume'}
        </button>
      </div>

      {/* PREVIEW */}
      <div style={{ flex: 1, border: '1px solid #ddd', borderRadius: 10, padding: 20, background: '#fff', color: '#000' }}>
        <h2>{resume.full_name || 'Your Name'}</h2>
        <p>{resume.email} | {resume.phone} | {resume.location}</p>
        <hr />
        <h4>Summary</h4>
        <p>{resume.summary || 'Your summary will appear here...'}</p>
        <h4>Skills</h4>
        <p>{resume.skills.join(', ')}</p>
        <h4>Education</h4>
        {resume.education.map((edu, i) => (
          <p key={i}><strong>{edu.degree}</strong> — {edu.institution} ({edu.year})</p>
        ))}
        <h4>Experience</h4>
        {resume.experience.map((exp, i) => (
          <div key={i}>
            <p><strong>{exp.role}</strong> at {exp.company} ({exp.duration})</p>
            <p>{exp.description}</p>
          </div>
        ))}
        <h4>Projects</h4>
        {resume.projects.map((proj, i) => (
          <div key={i}>
            <p><strong>{proj.title}</strong> — {proj.tech_stack}</p>
            <p>{proj.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', padding: 8, marginBottom: 8, boxSizing: 'border-box' };
const chipStyle = { background: '#eee', padding: '5px 10px', borderRadius: 15, color: '#000' };
const cardStyle = { border: '1px solid #eee', padding: 10, marginBottom: 10, borderRadius: 5 };
const addBtnStyle = { padding: '8px 15px', marginBottom: 15, background: '#3b4cca', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer' };
const removeBtnStyle = { padding: '5px 10px', background: '#cc3b3b', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer' };
const aiBtnStyle = { padding: '8px 15px', background: '#3b4cca', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer', marginBottom: 10 };