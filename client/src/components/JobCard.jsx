export default function JobCard({ job, onClick }) {
  const statusColors = {
    QUEUED: 'text-yellow-400 bg-yellow-400/10',
    RUNNING: 'text-blue-400 bg-blue-400/10',
    PARTIAL: 'text-orange-400 bg-orange-400/10',
    SUCCEEDED: 'text-green-400 bg-green-400/10',
    FAILED: 'text-red-400 bg-red-400/10',
    CANCELED: 'text-gray-400 bg-gray-400/10'
  };

  const completedRuns = job.runs?.filter(r => r.status === 'SUCCEEDED').length || 0;
  const totalRuns = job.runs?.length || 0;
  const totalImages = job.runs?.reduce((sum, r) => sum + (r.outputs?.length || 0), 0) || 0;

  return (
    <div
      onClick={onClick}
      className="card cursor-pointer hover:border-cyber-blue transition-all"
    >
      {/* Status Badge */}
      <div className="flex items-center justify-between mb-3">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[job.status]}`}>
          {job.status}
        </span>
        <span className="text-xs text-gray-500">
          {new Date(job.createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* Idea */}
      <p className="text-sm text-gray-300 mb-3 line-clamp-2">
        {job.idea}
      </p>

      {/* Progress */}
      {job.status === 'RUNNING' && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Generating...</span>
            <span>{completedRuns}/{totalRuns} models</span>
          </div>
          <div className="w-full bg-cyber-border rounded-full h-2">
            <div
              className="bg-gradient-cyber h-2 rounded-full transition-all duration-500"
              style={{ width: `${(completedRuns / totalRuns) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Results */}
      {job.status === 'SUCCEEDED' && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">{totalImages} images generated</span>
          {job.gradeScore && (
            <span className="text-cyber-blue font-semibold">
              Score: {job.gradeScore}/100
            </span>
          )}
        </div>
      )}

      {/* Preview Images */}
      {totalImages > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {job.runs?.slice(0, 3).map((run, idx) => (
            run.outputs?.[0] && (
              <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-cyber-border">
                <img
                  src={run.outputs[0].url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}
