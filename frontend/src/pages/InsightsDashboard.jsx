import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const API_URL = 'http://127.0.0.1:8000/api/insights';

const COLORS = ['#3b4cca', '#e65100', '#0a6640', '#cc3b3b', '#6a1b9a', '#01579b'];

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

  const fetchData = async () => {
    try {
      const [marketRes, statsRes, benchRes] = await Promise.all([
        axios.get(`${API_URL}/market/`, config),
        axios.get(`${API_URL}/stats/`, config),
        axios.get(`${API_URL}/benchmarking/`, config),
      ]);
      setMarketData(marketRes.data);
      setUserStats(statsRes.data);
      setBenchmarkData(benchRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const searchSalary = async () => {
    try {
      const res = await axios.get(`${API_URL}/salary/?role=${salaryRole}&city=${salaryCity}`, config);
      setSalaryData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: 50 }}>Loading dashboard...</p>;

  return (
    <div style={{ maxWidth: 1100, margin: '20px auto', padding: 20 }}>
      <h2>Career Insights Dashboard</h2>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 5, marginBottom: 20, flexWrap: 'wrap' }}>
        {['overview', 'salary', 'benchmarking', 'my stats'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding: '8px 16px', background: activeTab === tab ? '#3b4cca' : '#eee', color: activeTab === tab ? '#fff' : '#000', border: 'none', borderRadius: 5, textTransform: 'capitalize' }}>
            {tab === 'overview' ? '📊 Overview' : tab === 'salary' ? '💰 Salary' : tab === 'benchmarking' ? '👥 Benchmarking' : '📈 My Stats'}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && marketData && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 15, marginBottom: 20 }}>
            <div style={{ background: '#f0f4ff', borderRadius: 10, padding: 15, textAlign: 'center' }}>
              <h3 style={{ margin: 0, color: '#3b4cca', fontSize: 28 }}>{marketData.total_jobs}</h3>
              <p style={{ margin: 0, color: '#666' }}>Total Jobs</p>
            </div>
            <div style={{ background: '#f0fff4', borderRadius: 10, padding: 15, textAlign: 'center' }}>
              <h3 style={{ margin: 0, color: '#0a6640', fontSize: 28 }}>{marketData.top_roles?.length}</h3>
              <p style={{ margin: 0, color: '#666' }}>Top Roles Tracked</p>
            </div>
            <div style={{ background: '#fff8e1', borderRadius: 10, padding: 15, textAlign: 'center' }}>
              <h3 style={{ margin: 0, color: '#e65100', fontSize: 28 }}>{marketData.top_skills?.length}</h3>
              <p style={{ margin: 0, color: '#666' }}>In-demand Skills</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Top Skills Chart */}
            <div style={{ border: '1px solid #ddd', borderRadius: 10, padding: 15 }}>
              <h4>🔥 Most In-demand Skills</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={marketData.top_skills}>
                  <XAxis dataKey="skill" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b4cca" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Source Distribution */}
            <div style={{ border: '1px solid #ddd', borderRadius: 10, padding: 15 }}>
              <h4>📋 Jobs by Portal</h4>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={marketData.source_distribution} dataKey="count" nameKey="source" cx="50%" cy="50%" outerRadius={70} label={({ source, percent }) => `${source} ${(percent * 100).toFixed(0)}%`}>
                    {marketData.source_distribution?.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top Cities */}
            <div style={{ border: '1px solid #ddd', borderRadius: 10, padding: 15 }}>
              <h4>🏙️ Top Hiring Cities</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={marketData.top_cities} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="location" type="category" tick={{ fontSize: 10 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="job_count" fill="#0a6640" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Roles */}
            <div style={{ border: '1px solid #ddd', borderRadius: 10, padding: 15 }}>
              <h4>💼 Top Roles by Demand</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={marketData.top_roles} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="role" type="category" tick={{ fontSize: 10 }} width={120} />
                  <Tooltip />
                  <Bar dataKey="avg_demand" fill="#e65100" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Salary Tab */}
      {activeTab === 'salary' && (
        <div>
          <div style={{ border: '1px solid #ddd', borderRadius: 10, padding: 20, marginBottom: 20 }}>
            <h4>💰 Salary Intelligence</h4>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input placeholder="Role (e.g. Python Developer)" value={salaryRole}
                onChange={(e) => setSalaryRole(e.target.value)}
                style={{ flex: 1, padding: 10 }} />
              <input placeholder="City (e.g. Bangalore)" value={salaryCity}
                onChange={(e) => setSalaryCity(e.target.value)}
                style={{ flex: 1, padding: 10 }} />
              <button onClick={searchSalary}
                style={{ padding: '10px 20px', background: '#3b4cca', color: '#fff', border: 'none', borderRadius: 5 }}>
                Search
              </button>
            </div>
          </div>

          {salaryData.map((item, i) => (
            <div key={i} style={{ border: '1px solid #ddd', borderRadius: 10, padding: 15, marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0 }}>{item.role} — {item.city}</h4>
                <span style={{ background: '#f0f4ff', padding: '4px 12px', borderRadius: 10, color: '#3b4cca', fontWeight: 'bold' }}>
                  Demand: {item.demand_score}/100
                </span>
              </div>
              <div style={{ display: 'flex', gap: 20, margin: '10px 0' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: 0, color: '#888', fontSize: 12 }}>Min</p>
                  <p style={{ margin: 0, fontWeight: 'bold', color: '#cc3b3b' }}>₹{(item.min_salary / 100000).toFixed(1)} LPA</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: 0, color: '#888', fontSize: 12 }}>Average</p>
                  <p style={{ margin: 0, fontWeight: 'bold', color: '#3b4cca', fontSize: 18 }}>₹{(item.avg_salary / 100000).toFixed(1)} LPA</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: 0, color: '#888', fontSize: 12 }}>Max</p>
                  <p style={{ margin: 0, fontWeight: 'bold', color: '#0a6640' }}>₹{(item.max_salary / 100000).toFixed(1)} LPA</p>
                </div>
              </div>
              <p style={{ margin: '5px 0', fontSize: 13 }}><strong>Top Skills:</strong> {item.top_skills.join(', ')}</p>
              <p style={{ margin: 0, fontSize: 13 }}><strong>Hiring:</strong> {item.hiring_companies.join(', ')}</p>
            </div>
          ))}

          {salaryData.length === 0 && (
            <p style={{ color: '#888', textAlign: 'center' }}>Search for a role and city to see salary data</p>
          )}
        </div>
      )}

      {/* Benchmarking Tab */}
      {activeTab === 'benchmarking' && benchmarkData && (
        <div style={{ border: '1px solid #ddd', borderRadius: 10, padding: 20 }}>
          <h4>👥 Peer Benchmarking — {benchmarkData.target_role}</h4>
          {benchmarkData.message && !benchmarkData.percentile ? (
            <p>{benchmarkData.message}</p>
          ) : (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <h2 style={{ color: '#3b4cca' }}>{benchmarkData.percentile}th Percentile</h2>
                <p>{benchmarkData.message}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 15, marginBottom: 20 }}>
                <div style={{ background: '#f0f4ff', borderRadius: 10, padding: 15, textAlign: 'center' }}>
                  <h3 style={{ margin: 0, color: '#3b4cca' }}>{benchmarkData.your_score}</h3>
                  <p style={{ margin: 0, fontSize: 13, color: '#666' }}>Your Score</p>
                </div>
                <div style={{ background: '#f5f5f5', borderRadius: 10, padding: 15, textAlign: 'center' }}>
                  <h3 style={{ margin: 0 }}>{benchmarkData.avg_peer_score}</h3>
                  <p style={{ margin: 0, fontSize: 13, color: '#666' }}>Avg Peer Score</p>
                </div>
                <div style={{ background: '#f0fff4', borderRadius: 10, padding: 15, textAlign: 'center' }}>
                  <h3 style={{ margin: 0, color: '#0a6640' }}>{benchmarkData.total_peers}</h3>
                  <p style={{ margin: 0, fontSize: 13, color: '#666' }}>Total Peers</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={[
                  { name: 'You', score: benchmarkData.your_score },
                  { name: 'Avg Peer', score: benchmarkData.avg_peer_score },
                ]}>
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#3b4cca" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* My Stats Tab */}
      {activeTab === 'my stats' && userStats && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 15, marginBottom: 20 }}>
            <div style={{ background: '#f0f4ff', borderRadius: 10, padding: 15, textAlign: 'center' }}>
              <h3 style={{ margin: 0, color: '#3b4cca', fontSize: 28 }}>{userStats.total_applications}</h3>
              <p style={{ margin: 0, color: '#666' }}>Total Applications</p>
            </div>
            <div style={{ background: '#fff8e1', borderRadius: 10, padding: 15, textAlign: 'center' }}>
              <h3 style={{ margin: 0, color: '#e65100', fontSize: 28 }}>{userStats.interview_rate}%</h3>
              <p style={{ margin: 0, color: '#666' }}>Interview Rate</p>
            </div>
            <div style={{ background: '#f0fff4', borderRadius: 10, padding: 15, textAlign: 'center' }}>
              <h3 style={{ margin: 0, color: '#0a6640', fontSize: 28 }}>{userStats.offer_rate}%</h3>
              <p style={{ margin: 0, color: '#666' }}>Offer Rate</p>
            </div>
            <div style={{ background: '#f3e5f5', borderRadius: 10, padding: 15, textAlign: 'center' }}>
              <h3 style={{ margin: 0, color: '#6a1b9a', fontSize: 28 }}>{userStats.total_mock_sessions}</h3>
              <p style={{ margin: 0, color: '#666' }}>Mock Sessions</p>
            </div>
            <div style={{ background: '#e8f5e9', borderRadius: 10, padding: 15, textAlign: 'center' }}>
              <h3 style={{ margin: 0, color: '#0a6640', fontSize: 28 }}>{userStats.avg_mock_interview_score}/10</h3>
              <p style={{ margin: 0, color: '#666' }}>Avg Interview Score</p>
            </div>
            <div style={{ background: '#fce4ec', borderRadius: 10, padding: 15, textAlign: 'center' }}>
              <h3 style={{ margin: 0, color: '#cc3b3b', fontSize: 28 }}>{userStats.rejected_count}</h3>
              <p style={{ margin: 0, color: '#666' }}>Rejections</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}