import { Link, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-4">
        <Link 
          to="/dashboard" 
          className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
            isActive('/dashboard') 
              ? 'text-indigo-400' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs font-medium">Home</span>
        </Link>
        
        <Link 
          to="/create" 
          className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
            isActive('/create') 
              ? 'text-indigo-400' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center -mt-6 shadow-lg ${
            isActive('/create')
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500'
              : 'bg-slate-800'
          }`}>
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-xs font-medium mt-1">Create</span>
        </Link>
        
        <Link 
          to="/vault" 
          className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
            isActive('/vault') 
              ? 'text-indigo-400' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs font-medium">Vault</span>
        </Link>
        
        <Link 
          to="/profile" 
          className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
            isActive('/profile') 
              ? 'text-indigo-400' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs font-medium">Profile</span>
        </Link>
      </div>
    </nav>
  );
}
