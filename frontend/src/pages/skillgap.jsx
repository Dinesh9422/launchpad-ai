import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

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
      if (roadmapRes.data.weeks?.length > 0) {
        setRoadmapData(roadmapRes.data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (i) => setSkills(skills.filter((_, idx) => idx !== i));

  const analyzeGap = async () => {
    if (!targetRole || skills.length === 0) {
      alert('Enter target role and at least one skill');
      return;
    }
    setAnalyzing(true);
    try {
      const res = await axios.post(`${API_URL}/analyze/`, {
        target_role: targetRole,
        current_skills: skills,
      }, config);
      setGapData(res.data);
    } catch (err) {
      alert('Analysis failed');
      console.error(err);
    }
    setAnalyzing(false);
  };

  const generateRoadmap = async () => {
    if (!gapData) {
      alert('Analyze skill gap first');
      return;
    }
    setGeneratingRoadmap(true);
    try {
      const missingSkills = gapData.gap_analysis.missing_skills?.map(s => s.skill) || [];
      const res = await axios.post(`${API_URL}/roadmap/`, {
        target_role: targetRole,
        current_skills: skills,
        missing_skills: missingSkills,
      }, config);
      setRoadmapData(res.data);
      setActiveTab('roadmap');
    } catch (err) {
      alert('Roadmap generation failed');
      console.error(err);
    }
    setGeneratingRoadmap(false);
  };

  const completeWeek = async (weekNum) => {
    try {
      const res = await axios.put(`${API_URL}/roadmap/complete/${weekNum}/`, {}, config);
      setRoadmapData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getPriorityColor = (priority) => {
    if (priority === 'High') return '#cc3b3b';
    if (priority === 'Medium') return '#e65100';
    return '#0a6640';
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: 50 }}>Loading...</p>;

  return (
    <div style={{ maxWidth: 900, margin: '20px auto', padding: 20 }}>
      <h2>Skill Gap Analyzer</h2>

      {/* Input Section */}
      <div style={{ border: '1px solid #ddd', borderRadius: 10, padding: 20, marginBottom: 20 }}>
        <h4>Your Target Role & Skills</h4>
        <input placeholder="Target Role (e.g. Full Stack Developer)" value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          style={{ width: '100%', padding: 10, marginBottom: 10, boxSizing: 'border-box' }} />

        <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
          <input placeholder="Add your skill" value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addSkill()}
            style={{ flex: 1, padding: 10 }} />
          <button onClick={addSkill} style={{ padding: '10px 15px' }}>Add</button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 15 }}>
          {skills.map((s, i) => (
            <span key={i} style={{ background: '#eee', padding: '5px 10px', borderRadius: 15, color: '#000' }}>
              {s} <span onClick={() => removeSkill(i)} style={{ cursor: 'pointer', color: 'red' }}>×</span>
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={analyzeGap} disabled={analyzing}
            style={{ flex: 1, padding: 10, background: '#3b4cca', color: '#fff', border: 'none', borderRadius: 5 }}>
            {analyzing ? 'Analyzing...' : '🔍 Analyze Skill Gap'}
          </button>
          {gapData && (
            <button onClick={generateRoadmap} disabled={generatingRoadmap}
              style={{ flex: 1, padding: 10, background: '#e65100', color: '#fff', border: 'none', borderRadius: 5 }}>
              {generatingRoadmap ? 'Generating...' : '🗺️ Generate Roadmap'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      {(gapData || roadmapData) && (
        <div style={{ display: 'flex', gap: 5, marginBottom: 15 }}>
          <button onClick={() => setActiveTab('gap')}
            style={{ padding: '8px 20px', background: activeTab === 'gap' ? '#3b4cca' : '#eee', color: activeTab === 'gap' ? '#fff' : '#000', border: 'none', borderRadius: 5 }}>
            Skill Gap
          </button>
          <button onClick={() => setActiveTab('roadmap')}
            style={{ padding: '8px 20px', background: activeTab === 'roadmap' ? '#3b4cca' : '#eee', color: activeTab === 'roadmap' ? '#fff' : '#000', border: 'none', borderRadius: 5 }}>
            Learning Roadmap
          </button>
        </div>
      )}

      {/* Gap Analysis Results */}
      {activeTab === 'gap' && gapData && gapData.gap_analysis && (
        <div>
          <div style={{ background: '#f5f5f5', borderRadius: 10, padding: 15, marginBottom: 15 }}>
            <h3>Overall Readiness: <span style={{ color: '#3b4cca' }}>{gapData.gap_analysis.overall_readiness}%</span></h3>
            <div style={{ background: '#ddd', borderRadius: 10, height: 14, marginBottom: 10 }}>
              <div style={{ width: `${gapData.gap_analysis.overall_readiness}%`, height: '100%', background: '#3b4cca', borderRadius: 10 }} />
            </div>
            <p>{gapData.gap_analysis.summary}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
            <div style={{ border: '1px solid #0a6640', borderRadius: 10, padding: 15 }}>
              <h4 style={{ color: '#0a6640' }}>✅ Matched Skills ({gapData.gap_analysis.matched_skills?.length})</h4>
              {gapData.gap_analysis.matched_skills?.map((s, i) => (
                <span key={i} style={{ display: 'inline-block', background: '#d4edda', padding: '4px 10px', borderRadius: 15, margin: '3px', fontSize: 13 }}>{s}</span>
              ))}
            </div>

            <div style={{ border: '1px solid #cc3b3b', borderRadius: 10, padding: 15 }}>
              <h4 style={{ color: '#cc3b3b' }}>❌ Missing Skills ({gapData.gap_analysis.missing_skills?.length})</h4>
              {gapData.gap_analysis.missing_skills?.map((s, i) => (
                <div key={i} style={{ background: '#f5f5f5', borderRadius: 8, padding: '8px 10px', marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>{s.skill}</strong>
                    <span style={{ background: getPriorityColor(s.priority), color: '#fff', padding: '2px 8px', borderRadius: 10, fontSize: 11 }}>{s.priority}</span>
                  </div>
                  <p style={{ margin: '4px 0', fontSize: 12, color: '#555' }}>{s.reason}</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#888' }}>⏱ {s.weeks_to_learn} weeks to learn</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Roadmap */}
      {activeTab === 'roadmap' && roadmapData && roadmapData.weeks?.length > 0 && (
        <div>
          <div style={{ background: '#f5f5f5', borderRadius: 10, padding: 15, marginBottom: 15 }}>
            <h3>Learning Progress: <span style={{ color: '#3b4cca' }}>{roadmapData.completion_percentage}%</span></h3>
            <div style={{ background: '#ddd', borderRadius: 10, height: 14, marginBottom: 5 }}>
              <div style={{ width: `${roadmapData.completion_percentage}%`, height: '100%', background: '#0a6640', borderRadius: 10 }} />
            </div>
            <p style={{ margin: 0, fontSize: 13 }}>🔥 Streak: {roadmapData.streak} days | Current Week: {roadmapData.current_week}</p>
          </div>

          {roadmapData.weeks.map((week, i) => (
            <div key={i} style={{
              border: `1px solid ${week.completed ? '#0a6640' : '#ddd'}`,
              borderRadius: 10, padding: 15, marginBottom: 10,
              background: week.completed ? '#f0fff4' : '#fff'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0 }}>Week {week.week}: {week.topic}</h4>
                {week.completed
                  ? <span style={{ color: '#0a6640', fontWeight: 'bold' }}>✅ Completed</span>
                  : <button onClick={() => completeWeek(week.week)}
                    style={{ padding: '6px 15px', background: '#3b4cca', color: '#fff', border: 'none', borderRadius: 5 }}>
                    Mark Complete
                  </button>
                }
              </div>
              <p style={{ margin: '8px 0', color: '#555' }}>{week.description}</p>
              <p style={{ margin: '5px 0', fontSize: 13 }}><strong>📚 Resources:</strong> {week.resources?.join(', ')}</p>
              <p style={{ margin: '5px 0', fontSize: 13 }}><strong>🛠 Task:</strong> {week.practice_task}</p>
              <p style={{ margin: 0, fontSize: 12, color: '#888' }}>⏱ {week.hours_needed} hours needed</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}