import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

export default function ProfilePage({ user }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await fetch('/api/user/stats', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 pt-12 pb-8 px-6">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl font-bold text-white">
              {user?.displayName?.charAt(0) || user?.email?.charAt(0) || '?'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {user?.displayName || 'User'}
          </h1>
          <p className="text-indigo-100 text-sm">{user?.email}</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-6 space-y-6">
        {/* Credits Card */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-indigo-100 text-sm">Available Credits</p>
              <p className="text-4xl font-bold">{user?.creditsBalance || 0}</p>
            </div>
            <svg className="w-16 h-16 text-white/20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/>
            </svg>
          </div>
          <button
            onClick={() => navigate('/credits')}
            className="w-full py-3 bg-white/20 backdrop-blur-sm rounded-xl font-semibold hover:bg-white/30 transition-colors"
          >
            Buy More Credits
          </button>
        </div>

        {/* Stats Grid */}
        {!loading && stats && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
              <p className="text-slate-400 text-sm mb-1">Total Generations</p>
              <p className="text-2xl font-bold text-white">{stats.totalGenerations || 0}</p>
            </div>
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
              <p className="text-slate-400 text-sm mb-1">Images Created</p>
              <p className="text-2xl font-bold text-white">{stats.totalImages || 0}</p>
            </div>
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
              <p className="text-slate-400 text-sm mb-1">Credits Used</p>
              <p className="text-2xl font-bold text-white">{stats.creditsUsed || 0}</p>
            </div>
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
              <p className="text-slate-400 text-sm mb-1">Favorites</p>
              <p className="text-2xl font-bold text-white">{stats.favorites || 0}</p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/prompt-library')}
            className="w-full p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-indigo-500 transition-all flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Prompt Library</p>
                <p className="text-slate-400 text-sm">Saved prompts</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button
            onClick={() => navigate('/settings')}
            className="w-full p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-indigo-500 transition-all flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Settings</p>
                <p className="text-slate-400 text-sm">Preferences & account</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl font-semibold hover:bg-red-500/20 transition-colors"
        >
          Logout
        </button>

        {/* App Info */}
        <div className="text-center text-slate-500 text-sm space-y-1 pt-4">
          <p>Runtz AI Image Maker</p>
          <p>Version 2.0.0</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
