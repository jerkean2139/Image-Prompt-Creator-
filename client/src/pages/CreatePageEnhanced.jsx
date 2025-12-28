import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import PromptSuggestions, { QUICK_START_PROMPTS } from '../components/PromptSuggestions';

export default function CreatePage() {
  const navigate = useNavigate();
  const [idea, setIdea] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [presetKey, setPresetKey] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1024x1024');
  const [moodTags, setMoodTags] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [seed, setSeed] = useState('');
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [creating, setCreating] = useState(false);
  const [showQuickStart, setShowQuickStart] = useState(true);

  const presets = [
    { key: '', label: 'None', icon: '⚡' },
    { key: 'cinematic', label: 'Cinematic', icon: '🎬' },
    { key: 'photorealistic', label: 'Photorealistic', icon: '📸' },
    { key: 'artistic', label: 'Artistic', icon: '🎨' },
    { key: 'portrait', label: 'Portrait', icon: '👤' },
  ];

  const aspectRatios = [
    { value: '1024x1024', label: '1:1 Square', icon: '⬜' },
    { value: '1024x1536', label: '2:3 Portrait', icon: '📱' },
    { value: '1536x1024', label: '3:2 Landscape', icon: '🖼️' },
    { value: '1024x1792', label: '9:16 Vertical', icon: '📲' },
    { value: '1792x1024', label: '16:9 Horizontal', icon: '🖥️' }
  ];

  const handleQuickStart = (prompt) => {
    setIdea(prompt.prompt);
    setShowQuickStart(false);
  };

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
          negativePrompt: negativePrompt.trim() || null,
          presetKey: presetKey || null,
          aspectRatio,
          moodTags: moodTags || null,
          seed: seed ? parseInt(seed) : null,
          guidanceScale: parseFloat(guidanceScale)
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

  const randomizeSeed = () => {
    setSeed(Math.floor(Math.random() * 1000000).toString());
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

      {/* Quick Start Prompts */}
      {showQuickStart && !idea && (
        <div className="max-w-lg mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">✨ Quick Start</h3>
            <button
              onClick={() => setShowQuickStart(false)}
              className="text-slate-400 hover:text-white text-sm"
            >
              Hide
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_START_PROMPTS.slice(0, 4).map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickStart(prompt)}
                className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-indigo-500 transition-all text-left"
              >
                <p className="text-sm font-semibold text-white mb-1">{prompt.title}</p>
                <p className="text-xs text-slate-400 line-clamp-2">{prompt.prompt}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleCreate} className="max-w-lg mx-auto px-6 py-6 space-y-6">
        {/* Idea Input with Suggestions */}
        <div className="relative">
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
          <PromptSuggestions value={idea} onSelect={setIdea} />
        </div>

        {/* Negative Prompt */}
        <div>
          <label className="block text-slate-200 text-sm font-medium mb-3">
            Negative Prompt <span className="text-slate-500">(what to avoid)</span>
          </label>
          <input
            type="text"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            placeholder="e.g., blurry, low quality, distorted"
            className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
          <div className="grid grid-cols-2 gap-3">
            {aspectRatios.map(ar => (
              <button
                key={ar.value}
                type="button"
                onClick={() => setAspectRatio(ar.value)}
                className={`p-3 rounded-xl border-2 transition-all flex items-center space-x-2 ${
                  aspectRatio === ar.value
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                }`}
              >
                <span className="text-xl">{ar.icon}</span>
                <span className={`text-sm font-medium ${
                  aspectRatio === ar.value ? 'text-indigo-400' : 'text-slate-300'
                }`}>
                  {ar.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Settings Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 hover:border-slate-700 transition-colors flex items-center justify-between px-4"
        >
          <span className="font-medium">⚙️ Advanced Settings</span>
          <svg
            className={`w-5 h-5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Advanced Settings */}
        {showAdvanced && (
          <div className="space-y-4 p-4 bg-slate-900 border border-slate-800 rounded-xl">
            {/* Seed */}
            <div>
              <label className="block text-slate-200 text-sm font-medium mb-2">
                Seed <span className="text-slate-500">(for reproducibility)</span>
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  placeholder="Random"
                  className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={randomizeSeed}
                  className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:border-indigo-500 transition-colors"
                >
                  🎲
                </button>
              </div>
            </div>

            {/* Guidance Scale */}
            <div>
              <label className="block text-slate-200 text-sm font-medium mb-2">
                Guidance Scale: {guidanceScale}
              </label>
              <input
                type="range"
                min="1"
                max="20"
                step="0.5"
                value={guidanceScale}
                onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>More Creative</span>
                <span>More Accurate</span>
              </div>
            </div>

            {/* Mood Tags */}
            <div>
              <label className="block text-slate-200 text-sm font-medium mb-2">
                Mood Tags
              </label>
              <input
                type="text"
                value={moodTags}
                onChange={(e) => setMoodTags(e.target.value)}
                placeholder="e.g., dramatic, vibrant, moody"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}

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
