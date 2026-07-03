import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import API_BASE from '../config';

const API_URL = `${API_BASE}/api/jobs`;

const SOURCE_COLORS = {
  linkedin: 'from-blue-500 to-blue-700',
  naukri: 'from-orange-500 to-red-600',
  indeed: 'from-violet-500 to-purple-700',
  internshala: 'from-emerald-500 to-teal-700',
};

const SOURCE_ICONS = {
  linkedin: '💼',
  naukri: '🇮🇳',
  indeed: '🔍',
  internshala: '🎓',
};

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

  useEffect(() => { searchJobs(1); }, []); // eslint-disable-line

  const handleSearch = (e) => { e.preventDefault(); searchJobs(1); };

  const applyToJob = async (jobId, title) => {
    try {
      await axios.post(`${API_URL}/applications/`, { job_id: jobId }, config);
      setAppliedJobs(new Set([...appliedJobs, jobId]));
      toast.success(`Applied to ${title}!`);
    } catch {
      toast.error('Already applied or error occurred');
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Job Search</h1>
        <p className="text-gray-500 dark:text-gray-400">Search across LinkedIn, Naukri, Indeed & Internshala</p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="rounded-2xl p-5 mb-6 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex flex-wrap gap-3">
          <input placeholder="🔍  Job title or skill (e.g. Python, React)" value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 min-w-48 px-4 py-2.5 rounded-xl text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-indigo-500 outline-none transition-all text-sm" />
          <input placeholder="📍  Location" value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="flex-1 min-w-32 px-4 py-2.5 rounded-xl text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-indigo-500 outline-none transition-all text-sm" />
          <select value={source} onChange={(e) => setSource(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 border border-transparent outline-none text-sm">
            <option value="">All Portals</option>
            <option value="linkedin">LinkedIn</option>
            <option value="naukri">Naukri</option>
            <option value="indeed">Indeed</option>
            <option value="internshala">Internshala</option>
          </select>
          <button type="submit"
            className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm transition-all"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
            Search
          </button>
        </div>
      </form>

      {/* Results count */}
      {!loading && (
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1 rounded-full text-xs font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
            {totalCount} jobs found
          </span>
          {query && <span className="text-sm text-gray-500 dark:text-gray-400">for "{query}"</span>}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="rounded-2xl p-5 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 animate-pulse">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Job cards */}
      {!loading && (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <div key={job.id}
              className="rounded-2xl p-5 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all hover:shadow-lg hover:shadow-indigo-500/10 group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {job.title}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs text-white font-medium bg-gradient-to-r ${SOURCE_COLORS[job.source] || 'from-gray-500 to-gray-700'}`}>
                      {SOURCE_ICONS[job.source]} {job.source}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    🏢 {job.company} &nbsp;·&nbsp; 📍 {job.location}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-xs px-2 py-1 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                      💰 {job.salary}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                      📅 {job.experience}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {job.skills_required.slice(0, 5).map((skill, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        {skill}
                      </span>
                    ))}
                    {job.skills_required.length > 5 && (
                      <span className="text-xs px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500">
                        +{job.skills_required.length - 5}
                      </span>
                    )}
                  </div>
                </div>

                <button onClick={() => applyToJob(job.id, job.title)}
                  disabled={appliedJobs.has(job.id)}
                  className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: appliedJobs.has(job.id)
                      ? 'linear-gradient(135deg, #059669, #047857)'
                      : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    color: 'white',
                    boxShadow: appliedJobs.has(job.id) ? '0 4px 12px rgba(5,150,105,0.3)' : '0 4px 12px rgba(79,70,229,0.3)'
                  }}>
                  {appliedJobs.has(job.id) ? '✓ Applied' : 'Apply'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && jobs.length > 0 && (
        <div className="flex justify-center items-center gap-3 mt-8">
          <button onClick={() => searchJobs(page - 1)} disabled={!hasPrev}
            className="px-5 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-indigo-400">
            ← Previous
          </button>
          <span className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
            Page {page}
          </span>
          <button onClick={() => searchJobs(page + 1)} disabled={!hasNext}
            className="px-5 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-indigo-400">
            Next →
          </button>
        </div>
      )}
    </div>
  );
}