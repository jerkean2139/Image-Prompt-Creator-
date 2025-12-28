import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 pt-12 pb-24 px-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-bold text-white">
              {user.displayName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{user.displayName || 'User'}</h1>
              <p className="text-indigo-100">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Credits Card */}
      <div className="max-w-lg mx-auto px-6 -mt-16">
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Available Credits</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                {user.creditsBalance}
              </p>
            </div>
            <button className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow">
              Buy More
            </button>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-lg mx-auto px-6 mt-6 space-y-2">
        <button className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-slate-200">Edit Profile</span>
          </div>
          <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-slate-200">Transaction History</span>
          </div>
          <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-slate-200">Settings</span>
          </div>
          <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button 
          onClick={handleLogout}
          className="w-full bg-slate-900 border border-red-900/50 rounded-xl p-4 flex items-center justify-between hover:border-red-800 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-red-400">Logout</span>
          </div>
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
