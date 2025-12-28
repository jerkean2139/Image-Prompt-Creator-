export default function ProgressIndicator({ status, currentStep, totalSteps, message }) {
  const getStatusColor = () => {
    switch (status) {
      case 'QUEUED':
        return 'bg-yellow-500';
      case 'RUNNING':
        return 'bg-indigo-500';
      case 'COMPLETED':
        return 'bg-green-500';
      case 'FAILED':
        return 'bg-red-500';
      default:
        return 'bg-slate-500';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'QUEUED':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'RUNNING':
        return (
          <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 'COMPLETED':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'FAILED':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-full ${getStatusColor()} flex items-center justify-center text-white`}>
            {getStatusIcon()}
          </div>
          <div>
            <p className="text-sm font-semibold text-white capitalize">{status.toLowerCase()}</p>
            {message && <p className="text-xs text-slate-400">{message}</p>}
          </div>
        </div>
        {totalSteps > 0 && (
          <span className="text-sm font-medium text-slate-400">
            {currentStep}/{totalSteps}
          </span>
        )}
      </div>

      {status === 'RUNNING' && totalSteps > 0 && (
        <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {status === 'RUNNING' && totalSteps === 0 && (
        <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse" />
        </div>
      )}
    </div>
  );
}
