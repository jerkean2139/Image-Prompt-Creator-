import { useState, useEffect } from 'react';

const PROMPT_TEMPLATES = {
  subjects: [
    'a majestic lion', 'a futuristic robot', 'a serene landscape', 'a cyberpunk city',
    'a fantasy castle', 'a space station', 'a vintage car', 'a mythical dragon',
    'a cozy cafe', 'a neon-lit street', 'a magical forest', 'an underwater scene'
  ],
  styles: [
    'photorealistic', 'oil painting', 'watercolor', 'digital art', 'anime style',
    'cinematic', 'minimalist', 'surreal', 'impressionist', 'cyberpunk',
    'steampunk', 'art nouveau', 'pop art', 'concept art'
  ],
  lighting: [
    'golden hour lighting', 'dramatic shadows', 'soft diffused light', 'neon lights',
    'moonlight', 'sunset', 'studio lighting', 'volumetric lighting', 'rim lighting',
    'backlit', 'natural light', 'moody lighting'
  ],
  details: [
    'highly detailed', '8k resolution', 'intricate details', 'sharp focus',
    'bokeh background', 'shallow depth of field', 'wide angle', 'macro shot',
    'atmospheric', 'cinematic composition', 'rule of thirds', 'symmetrical'
  ]
};

export default function PromptSuggestions({ value, onSelect }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (!value || value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const words = value.toLowerCase().split(' ');
    const lastWord = words[words.length - 1];

    if (lastWord.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Find matching suggestions from all categories
    const matches = [];
    Object.entries(PROMPT_TEMPLATES).forEach(([category, items]) => {
      items.forEach(item => {
        if (item.toLowerCase().includes(lastWord) && !value.toLowerCase().includes(item.toLowerCase())) {
          matches.push({ text: item, category });
        }
      });
    });

    setSuggestions(matches.slice(0, 5));
    setShowSuggestions(matches.length > 0);
  }, [value]);

  const handleSelect = (suggestion) => {
    const words = value.split(' ');
    words[words.length - 1] = suggestion.text;
    onSelect(words.join(' ') + ' ');
    setShowSuggestions(false);
  };

  if (!showSuggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="absolute z-10 w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
      <div className="p-2 space-y-1">
        {suggestions.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(suggestion)}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-between group"
          >
            <span className="text-slate-200 text-sm">{suggestion.text}</span>
            <span className="text-xs text-slate-500 capitalize group-hover:text-indigo-400 transition-colors">
              {suggestion.category}
            </span>
          </button>
        ))}
      </div>
      <div className="px-3 py-2 bg-slate-800/50 border-t border-slate-700 text-xs text-slate-500">
        💡 Press Tab or click to use suggestion
      </div>
    </div>
  );
}

// Export quick start prompts
export const QUICK_START_PROMPTS = [
  {
    title: 'Cyberpunk Portrait',
    prompt: 'A cyberpunk portrait of a person with neon hair, futuristic clothing, dramatic lighting, highly detailed, 8k'
  },
  {
    title: 'Fantasy Landscape',
    prompt: 'A magical fantasy landscape with floating islands, waterfalls, mystical creatures, golden hour lighting, cinematic'
  },
  {
    title: 'Product Photography',
    prompt: 'Professional product photography of a luxury watch, studio lighting, white background, highly detailed, commercial'
  },
  {
    title: 'Sci-Fi Scene',
    prompt: 'A futuristic space station orbiting a distant planet, volumetric lighting, stars, cinematic composition, 8k'
  },
  {
    title: 'Artistic Portrait',
    prompt: 'An artistic portrait in the style of oil painting, dramatic shadows, renaissance lighting, highly detailed'
  },
  {
    title: 'Nature Macro',
    prompt: 'Macro photography of a dewdrop on a flower petal, bokeh background, soft morning light, sharp focus'
  }
];
