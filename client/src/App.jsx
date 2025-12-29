import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import VaultPage from './pages/VaultPage';
import ProfilePage from './pages/ProfilePage';
import JobDetailPage from './pages/JobDetailPage';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        
        // Check if onboarding needed
        const completed = localStorage.getItem('onboarding_completed');
        if (!completed) {
          setShowOnboarding(true);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Onboarding disabled for now
  // if (showOnboarding && user) {
  //   return <Onboarding onComplete={() => setShowOnboarding(false)} />;
  // }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyber-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading PromptFusion...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={user ? <Navigate to="/dashboard" /> : <LoginPage onLogin={setUser} />} 
      />
      <Route 
        path="/dashboard" 
        element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/vault" 
        element={user ? <VaultPage user={user} onLogout={() => setUser(null)} /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/profile" 
        element={user ? <ProfilePage user={user} onLogout={() => setUser(null)} /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/jobs/:id" 
        element={user ? <JobDetailPage user={user} onLogout={() => setUser(null)} /> : <Navigate to="/login" />} 
      />
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
    </Routes>
  );
}

export default App;
