/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./client/index.html",
    "./client/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#0a0e1a',
          surface: '#111827',
          border: '#1f2937',
          blue: '#3b82f6',
          purple: '#8b5cf6',
          magenta: '#ec4899',
          cyan: '#06b6d4',
          green: '#10b981',
        }
      },
      backgroundImage: {
        'gradient-cyber': 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
        'gradient-dark': 'linear-gradient(180deg, #0a0e1a 0%, #111827 100%)',
      },
      boxShadow: {
        'neon-blue': '0 0 20px rgba(59, 130, 246, 0.5)',
        'neon-purple': '0 0 20px rgba(139, 92, 246, 0.5)',
        'neon-magenta': '0 0 20px rgba(236, 72, 153, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.5), 0 0 10px rgba(139, 92, 246, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(139, 92, 246, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}
