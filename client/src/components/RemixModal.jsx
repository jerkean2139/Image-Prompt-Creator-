import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RemixModal({ image, originalPrompt, onClose }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState('variation'); // variation, style, upscale
  const [prompt, setPrompt] = useState(originalPrompt || '');
  const [strength, setStrength] = useState(0.7);

  const handleRemix = () => {
    // Navigate to create page with remix data
    navigate('/create', {
      state: {
        remixMode: mode,
        referenceImage: image.url,
        prompt: prompt,
        strength: strength
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-slate-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Remix Image</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Preview */}
        <div className="aspect-video rounded-xl overflow-hidden mb-6 bg-slate-800">
          <img src={image.url} alt="Original" className="w-full h-full object-contain" />
        </div>

        {/* Mode Selection */}
        <div className="mb-6">
          <label className="block text-slate-200 text-sm font-medium mb-3">Remix Mode</label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setMode('variation')}
              className={`p-4 rounded-xl border-2 transition-all ${
                mode === 'variation'
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-slate-800 bg-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="text-2xl mb-2">🎨</div>
              <div className={`text-sm font-medium ${
                mode === 'variation' ? 'text-indigo-400' : 'text-slate-300'
              }`}>
                Variation
              </div>
              <div className="text-xs text-slate-500 mt-1">Similar style</div>
            </button>

            <button
              onClick={() => setMode('style')}
              className={`p-4 rounded-xl border-2 transition-all ${
                mode === 'style'
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-slate-800 bg-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="text-2xl mb-2">✨</div>
              <div className={`text-sm font-medium ${
                mode === 'style' ? 'text-indigo-400' : 'text-slate-300'
              }`}>
                Style Transfer
              </div>
              <div className="text-xs text-slate-500 mt-1">New style</div>
            </button>

            <button
              onClick={() => setMode('upscale')}
              className={`p-4 rounded-xl border-2 transition-all ${
                mode === 'upscale'
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-slate-800 bg-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="text-2xl mb-2">🔍</div>
              <div className={`text-sm font-medium ${
                mode === 'upscale' ? 'text-indigo-400' : 'text-slate-300'
              }`}>
                Upscale
              </div>
              <div className="text-xs text-slate-500 mt-1">Higher res</div>
            </button>
          </div>
        </div>

        {/* Prompt (for variation and style) */}
        {mode !== 'upscale' && (
          <div className="mb-6">
            <label className="block text-slate-200 text-sm font-medium mb-3">
              {mode === 'variation' ? 'Modify Prompt (optional)' : 'New Style Description'}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={mode === 'variation' 
                ? 'Keep original or modify...' 
                : 'Describe the new style...'
              }
              rows="4"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
        )}

        {/* Strength (for variation and style) */}
        {mode !== 'upscale' && (
          <div className="mb-6">
            <label className="block text-slate-200 text-sm font-medium mb-3">
              Transformation Strength: {strength.toFixed(1)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={strength}
              onChange={(e) => setStrength(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Keep Original</span>
              <span>More Creative</span>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-slate-300">
              {mode === 'variation' && 'Create variations of this image with similar composition and style.'}
              {mode === 'style' && 'Transfer the style from this image to a new subject or scene.'}
              {mode === 'upscale' && 'Enhance the resolution and details of this image using AI upscaling.'}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleRemix}
            className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            {mode === 'upscale' ? 'Upscale Image' : 'Create Remix'}
          </button>
        </div>
      </div>
    </div>
  );
}
