import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const API_URL = 'http://127.0.0.1:8000/api/insights';
const COLORS = ['#4f46e5', '#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626'];

export default function InsightsDashboard() {
  const { token } = useAuth();
  const [marketData, setMarketData] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [benchmarkData, setBenchmarkData] = useState(null);
  const [salaryData, setSalaryData] = useState([]);
  const [salaryRole, setSalaryRole] = useState('');
  const [salaryCity, setSalaryCity] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mRes, sRes, bRes] = await Promise.all([
          axios.get(`${API_URL}/market/`, config),
          axios.get(`${API_URL}/stats/`, config),
          axios.get(`${API_URL}/benchmarking/`, config),
        ]);
        setMarketData(mRes.data);
        setUserStats(sRes.data);
        setBenchmarkData(bRes.data);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchData();
  }, []); // eslint-disable-line

  const searchSalary = async () => {
    try {
      const res = await axios.get(`${API_URL}/salary/?role=${salaryRole}&city=${salaryCity}`, config);
      setSalaryData(res.data);
    } catch (err) { console.error(err); }
  };

  const tabs = [
    ['overview', '📊 Overview'],
    ['salary', '💰 Salary'],
    ['benchmarking', '👥 Peers'],
    ['my stats', '📈 My Stats'],
  ];

  if (loading) return (
    <div className="p-8">
      <div className="animate-pulse space-y-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl" />)}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Career Insights</h1>
        <p className="text-gray-500 dark:text-gray-400">Market trends, salary data & peer benchmarking</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {tabs.map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={activeTab === key
              ? { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white' }
              : { background: 'transparent', color: '#6b7280', border: '1px solid #e5e7eb' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && marketData && (
        <div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Total Jobs', value: marketData.total_jobs, icon: '💼', color: 'from-indigo-500 to-violet-600' },
              { label: 'Top Roles', value: marketData.top_roles?.length, icon: '🎯', color: 'from-emerald-500 to-teal-600' },
              { label: 'In-demand Skills', value: marketData.top_skills?.length, icon: '🔥', color: 'from-amber-500 to-orange-600' },
            ].map((stat, i) => (
              <div key={i} className={`rounded-2xl p-5 bg-gradient-to-br ${stat.color} text-white`}>
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-sm opacity-80">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl p-5 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">🔥 Most In-demand Skills</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={marketData.top_skills}>
                  <XAxis dataKey="skill" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 8, color: '#f9fafb' }} />
                  <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-2xl p-5 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">📋 Jobs by Portal</h4>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={marketData.source_distribution} dataKey="count" nameKey="source" cx="50%" cy="50%" outerRadius={70}
                    label={({ source, percent }) => `${source} ${(percent * 100).toFixed(0)}%`}>
                    {marketData.source_distribution?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 8, color: '#f9fafb' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-2xl p-5 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">🏙️ Top Hiring Cities</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={marketData.top_cities} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                  <YAxis dataKey="location" type="category" tick={{ fontSize: 10, fill: '#9ca3af' }} width={80} />
                  <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 8, color: '#f9fafb' }} />
                  <Bar dataKey="job_count" fill="#059669" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-2xl p-5 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">💼 Top Roles by Demand</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={marketData.top_roles} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                  <YAxis dataKey="role" type="category" tick={{ fontSize: 10, fill: '#9ca3af' }} width={120} />
                  <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 8, color: '#f9fafb' }} />
                  <Bar dataKey="avg_demand" fill="#d97706" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Salary */}
      {activeTab === 'salary' && (
        <div>
          <div className="rounded-2xl p-5 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mb-5">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Search Salary Data</h4>
            <div className="flex gap-3 flex-wrap">
              <input placeholder="Role (e.g. Python Developer)" value={salaryRole} onChange={(e) => setSalaryRole(e.target.value)}
                className="flex-1 min-w-48 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white outline-none text-sm" />
              <input placeholder="City (e.g. Bangalore)" value={salaryCity} onChange={(e) => setSalaryCity(e.target.value)}
                className="flex-1 min-w-32 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white outline-none text-sm" />
              <button onClick={searchSalary} className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>Search</button>
            </div>
          </div>

          <div className="space-y-4">
            {salaryData.map((item, i) => (
              <div key={i} className="rounded-2xl p-5 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{item.role}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">📍 {item.city}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                    Demand {item.demand_score}/100
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[['Min', item.min_salary, 'text-red-500'], ['Average', item.avg_salary, 'text-indigo-600 dark:text-indigo-400 text-xl'], ['Max', item.max_salary, 'text-emerald-500']].map(([label, val, cls]) => (
                    <div key={label} className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-500 mb-1">{label}</p>
                      <p className={`font-bold ${cls}`}>₹{(val / 100000).toFixed(1)} LPA</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400"><strong>Skills:</strong> {item.top_skills.join(', ')}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1"><strong>Companies:</strong> {item.hiring_companies.join(', ')}</p>
              </div>
            ))}
            {salaryData.length === 0 && (
              <div className="rounded-2xl p-10 border-2 border-dashed border-gray-200 dark:border-gray-700 text-center">
                <p className="text-gray-400">Search for role + city to see salary data</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Benchmarking */}
      {activeTab === 'benchmarking' && benchmarkData && (
        <div className="max-w-lg">
          <div className="rounded-2xl p-6 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">👥 {benchmarkData.target_role} Peers</h4>
            {benchmarkData.message && !benchmarkData.percentile ? (
              <p className="text-gray-500">{benchmarkData.message}</p>
            ) : (
              <div>
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold mb-1" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {benchmarkData.percentile}th
                  </div>
                  <p className="text-gray-500 text-sm">Percentile</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{benchmarkData.message}</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[['Your Score', benchmarkData.your_score, 'from-indigo-500 to-violet-600'], ['Avg Peers', benchmarkData.avg_peer_score, 'from-gray-500 to-gray-600'], ['Total Peers', benchmarkData.total_peers, 'from-emerald-500 to-teal-600']].map(([label, val, grad]) => (
                    <div key={label} className={`rounded-xl p-3 bg-gradient-to-br ${grad} text-white text-center`}>
                      <div className="text-2xl font-bold">{val}</div>
                      <div className="text-xs opacity-80">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* My Stats */}
      {activeTab === 'my stats' && userStats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Applications', value: userStats.total_applications, icon: '📨', color: 'from-blue-500 to-indigo-600' },
            { label: 'Interview Rate', value: `${userStats.interview_rate}%`, icon: '🎤', color: 'from-amber-500 to-orange-600' },
            { label: 'Offer Rate', value: `${userStats.offer_rate}%`, icon: '🎉', color: 'from-emerald-500 to-teal-600' },
            { label: 'Mock Sessions', value: userStats.total_mock_sessions, icon: '🎯', color: 'from-violet-500 to-purple-600' },
            { label: 'Avg Interview Score', value: `${userStats.avg_mock_interview_score}/10`, icon: '⭐', color: 'from-green-500 to-emerald-600' },
            { label: 'Rejections', value: userStats.rejected_count, icon: '❌', color: 'from-red-500 to-rose-600' },
          ].map((stat, i) => (
            <div key={i} className={`rounded-2xl p-5 bg-gradient-to-br ${stat.color} text-white`}>
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="text-sm opacity-80 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}