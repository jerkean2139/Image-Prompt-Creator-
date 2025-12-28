import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import JobCard from '../components/JobCardNew';
import SkeletonLoader from '../components/SkeletonLoader';

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
    const interval = setInterval(loadJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadJobs = async () => {
    try {
      const res = await fetch('/api/jobs?limit=10', {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs);
      }
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 pt-12 pb-8 px-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Runtz AI</h1>
              <p className="text-indigo-100">AI Image Maker</p>
            </div>
            <div className="text-right">
              <p className="text-indigo-100 text-sm">Credits</p>
              <p className="text-2xl font-bold text-white">{user?.creditsBalance || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Create Button */}
      <div className="max-w-lg mx-auto px-6 -mt-6">
        <button
          onClick={() => navigate('/create')}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl p-6 shadow-2xl hover:shadow-indigo-500/50 transition-all flex items-center justify-between"
        >
          <div className="text-left">
            <p className="text-lg font-bold">Create New Image</p>
            <p className="text-indigo-100 text-sm">Generate with 5 AI models</p>
          </div>
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Recent Generations */}
      <div className="max-w-lg mx-auto px-6 mt-8">
        <h2 className="text-xl font-bold text-white mb-4">Recent Generations</h2>
        
        {loading ? (
          <div className="space-y-4">
            <SkeletonLoader type="card" />
            <SkeletonLoader type="card" />
            <SkeletonLoader type="card" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12 bg-slate-900 rounded-2xl border border-slate-800">
            <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-slate-400 mb-4">No generations yet</p>
            <button
              onClick={() => navigate('/create')}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold"
            >
              Create Your First Image
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job, idx) => (
              <div
                key={job.id}
                className="animate-slide-up"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <JobCard job={job} onDelete={async (id) => {
                  await fetch(`/api/jobs/${id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                  });
                  loadJobs();
                }} />
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
