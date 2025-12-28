import { useNavigate } from 'react-router-dom';
import SwipeableCard from './SwipeableCard';
import ProgressIndicator from './ProgressIndicator';

export default function JobCard({ job, onDelete }) {
  const navigate = useNavigate();

  const statusColors = {
    QUEUED: 'text-yellow-400 bg-yellow-400/10',
    RUNNING: 'text-indigo-400 bg-indigo-400/10',
    PARTIAL: 'text-orange-400 bg-orange-400/10',
    SUCCEEDED: 'text-green-400 bg-green-400/10',
    FAILED: 'text-red-400 bg-red-400/10',
    CANCELED: 'text-slate-400 bg-slate-400/10'
  };

  const completedRuns = job.runs?.filter(r => r.status === 'SUCCEEDED').length || 0;
  const totalRuns = job.runs?.length || 5;
  const totalImages = job.runs?.reduce((sum, r) => sum + (r.outputs?.length || 0), 0) || 0;

  const handleClick = () => {
    navigate(`/jobs/${job.id}`);
  };

  const handleDelete = async () => {
    if (confirm('Delete this generation?')) {
      if (onDelete) {
        await onDelete(job.id);
      }
    }
  };

  return (
    <SwipeableCard
      onSwipeLeft={handleDelete}
      className="relative"
    >
      <div
        onClick={handleClick}
        className="bg-slate-900 rounded-2xl border border-slate-800 p-4 cursor-pointer hover:border-indigo-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[job.status]}`}>
            {job.status}
          </span>
          <span className="text-xs text-slate-500">
            {new Date(job.createdAt).toLocaleDateString()}
          </span>
        </div>

        {/* Idea */}
        <p className="text-sm text-slate-300 mb-3 line-clamp-2">
          {job.idea}
        </p>

        {/* Progress for Running Jobs */}
        {job.status === 'RUNNING' && (
          <div className="mb-3">
            <ProgressIndicator
              status="RUNNING"
              currentStep={completedRuns}
              totalSteps={totalRuns}
              message={`Generating with ${totalRuns} AI models...`}
            />
          </div>
        )}

        {/* Queued Status */}
        {job.status === 'QUEUED' && (
          <div className="mb-3">
            <ProgressIndicator
              status="QUEUED"
              currentStep={0}
              totalSteps={0}
              message="Waiting in queue..."
            />
          </div>
        )}

        {/* Results */}
        {job.status === 'SUCCEEDED' && (
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="text-slate-400">
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {totalImages} images
            </span>
            {job.creditsUsed && (
              <span className="text-indigo-400 font-semibold text-xs">
                {job.creditsUsed} credits
              </span>
            )}
          </div>
        )}

        {/* Preview Images with Animation */}
        {totalImages > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {job.runs?.slice(0, 3).map((run, idx) => (
              run.outputs?.[0] && (
                <div
                  key={idx}
                  className="aspect-square rounded-lg overflow-hidden bg-slate-800 animate-fade-in"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <img
                    src={run.outputs[0].url}
                    alt={run.provider}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
              )
            ))}
          </div>
        )}

        {/* Failed Status */}
        {job.status === 'FAILED' && (
          <div className="flex items-center space-x-2 text-red-400 text-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Generation failed</span>
          </div>
        )}
      </div>
    </SwipeableCard>
  );
}
