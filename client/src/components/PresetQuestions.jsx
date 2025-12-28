import { useState, useEffect } from 'react';

const PRESET_QUESTIONS = {
  'business-headshots': [
    {
      id: 'setting',
      question: 'Where is the headshot taken?',
      suggestions: ['office', 'studio', 'outdoors', 'conference room', 'modern workspace', 'home office', 'co-working space'],
      placeholder: 'e.g., modern office'
    },
    {
      id: 'attire',
      question: 'What is the person wearing?',
      suggestions: ['business suit', 'casual blazer', 'dress shirt', 'polo shirt', 'professional dress', 'smart casual', 'tech startup casual'],
      placeholder: 'e.g., navy blue suit'
    },
    {
      id: 'background',
      question: 'What kind of background?',
      suggestions: ['solid white', 'solid gray', 'blurred office', 'neutral gradient', 'soft bokeh', 'minimalist', 'corporate blue'],
      placeholder: 'e.g., blurred office'
    },
    {
      id: 'mood',
      question: 'What mood/expression?',
      suggestions: ['confident', 'friendly', 'approachable', 'serious', 'professional', 'warm smile', 'determined'],
      placeholder: 'e.g., confident and approachable'
    }
  ],
  'business-action': [
    {
      id: 'activity',
      question: 'What activity is happening?',
      suggestions: ['team meeting', 'presentation', 'collaboration', 'brainstorming', 'working at desk', 'video call', 'coffee break discussion'],
      placeholder: 'e.g., team meeting'
    },
    {
      id: 'location',
      question: 'Where is this taking place?',
      suggestions: ['conference room', 'open office', 'coffee shop', 'modern workspace', 'boardroom', 'standing desk area', 'lounge area'],
      placeholder: 'e.g., conference room'
    },
    {
      id: 'people',
      question: 'How many people?',
      suggestions: ['one person', 'two people', 'small team (3-5)', 'large group (6+)', 'diverse team', 'mixed genders', 'all professionals'],
      placeholder: 'e.g., small team of 4'
    },
    {
      id: 'atmosphere',
      question: 'What\'s the atmosphere?',
      suggestions: ['focused', 'collaborative', 'energetic', 'casual', 'formal', 'innovative', 'productive'],
      placeholder: 'e.g., collaborative and energetic'
    }
  ]
};

export default function PresetQuestions({ presetKey, answers, onChange, onIdeaUpdate }) {
  const [showSuggestions, setShowSuggestions] = useState({});
  const questions = PRESET_QUESTIONS[presetKey] || [];

  useEffect(() => {
    // Auto-generate idea from answers
    if (Object.keys(answers).length > 0) {
      const parts = [];
      questions.forEach(q => {
        if (answers[q.id]) {
          parts.push(answers[q.id]);
        }
      });
      if (parts.length > 0) {
        const generatedIdea = parts.join(', ');
        onIdeaUpdate(generatedIdea);
      }
    }
  }, [answers]);

  const handleAnswerChange = (questionId, value) => {
    onChange({
      ...answers,
      [questionId]: value
    });
  };

  const handleSuggestionClick = (questionId, suggestion) => {
    const currentValue = answers[questionId] || '';
    const newValue = currentValue ? `${currentValue}, ${suggestion}` : suggestion;
    handleAnswerChange(questionId, newValue);
    setShowSuggestions({ ...showSuggestions, [questionId]: false });
  };

  if (questions.length === 0) return null;

  return (
    <div className="space-y-4 p-4 bg-cyber-surface/50 rounded-lg border border-cyber-border">
      <h3 className="text-lg font-semibold gradient-text">Quick Setup Questions</h3>
      <p className="text-sm text-gray-400">Answer these to help us create the perfect prompt, or skip and describe freely above.</p>
      
      {questions.map(q => (
        <div key={q.id} className="space-y-2">
          <label className="block text-sm font-medium">{q.question}</label>
          <div className="relative">
            <input
              type="text"
              value={answers[q.id] || ''}
              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
              onFocus={() => setShowSuggestions({ ...showSuggestions, [q.id]: true })}
              onBlur={() => setTimeout(() => setShowSuggestions({ ...showSuggestions, [q.id]: false }), 200)}
              placeholder={q.placeholder}
              className="w-full px-4 py-2 bg-cyber-surface border border-cyber-border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-blue text-sm"
            />
            
            {/* Suggestions Dropdown */}
            {showSuggestions[q.id] && (
              <div className="absolute z-10 w-full mt-1 bg-cyber-surface border border-cyber-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {q.suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSuggestionClick(q.id, suggestion);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-cyber-blue/20 transition-colors text-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
      
      <p className="text-xs text-gray-500 italic">
        💡 Tip: Your answers are automatically combined into the idea above. You can still edit it freely!
      </p>
    </div>
  );
}
