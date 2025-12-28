import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import JobCard from '../components/JobCard';
import PresetQuestions from '../components/PresetQuestions';

export default function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState('idea'); // 'idea' or 'json'
  const [idea, setIdea] = useState('');
  const [jsonPrompt, setJsonPrompt] = useState('');
  const [presetKey, setPresetKey] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1024x1024');
  const [moodTags, setMoodTags] = useState('');
  const [referenceImages, setReferenceImages] = useState([]);
  const [presetAnswers, setPresetAnswers] = useState({});
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showPresetQuestions, setShowPresetQuestions] = useState(false);

  useEffect(() => {
    loadJobs();
    const interval = setInterval(loadJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Show preset questions for business presets
    if (presetKey === 'business-headshots' || presetKey === 'business-action') {
      setShowPresetQuestions(true);
    } else {
      setShowPresetQuestions(false);
      setPresetAnswers({});
    }
  }, [presetKey]);

  const loadJobs = async () => {
    try {
      const res = await fetch('/api/jobs?limit=10', {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs);
      }
    } catch (error) {
      console.error('Failed to load jobs:', error);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          credentials: 'include',
          body: formData
        });
        
        if (res.ok) {
          const data = await res.json();
          setReferenceImages(prev => [...prev, data.url]);
        }
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    if (mode === 'idea' && !idea.trim()) {
      alert('Please enter an idea');
      return;
    }
    
    if (mode === 'json' && !jsonPrompt.trim()) {
      alert('Please enter a prompt');
      return;
    }
    
    setCreating(true);
    
    try {
      const payload = {
        aspectRatio,
        referenceImages
      };
      
      // Handle custom prompt mode (JSON or plain text)
      if (mode === 'json') {
        payload.bypassPromptCreation = true;
        
        // Try to parse as JSON, if it fails treat as plain text
        try {
          const parsedPrompt = JSON.parse(jsonPrompt);
          payload.directPrompt = parsedPrompt;
        } catch (e) {
          // Not JSON, treat as plain text prompt
          payload.directPrompt = {
            masterPrompt: jsonPrompt.trim(),
            negatives: '',
            styleNotes: '',
            params: {},
            style: {}
          };
        }
      } else {
        // Normal mode with idea
        payload.idea = idea.trim();
        payload.presetKey = presetKey || null;
        payload.moodTags = moodTags || null;
        payload.presetAnswers = presetAnswers;
      }
      
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        setIdea('');
        setJsonPrompt('');
        setMoodTags('');
        setReferenceImages([]);
        setPresetAnswers({});
        loadJobs();
        setTimeout(() => {
          navigate(`/jobs/${data.job.id}`);
        }, 1000);
      } else {
        alert(data.error || 'Failed to create job');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const presets = [
    { key: '', label: 'None' },
    { key: 'reference', label: '🖼️ Reference' },
    { key: 'business-headshots', label: '👔 Business Headshots' },
    { key: 'business-action', label: '💼 Business in Action' },
    { key: 'photorealistic', label: '📸 Photorealistic' },
    { key: 'artistic', label: '🎨 Artistic' },
    { key: 'cinematic', label: '🎬 Cinematic' },
    { key: 'product', label: '📦 Product' },
    { key: 'portrait', label: '👤 Portrait' },
    { key: 'landscape', label: '🏞️ Landscape' }
  ];

  const aspectRatios = [
    { value: '1024x1024', label: '1:1 Square' },
    { value: '1024x1536', label: '2:3 Portrait' },
    { value: '1536x1024', label: '3:2 Landscape' },
    { value: '1024x1792', label: '9:16 Vertical' },
    { value: '1792x1024', label: '16:9 Horizontal' }
  ];

  return (
    <div className="min-h-screen">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Create New Generation */}
        <div className="card-glow mb-8">
          <h2 className="text-3xl font-bold gradient-text mb-6">Create New Generation</h2>
          
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode('idea')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                mode === 'idea'
                  ? 'bg-gradient-to-r from-cyber-blue to-cyber-purple text-white'
                  : 'bg-cyber-surface text-gray-400 hover:text-white'
              }`}
            >
              💡 Describe Idea
            </button>
            <button
              onClick={() => setMode('json')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                mode === 'json'
                  ? 'bg-gradient-to-r from-cyber-blue to-cyber-purple text-white'
                  : 'bg-cyber-surface text-gray-400 hover:text-white'
              }`}
            >
              📋 Paste Your Own Prompt
            </button>
          </div>

          <form onSubmit={handleCreate} className="space-y-6">
            {mode === 'idea' ? (
              <>
                {/* Idea Input */}
                <div>
                  <label className="block text-sm font-medium mb-2">Your Idea</label>
                  <textarea
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="Describe your image idea... (e.g., 'a futuristic city at sunset with flying cars')"
                    className="w-full px-4 py-3 bg-cyber-surface border border-cyber-border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-blue resize-none"
                    rows="4"
                  />
                </div>

                {/* Preset Questions (conditional) */}
                {showPresetQuestions && (
                  <PresetQuestions
                    presetKey={presetKey}
                    answers={presetAnswers}
                    onChange={setPresetAnswers}
                    onIdeaUpdate={setIdea}
                  />
                )}

                {/* Reference Images */}
                <div>
                  <label className="block text-sm font-medium mb-2">Reference Images (optional)</label>
                  <div className="flex items-center gap-4">
                    <label className="px-4 py-2 bg-cyber-surface border border-cyber-border rounded-lg cursor-pointer hover:border-cyber-blue transition-colors">
                      <span>📤 Upload Images</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    {referenceImages.length > 0 && (
                      <span className="text-sm text-gray-400">{referenceImages.length} image(s) uploaded</span>
                    )}
                  </div>
                  {referenceImages.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {referenceImages.map((url, idx) => (
                        <div key={idx} className="relative w-20 h-20">
                          <img src={url} alt={`Reference ${idx + 1}`} className="w-full h-full object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => setReferenceImages(prev => prev.filter((_, i) => i !== idx))}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-white text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Preset Style */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Preset Style</label>
                    <select
                      value={presetKey}
                      onChange={(e) => setPresetKey(e.target.value)}
                      className="w-full px-4 py-3 bg-cyber-surface border border-cyber-border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-blue"
                    >
                      {presets.map(p => (
                        <option key={p.key} value={p.key}>{p.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Aspect Ratio */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Aspect Ratio</label>
                    <select
                      value={aspectRatio}
                      onChange={(e) => setAspectRatio(e.target.value)}
                      className="w-full px-4 py-3 bg-cyber-surface border border-cyber-border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-blue"
                    >
                      {aspectRatios.map(ar => (
                        <option key={ar.value} value={ar.value}>{ar.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Mood Tags */}
                <div>
                  <label className="block text-sm font-medium mb-2">Mood Tags (optional)</label>
                  <input
                    type="text"
                    value={moodTags}
                    onChange={(e) => setMoodTags(e.target.value)}
                    placeholder="e.g., dramatic, vibrant, moody"
                    className="w-full px-4 py-3 bg-cyber-surface border border-cyber-border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-blue"
                  />
                </div>
              </>
            ) : (
              <>
                {/* JSON Prompt Input */}
                <div>
                  <label className="block text-sm font-medium mb-2">Your Prompt</label>
                  <textarea
                    value={jsonPrompt}
                    onChange={(e) => setJsonPrompt(e.target.value)}
                    placeholder='Paste your prompt here (text or JSON format)...\n\nText: "A professional headshot of a CEO in a modern office"\n\nJSON: {"masterPrompt": "...", "negatives": "..."}'
                    className="w-full px-4 py-3 bg-cyber-surface border border-cyber-border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-blue resize-none text-sm"
                    rows="8"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Paste any prompt (plain text or JSON from your vault). This will bypass prompt creation and go straight to image generation.
                  </p>
                </div>

                {/* Aspect Ratio */}
                <div>
                  <label className="block text-sm font-medium mb-2">Aspect Ratio</label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full px-4 py-3 bg-cyber-surface border border-cyber-border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-blue"
                  >
                    {aspectRatios.map(ar => (
                      <option key={ar.value} value={ar.value}>{ar.label}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={creating}
              className="w-full py-4 bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-pink rounded-lg font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {creating ? 'Creating...' : `Generate with 5 AI Models (≈${mode === 'json' ? '417' : '467'} credits)`}
            </button>
          </form>
        </div>

        {/* Recent Generations */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Recent Generations</h2>
          {jobs.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No generations yet. Create your first one above!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
