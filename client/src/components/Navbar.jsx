import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      onLogout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="bg-cyber-surface border-b border-cyber-border">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center">
            <img src="/logo.png" alt="Runtz AI" className="w-12 h-12" />
          </Link>

          {/* Nav Links */}
          <div className="flex items-center space-x-6">
            <Link 
              to="/dashboard" 
              className="text-gray-300 hover:text-cyber-blue transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              to="/vault" 
              className="text-gray-300 hover:text-cyber-blue transition-colors"
            >
              Vault
            </Link>

            {/* Credits Badge */}
            <div className="px-4 py-2 bg-gradient-cyber rounded-lg font-semibold">
              {user.creditsBalance} credits
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <span className="text-gray-400 text-sm">{user.displayName || user.email}</span>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-400 transition-colors text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
