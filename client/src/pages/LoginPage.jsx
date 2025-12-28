import { useState } from 'react';

export default function LoginPage({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const body = isRegister 
        ? { email, password, displayName }
        : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (res.ok) {
        onLogin(data.user);
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Runtz AI" className="w-32 h-32 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">AI Image Maker</p>
        </div>

        {/* Login/Register Card */}
        <div className="card-glow">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="input-field"
                  placeholder="Your name"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-cyber-blue hover:text-cyber-purple transition-colors"
            >
              {isRegister 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Register"}
            </button>
          </div>

          {isRegister && (
            <div className="mt-4 p-3 bg-cyber-blue/10 border border-cyber-blue rounded-lg text-sm text-center">
              <span className="text-cyber-blue font-semibold">🎁 Get 500 free credits</span> when you sign up!
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="text-cyber-blue text-2xl mb-1">5</div>
            <div className="text-gray-400">AI Models</div>
          </div>
          <div>
            <div className="text-cyber-purple text-2xl mb-1">97+</div>
            <div className="text-gray-400">Quality Score</div>
          </div>
          <div>
            <div className="text-cyber-magenta text-2xl mb-1">∞</div>
            <div className="text-gray-400">Possibilities</div>
          </div>
        </div>
      </div>
    </div>
  );
}
