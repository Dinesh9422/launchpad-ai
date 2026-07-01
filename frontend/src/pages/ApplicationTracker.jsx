import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const API_URL = 'http://127.0.0.1:8000/api/jobs';

const COLUMNS = [
  { key: 'applied', label: 'Applied', icon: '📨', color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50 dark:bg-blue-950', border: 'border-blue-200 dark:border-blue-800' },
  { key: 'interview', label: 'Interview', icon: '🎯', color: 'from-amber-500 to-orange-600', bg: 'bg-amber-50 dark:bg-amber-950', border: 'border-amber-200 dark:border-amber-800' },
  { key: 'offer', label: 'Offer', icon: '✅', color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50 dark:bg-emerald-950', border: 'border-emerald-200 dark:border-emerald-800' },
  { key: 'rejected', label: 'Rejected', icon: '❌', color: 'from-red-500 to-rose-600', bg: 'bg-red-50 dark:bg-red-950', border: 'border-red-200 dark:border-red-800' },
];

export default function ApplicationTracker() {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState({});

  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await axios.get(`${API_URL}/applications/`, config);
        setApplications(res.data);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchApps();
  }, []); // eslint-disable-line

  const updateStatus = async (appId, newStatus) => {
    try {
      await axios.put(`${API_URL}/applications/${appId}/`, { status: newStatus }, config);
      setApplications(applications.map(app => app.id === appId ? { ...app, status: newStatus } : app));
      toast.success('Status updated!');
    } catch { toast.error('Update failed'); }
  };

  const updateNotes = async (appId) => {
    try {
      await axios.put(`${API_URL}/applications/${appId}/`, { notes: notes[appId] || '' }, config);
      setApplications(applications.map(app => app.id === appId ? { ...app, notes: notes[appId] || '' } : app));
      toast.success('Notes saved!');
    } catch { toast.error('Save failed'); }
  };

  const deleteApplication = async (appId) => {
    try {
      await axios.delete(`${API_URL}/applications/${appId}/`, config);
      setApplications(applications.filter(app => app.id !== appId));
      toast.success('Removed!');
    } catch { toast.error('Delete failed'); }
  };

  const getByStatus = (status) => applications.filter(app => app.status === status);

  if (loading) return (
    <div className="p-8">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6 animate-pulse" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Application Tracker</h1>
        <p className="text-gray-500 dark:text-gray-400">Track your job applications with Kanban board</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {COLUMNS.map(col => (
          <div key={col.key} className={`rounded-2xl p-4 ${col.bg} border ${col.border}`}>
            <div className="text-2xl mb-1">{col.icon}</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{getByStatus(col.key).length}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{col.label}</div>
          </div>
        ))}
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map(col => (
          <div key={col.key} className="flex flex-col">
            {/* Column header */}
            <div className={`rounded-xl p-3 mb-3 bg-gradient-to-r ${col.color} flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <span>{col.icon}</span>
                <span className="text-white font-semibold text-sm">{col.label}</span>
              </div>
              <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {getByStatus(col.key).length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-3 min-h-32">
              {getByStatus(col.key).map(app => (
                <div key={app.id}
                  className="rounded-xl p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{app.job.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    🏢 {app.job.company}<br />📍 {app.job.location}
                  </p>
                  <p className="text-xs text-gray-400 mb-3">
                    {new Date(app.applied_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>

                  <select value={app.status} onChange={(e) => updateStatus(app.id, e.target.value)}
                    className="w-full text-xs px-2 py-1.5 rounded-lg mb-2 outline-none bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                    <option value="applied">Applied</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                  </select>

                  <textarea placeholder="Notes..." defaultValue={app.notes}
                    onChange={(e) => setNotes({ ...notes, [app.id]: e.target.value })}
                    className="w-full text-xs px-2 py-1.5 rounded-lg mb-2 outline-none resize-none h-16 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700" />

                  <div className="flex gap-2">
                    <button onClick={() => updateNotes(app.id)}
                      className="flex-1 text-xs py-1.5 rounded-lg text-white font-medium transition-all"
                      style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                      Save
                    </button>
                    <button onClick={() => deleteApplication(app.id)}
                      className="px-3 py-1.5 rounded-lg text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-all border border-red-200 dark:border-red-800">
                      ✕
                    </button>
                  </div>
                </div>
              ))}

              {getByStatus(col.key).length === 0 && (
                <div className="rounded-xl p-6 border-2 border-dashed border-gray-200 dark:border-gray-700 text-center">
                  <p className="text-xs text-gray-400">No applications</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}