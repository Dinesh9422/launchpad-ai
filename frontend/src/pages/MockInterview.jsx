import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://127.0.0.1:8000/api/interview';

export default function MockInterview() {
  const { token } = useAuth();
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [questionType, setQuestionType] = useState('technical');
  const [language, setLanguage] = useState('Python');
  const [session, setSession] = useState(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pastSessions, setPastSessions] = useState([]);
  const [activeTab, setActiveTab] = useState('new');

  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const res = await axios.get(`${API_URL}/sessions/`, config);
        setPastSessions(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    loadSessions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startSession = async () => {
    if (!role) {
      alert('Enter a role first');
      return;
    }
    setLoading(true);
    setEvaluation(null);
    try {
      const res = await axios.post(`${API_URL}/session/start/`, {
        role, company, question_type: questionType, language
      }, config);
      setSession(res.data);
      setCurrentAnswer('');
    } catch (err) {
      alert('Failed to start session');
      console.error(err);
    }
    setLoading(false);
  };

  const submitAnswer = async () => {
    if (!currentAnswer.trim()) {
      alert('Type your answer first');
      return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post(
        `${API_URL}/session/${session.id}/answer/`,
        { answer: currentAnswer },
        config
      );
      setEvaluation(res.data.evaluation);
      setSession(res.data.session);
      setCurrentAnswer('');

      if (res.data.is_completed) {
        const sessRes = await axios.get(`${API_URL}/sessions/`, config);
        setPastSessions(sessRes.data);
      }
    } catch (err) {
      alert('Submit failed');
      console.error(err);
    }
    setSubmitting(false);
  };

  const currentQuestionIndex = session ? session.answers.length : 0;
  const currentQuestion = session?.questions[currentQuestionIndex];
  const isCompleted = session?.completed;

  return (
    <div style={{ maxWidth: 800, margin: '20px auto', padding: 20 }}>
      <h2>AI Mock Interview</h2>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 5, marginBottom: 20 }}>
        {['new', 'history'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding: '8px 20px', background: activeTab === tab ? '#3b4cca' : '#eee', color: activeTab === tab ? '#fff' : '#000', border: 'none', borderRadius: 5, textTransform: 'capitalize' }}>
            {tab === 'new' ? '🎯 New Interview' : '📋 History'}
          </button>
        ))}
      </div>

      {activeTab === 'new' && (
        <div>
          {/* Setup */}
          {!session && (
            <div style={{ border: '1px solid #ddd', borderRadius: 10, padding: 20, marginBottom: 20 }}>
              <h4>Setup Your Interview</h4>
              <input placeholder="Target Role (e.g. Python Developer)" value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ width: '100%', padding: 10, marginBottom: 10, boxSizing: 'border-box' }} />
              <input placeholder="Company (optional, e.g. TCS)" value={company}
                onChange={(e) => setCompany(e.target.value)}
                style={{ width: '100%', padding: 10, marginBottom: 10, boxSizing: 'border-box' }} />
              <select value={questionType} onChange={(e) => setQuestionType(e.target.value)}
                style={{ width: '100%', padding: 10, marginBottom: 10 }}>
                <option value="technical">Technical</option>
                <option value="hr">HR Round</option>
                <option value="behavioral">Behavioral</option>
              </select>
              <select value={language} onChange={(e) => setLanguage(e.target.value)}
                style={{ width: '100%', padding: 10, marginBottom: 15 }}>
                <option value="Python">Python</option>
                <option value="JavaScript">JavaScript</option>
                <option value="Java">Java</option>
                <option value="C++">C++</option>
                <option value="TypeScript">TypeScript</option>
              </select>
              <button onClick={startSession} disabled={loading}
                style={{ width: '100%', padding: 12, background: '#3b4cca', color: '#fff', border: 'none', borderRadius: 5, fontSize: 15 }}>
                {loading ? 'Generating Questions...' : '🚀 Start Interview'}
              </button>
            </div>
          )}

          {/* Active Interview */}
          {session && !isCompleted && currentQuestion && (
            <div>
              <div style={{ background: '#f0f4ff', borderRadius: 10, padding: 15, marginBottom: 15 }}>
                <p style={{ margin: 0, color: '#666', fontSize: 13 }}>
                  Question {currentQuestionIndex + 1} of {session.questions.length} |
                  Role: {session.role} {session.company && `| ${session.company}`}
                </p>
                <div style={{ background: '#ddd', borderRadius: 10, height: 8, marginTop: 8 }}>
                  <div style={{ width: `${(currentQuestionIndex / session.questions.length) * 100}%`, height: '100%', background: '#3b4cca', borderRadius: 10 }} />
                </div>
              </div>

              <div style={{ border: '1px solid #3b4cca', borderRadius: 10, padding: 20, marginBottom: 15 }}>
                <span style={{ background: currentQuestion.difficulty === 'hard' ? '#cc3b3b' : currentQuestion.difficulty === 'medium' ? '#e65100' : '#0a6640', color: '#fff', padding: '2px 8px', borderRadius: 10, fontSize: 11 }}>
                  {currentQuestion.difficulty}
                </span>
                <h3 style={{ marginTop: 10 }}>{currentQuestion.question_text}</h3>
              </div>

              {evaluation && (
                <div style={{ border: '1px solid #ddd', borderRadius: 10, padding: 15, marginBottom: 15, background: '#f9f9f9' }}>
                  <h4>Previous Answer Feedback:</h4>
                  <p><strong>Score: {evaluation.score}/10</strong></p>
                  <p>{evaluation.feedback}</p>
                  <p><strong>💡 Better answer:</strong> {evaluation.better_answer}</p>
                </div>
              )}

              <textarea placeholder="Type your answer here..." value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                onPaste={(e) => e.preventDefault()}
                style={{ width: '100%', padding: 12, height: 120, boxSizing: 'border-box', marginBottom: 10, borderRadius: 8, border: '1px solid #ddd' }} />

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={submitAnswer} disabled={submitting}
                  style={{ flex: 1, padding: 12, background: '#0a6640', color: '#fff', border: 'none', borderRadius: 5 }}>
                  {submitting ? 'Evaluating...' : '✅ Submit Answer'}
                </button>
                <button onClick={() => { setSession(null); setEvaluation(null); }}
                  style={{ padding: 12, background: '#cc3b3b', color: '#fff', border: 'none', borderRadius: 5 }}>
                  End
                </button>
              </div>
            </div>
          )}

          {/* Completed */}
          {session && isCompleted && (
            <div style={{ border: '1px solid #0a6640', borderRadius: 10, padding: 20, textAlign: 'center' }}>
              <h2>🎉 Interview Complete!</h2>
              <div style={{ fontSize: 48, fontWeight: 'bold', color: '#3b4cca' }}>{session.total_score}/10</div>
              <p>Overall Score for {session.role} {session.company && `at ${session.company}`}</p>
              <h4>Question-wise Scores:</h4>
              {session.scores.map((s, i) => (
                <div key={i} style={{ background: '#f5f5f5', borderRadius: 8, padding: 10, marginBottom: 8, textAlign: 'left' }}>
                  <p style={{ margin: 0 }}><strong>Q{i + 1}:</strong> {session.questions[i]?.question_text}</p>
                  <p style={{ margin: '5px 0' }}>Score: <strong>{s.score}/10</strong> — {s.feedback}</p>
                </div>
              ))}
              <button onClick={() => { setSession(null); setEvaluation(null); }}
                style={{ marginTop: 15, padding: '10px 30px', background: '#3b4cca', color: '#fff', border: 'none', borderRadius: 5 }}>
                Start New Interview
              </button>
            </div>
          )}
        </div>
      )}

      {/* History */}
      {activeTab === 'history' && (
        <div>
          <h4>Past Interview Sessions ({pastSessions.length})</h4>
          {pastSessions.length === 0 && <p style={{ color: '#888' }}>No sessions yet. Start your first mock interview!</p>}
          {pastSessions.map((s, i) => (
            <div key={i} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 15, marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h4 style={{ margin: 0 }}>{s.role} {s.company && `@ ${s.company}`}</h4>
                <span style={{ fontWeight: 'bold', color: '#3b4cca' }}>{s.total_score}/10</span>
              </div>
              <p style={{ margin: '5px 0', fontSize: 13, color: '#666' }}>
                {new Date(s.created_at).toLocaleDateString()} | {s.questions.length} questions |
                <span style={{ color: s.completed ? '#0a6640' : '#e65100' }}> {s.completed ? '✅ Completed' : '⏳ Incomplete'}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}