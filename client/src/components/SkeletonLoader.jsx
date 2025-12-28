export default function SkeletonLoader({ type = 'card' }) {
  if (type === 'card') {
    return (
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 animate-pulse">
        <div className="aspect-square bg-slate-800 rounded-xl mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-slate-800 rounded w-3/4"></div>
          <div className="h-3 bg-slate-800 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (type === 'image') {
    return (
      <div className="aspect-square bg-slate-800 rounded-xl animate-pulse flex items-center justify-center">
        <svg className="w-12 h-12 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  if (type === 'text') {
    return (
      <div className="space-y-2 animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-full"></div>
        <div className="h-4 bg-slate-800 rounded w-5/6"></div>
        <div className="h-4 bg-slate-800 rounded w-4/6"></div>
      </div>
    );
  }

  return null;
}
