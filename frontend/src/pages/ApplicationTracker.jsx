import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://127.0.0.1:8000/api/jobs';

const COLUMNS = [
  { key: 'applied', label: '📨 Applied', color: '#3b4cca' },
  { key: 'interview', label: '🎯 Interview', color: '#e65100' },
  { key: 'offer', label: '✅ Offer', color: '#0a6640' },
  { key: 'rejected', label: '❌ Rejected', color: '#cc3b3b' },
];

export default function ApplicationTracker() {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState({});

  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchApplications = async () => {
    try {
      const res = await axios.get(`${API_URL}/applications/`, config);
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStatus = async (appId, newStatus) => {
    try {
      await axios.put(`${API_URL}/applications/${appId}/`, { status: newStatus }, config);
      setApplications(applications.map(app =>
        app.id === appId ? { ...app, status: newStatus } : app
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const updateNotes = async (appId) => {
    try {
      await axios.put(`${API_URL}/applications/${appId}/`, { notes: notes[appId] || '' }, config);
      setApplications(applications.map(app =>
        app.id === appId ? { ...app, notes: notes[appId] || '' } : app
      ));
      alert('Notes saved!');
    } catch (err) {
      console.error(err);
    }
  };

  const deleteApplication = async (appId) => {
    try {
      await axios.delete(`${API_URL}/applications/${appId}/`, config);
      setApplications(applications.filter(app => app.id !== appId));
    } catch (err) {
      console.error(err);
    }
  };

  const getByStatus = (status) => applications.filter(app => app.status === status);

  if (loading) return <p style={{ textAlign: 'center', marginTop: 50 }}>Loading applications...</p>;

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>
      <h2>Application Tracker</h2>
      <p style={{ color: '#666' }}>Total: {applications.length} applications</p>

      <div style={{ display: 'flex', gap: 15, overflowX: 'auto' }}>
        {COLUMNS.map(col => (
          <div key={col.key} style={{ minWidth: 260, flex: 1 }}>
            <div style={{ background: col.color, color: '#fff', padding: '8px 12px', borderRadius: '8px 8px 0 0', fontWeight: 'bold' }}>
              {col.label} ({getByStatus(col.key).length})
            </div>
            <div style={{ background: '#f5f5f5', borderRadius: '0 0 8px 8px', padding: 10, minHeight: 200 }}>
              {getByStatus(col.key).map(app => (
                <div key={app.id} style={{ background: '#fff', border: '1px solid #ddd', borderRadius: 8, padding: 12, marginBottom: 10 }}>
                  <h4 style={{ margin: '0 0 4px' }}>{app.job.title}</h4>
                  <p style={{ margin: '0 0 4px', color: '#555', fontSize: 13 }}>{app.job.company} — {app.job.location}</p>
                  <p style={{ margin: '0 0 8px', fontSize: 12, color: '#888' }}>
                    Applied: {new Date(app.applied_date).toLocaleDateString()}
                  </p>

                  <select value={app.status} onChange={(e) => updateStatus(app.id, e.target.value)}
                    style={{ width: '100%', padding: 6, marginBottom: 8, fontSize: 12 }}>
                    <option value="applied">Applied</option>
                    <option value="interview">Interview Scheduled</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                  </select>

                  <textarea placeholder="Add notes..." defaultValue={app.notes}
                    onChange={(e) => setNotes({ ...notes, [app.id]: e.target.value })}
                    style={{ width: '100%', padding: 6, fontSize: 12, height: 50, boxSizing: 'border-box' }} />

                  <div style={{ display: 'flex', gap: 5, marginTop: 5 }}>
                    <button onClick={() => updateNotes(app.id)}
                      style={{ flex: 1, padding: 5, fontSize: 11, background: '#3b4cca', color: '#fff', border: 'none', borderRadius: 4 }}>
                      Save Notes
                    </button>
                    <button onClick={() => deleteApplication(app.id)}
                      style={{ padding: 5, fontSize: 11, background: '#cc3b3b', color: '#fff', border: 'none', borderRadius: 4 }}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              {getByStatus(col.key).length === 0 && (
                <p style={{ color: '#aaa', textAlign: 'center', padding: 20, fontSize: 13 }}>No applications</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}