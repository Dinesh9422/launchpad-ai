import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import API_BASE from '../config';

const API_URL = `${API_BASE}/api/interview`;

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
      } catch (err) { console.error(err); }
    };
    loadSessions();
  }, []); // eslint-disable-line

  const startSession = async () => {
    if (!role) { toast.error('Enter a role first'); return; }
    setLoading(true);
    setEvaluation(null);
    try {
      const res = await axios.post(`${API_URL}/session/start/`, { role, company, question_type: questionType, language }, config);
      setSession(res.data);
      setCurrentAnswer('');
      toast.success('Interview started!');
    } catch { toast.error('Failed to start session'); }
    setLoading(false);
  };

  const submitAnswer = async () => {
    if (!currentAnswer.trim()) { toast.error('Type your answer first'); return; }
    setSubmitting(true);
    try {
      const res = await axios.post(`${API_URL}/session/${session.id}/answer/`, { answer: currentAnswer }, config);
      setEvaluation(res.data.evaluation);
      setSession(res.data.session);
      setCurrentAnswer('');
      if (res.data.is_completed) {
        const sessRes = await axios.get(`${API_URL}/sessions/`, config);
        setPastSessions(sessRes.data);
        toast.success('Interview complete!');
      }
    } catch { toast.error('Submit failed'); }
    setSubmitting(false);
  };

  const currentQuestionIndex = session ? session.answers.length : 0;
  const currentQuestion = session?.questions[currentQuestionIndex];
  const isCompleted = session?.completed;

  const scoreColor = (score) => {
    if (score >= 8) return 'text-emerald-500';
    if (score >= 5) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">AI Mock Interview</h1>
        <p className="text-gray-500 dark:text-gray-400">Practice with AI — get scored and feedback instantly</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[['new', '🎯 New Interview'], ['history', '📋 History']].map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className="px-5 py-2 rounded-xl text-sm font-semibold transition-all"
            style={activeTab === key
              ? { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white' }
              : { background: 'transparent', color: '#6b7280', border: '1px solid #e5e7eb' }}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'new' && (
        <div className="max-w-2xl">
          {/* Setup */}
          {!session && (
            <div className="rounded-2xl p-6 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Setup Your Interview</h3>
              <div className="space-y-3">
                <input placeholder="Target Role (e.g. Python Developer)" value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-transparent focus:border-indigo-500 outline-none text-sm" />
                <input placeholder="Company (optional)" value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-transparent focus:border-indigo-500 outline-none text-sm" />
                <div className="grid grid-cols-2 gap-3">
                  <select value={questionType} onChange={(e) => setQuestionType(e.target.value)}
                    className="px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white outline-none text-sm">
                    <option value="technical">Technical</option>
                    <option value="hr">HR Round</option>
                    <option value="behavioral">Behavioral</option>
                  </select>
                  <select value={language} onChange={(e) => setLanguage(e.target.value)}
                    className="px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white outline-none text-sm">
                    <option value="Python">Python</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="Java">Java</option>
                    <option value="C++">C++</option>
                    <option value="TypeScript">TypeScript</option>
                  </select>
                </div>
                <button onClick={startSession} disabled={loading}
                  className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all"
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 8px 24px rgba(79,70,229,0.3)' }}>
                  {loading ? '⏳ Generating Questions...' : '🚀 Start Interview'}
                </button>
              </div>
            </div>
          )}

          {/* Active interview */}
          {session && !isCompleted && currentQuestion && (
            <div>
              {/* Progress */}
              <div className="rounded-2xl p-4 mb-4 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <span>Question {currentQuestionIndex + 1} of {session.questions.length}</span>
                  <span>{session.role} {session.company && `· ${session.company}`}</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(currentQuestionIndex / session.questions.length) * 100}%`, background: 'linear-gradient(90deg, #4f46e5, #7c3aed)' }} />
                </div>
              </div>

              {/* Question */}
              <div className="rounded-2xl p-6 mb-4 border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold text-white ${currentQuestion.difficulty === 'hard' ? 'bg-red-500' : currentQuestion.difficulty === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                    {currentQuestion.difficulty}
                  </span>
                </div>
                <p className="text-gray-900 dark:text-white font-medium leading-relaxed">{currentQuestion.question_text}</p>
              </div>

              {/* Previous evaluation */}
              {evaluation && (
                <div className="rounded-2xl p-5 mb-4 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Previous Answer Feedback</h4>
                    <span className={`text-xl font-bold ${scoreColor(evaluation.score)}`}>{evaluation.score}/10</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{evaluation.feedback}</p>
                  <p className="text-sm text-indigo-600 dark:text-indigo-400"><strong>💡 Better:</strong> {evaluation.better_answer}</p>
                </div>
              )}

              {/* Answer textarea */}
              <div className="rounded-2xl p-5 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mb-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Your Answer</label>
                <textarea placeholder="Type your answer here... (no copy-paste allowed)" value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  onPaste={(e) => { e.preventDefault(); toast.error('Copy-paste not allowed!'); }}
                  className="w-full h-32 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-transparent focus:border-indigo-500 outline-none resize-none text-sm" />
              </div>

              <div className="flex gap-3">
                <button onClick={submitAnswer} disabled={submitting}
                  className="flex-1 py-3 rounded-xl text-white font-semibold text-sm"
                  style={{ background: 'linear-gradient(135deg, #059669, #047857)' }}>
                  {submitting ? '⏳ Evaluating...' : '✅ Submit Answer'}
                </button>
                <button onClick={() => { setSession(null); setEvaluation(null); }}
                  className="px-5 py-3 rounded-xl text-sm font-semibold text-red-500 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950 transition-all">
                  End
                </button>
              </div>
            </div>
          )}

          {/* Completed */}
          {session && isCompleted && (
            <div className="rounded-2xl p-8 border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Interview Complete!</h2>
              <div className="text-6xl font-bold mb-2" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {session.total_score}/10
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-6">{session.role} {session.company && `at ${session.company}`}</p>

              <div className="space-y-3 mb-6 text-left">
                {session.scores.map((s, i) => (
                  <div key={i} className="rounded-xl p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-sm text-gray-700 dark:text-gray-300 flex-1"><strong>Q{i + 1}:</strong> {session.questions[i]?.question_text}</p>
                      <span className={`text-lg font-bold shrink-0 ${scoreColor(s.score)}`}>{s.score}/10</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.feedback}</p>
                  </div>
                ))}
              </div>

              <button onClick={() => { setSession(null); setEvaluation(null); }}
                className="px-8 py-3 rounded-xl text-white font-semibold"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                Start New Interview
              </button>
            </div>
          )}
        </div>
      )}

      {/* History */}
      {activeTab === 'history' && (
        <div className="max-w-2xl">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Past Sessions ({pastSessions.length})</h3>
          {pastSessions.length === 0 && (
            <div className="rounded-2xl p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 text-center">
              <p className="text-gray-400">No sessions yet. Start your first mock interview!</p>
            </div>
          )}
          <div className="space-y-3">
            {pastSessions.map((s, i) => (
              <div key={i} className="rounded-2xl p-5 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{s.role} {s.company && `@ ${s.company}`}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(s.created_at).toLocaleDateString()} · {s.questions.length} questions ·
                    <span className={s.completed ? ' text-emerald-500' : ' text-amber-500'}>
                      {s.completed ? ' ✅ Completed' : ' ⏳ Incomplete'}
                    </span>
                  </p>
                </div>
                <div className={`text-2xl font-bold ${scoreColor(s.total_score)}`}>{s.total_score}/10</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}