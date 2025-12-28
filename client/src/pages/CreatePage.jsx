import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

export default function CreatePage() {
  const navigate = useNavigate();
  const [idea, setIdea] = useState('');
  const [presetKey, setPresetKey] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1024x1024');
  const [moodTags, setMoodTags] = useState('');
  const [creating, setCreating] = useState(false);

  const presets = [
    { key: '', label: 'None', icon: '⚡' },
    { key: 'cinematic', label: 'Cinematic', icon: '🎬' },
    { key: 'photorealistic', label: 'Photorealistic', icon: '📸' },
    { key: 'artistic', label: 'Artistic', icon: '🎨' },
    { key: 'portrait', label: 'Portrait', icon: '👤' },
  ];

  const aspectRatios = [
    { value: '1024x1024', label: '1:1 Square' },
    { value: '1024x1536', label: '2:3 Portrait' },
    { value: '1536x1024', label: '3:2 Landscape' },
    { value: '1024x1792', label: '9:16 Vertical' },
    { value: '1792x1024', label: '16:9 Horizontal' }
  ];

  const handleCreate = async (e) => {
    e.preventDefault();
    
    if (!idea.trim()) {
      alert('Please describe your image idea');
      return;
    }
    
    setCreating(true);
    
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          idea: idea.trim(),
          presetKey: presetKey || null,
          aspectRatio,
          moodTags: moodTags || null
        })
      });

      const data = await res.json();

      if (res.ok) {
        navigate(`/jobs/${data.job.id}`);
      } else {
        alert(data.error || 'Failed to create job');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 pt-12 pb-6 px-6">
        <div className="max-w-lg mx-auto flex items-center">
          <button onClick={() => navigate('/dashboard')} className="text-white mr-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-white">Create Image</h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleCreate} className="max-w-lg mx-auto px-6 py-6 space-y-6">
        {/* Idea Input */}
        <div>
          <label className="block text-slate-200 text-sm font-medium mb-3">
            Describe Your Idea
          </label>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="A futuristic city at sunset with flying cars..."
            className="w-full px-4 py-4 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            rows="5"
          />
        </div>

        {/* Preset Style */}
        <div>
          <label className="block text-slate-200 text-sm font-medium mb-3">
            Preset Style
          </label>
          <div className="grid grid-cols-2 gap-3">
            {presets.map(preset => (
              <button
                key={preset.key}
                type="button"
                onClick={() => setPresetKey(preset.key)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  presetKey === preset.key
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="text-2xl mb-1">{preset.icon}</div>
                <div className={`text-sm font-medium ${
                  presetKey === preset.key ? 'text-indigo-400' : 'text-slate-300'
                }`}>
                  {preset.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Aspect Ratio */}
        <div>
          <label className="block text-slate-200 text-sm font-medium mb-3">
            Aspect Ratio
          </label>
          <select
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value)}
            className="w-full px-4 py-4 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {aspectRatios.map(ar => (
              <option key={ar.value} value={ar.value}>{ar.label}</option>
            ))}
          </select>
        </div>

        {/* Mood Tags */}
        <div>
          <label className="block text-slate-200 text-sm font-medium mb-3">
            Mood Tags <span className="text-slate-500">(optional)</span>
          </label>
          <input
            type="text"
            value={moodTags}
            onChange={(e) => setMoodTags(e.target.value)}
            placeholder="e.g., dramatic, vibrant, moody"
            className="w-full px-4 py-4 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={creating}
          className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-indigo-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {creating ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </span>
          ) : (
            'Generate with 5 AI Models (≈500 credits)'
          )}
        </button>

        <p className="text-center text-slate-500 text-sm">
          Your images will be ready in a few moments
        </p>
      </form>

      <BottomNav />
    </div>
  );
}
