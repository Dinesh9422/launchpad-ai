import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://127.0.0.1:8000/api/jobs';

export default function JobSearch() {
  const { token } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [source, setSource] = useState('');
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState(new Set());

  const config = { headers: { Authorization: `Bearer ${token}` } };

  const searchJobs = async (pageNum = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (location) params.append('location', location);
      if (source) params.append('source', source);
      params.append('page', pageNum);

      const res = await axios.get(`${API_URL}/search/?${params.toString()}`, config);
      setJobs(res.data.results.jobs);
      setTotalCount(res.data.results.total_count);
      setHasNext(!!res.data.next);
      setHasPrev(!!res.data.previous);
      setPage(pageNum);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    searchJobs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    searchJobs(1);
  };

  const applyToJob = async (jobId) => {
    try {
      await axios.post(`${API_URL}/applications/`, { job_id: jobId }, config);
      setAppliedJobs(new Set([...appliedJobs, jobId]));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '20px auto', padding: 20 }}>
      <h2>Job Search</h2>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
        <input placeholder="Job title or skill (e.g. Python)" value={query} onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 2, padding: 10 }} />
        <input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)}
          style={{ flex: 1, padding: 10 }} />
        <select value={source} onChange={(e) => setSource(e.target.value)} style={{ padding: 10 }}>
          <option value="">All Portals</option>
          <option value="linkedin">LinkedIn</option>
          <option value="naukri">Naukri</option>
          <option value="indeed">Indeed</option>
          <option value="internshala">Internshala</option>
        </select>
        <button type="submit" style={{ padding: '10px 20px', background: '#3b4cca', color: '#fff', border: 'none', borderRadius: 5 }}>
          Search
        </button>
      </form>

      {!loading && (
        <p style={{ color: '#666' }}>
          <strong>{totalCount}</strong> jobs found {query && `for "${query}"`}
        </p>
      )}

      {loading && <p>Loading jobs...</p>}

      {!loading && jobs.map((job) => (
        <div key={job.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 15, marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0 }}>{job.title}</h3>
            <span style={{ background: '#eee', padding: '2px 10px', borderRadius: 10, fontSize: 12, textTransform: 'capitalize' }}>
              {job.source}
            </span>
          </div>
          <p style={{ margin: '5px 0', color: '#555' }}>{job.company} — {job.location}</p>
          <p style={{ margin: '5px 0' }}>💰 {job.salary} | 📅 {job.experience}</p>
          <p style={{ margin: '5px 0', fontSize: 14 }}>{job.description}</p>
          <p style={{ margin: '5px 0' }}>
            <strong>Skills:</strong> {job.skills_required.join(', ')}
          </p>
          <button onClick={() => applyToJob(job.id)} disabled={appliedJobs.has(job.id)}
            style={{
              padding: '8px 15px', marginTop: 10, border: 'none', borderRadius: 5, cursor: 'pointer',
              background: appliedJobs.has(job.id) ? '#0a6640' : '#3b4cca', color: '#fff'
            }}>
            {appliedJobs.has(job.id) ? '✓ Applied' : 'Apply'}
          </button>
        </div>
      ))}

      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 20 }}>
        <button onClick={() => searchJobs(page - 1)} disabled={!hasPrev} style={{ padding: '8px 20px' }}>
          Previous
        </button>
        <span style={{ padding: '8px 10px' }}>Page {page}</span>
        <button onClick={() => searchJobs(page + 1)} disabled={!hasNext} style={{ padding: '8px 20px' }}>
          Next
        </button>
      </div>
    </div>
  );
}