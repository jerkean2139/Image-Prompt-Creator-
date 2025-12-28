import { useState } from 'react';

const ONBOARDING_STEPS = [
  {
    title: 'Welcome to Runtz AI',
    description: 'Create stunning AI-generated images with 5 powerful models working together',
    icon: '🎨',
    image: null
  },
  {
    title: 'Describe Your Vision',
    description: 'Simply type what you want to create. Our AI will understand and generate amazing results',
    icon: '✨',
    image: null
  },
  {
    title: 'Organize & Share',
    description: 'Save your favorites, create collections, and share your creations with the world',
    icon: '📱',
    image: null
  },
  {
    title: 'You\'re All Set!',
    description: 'Start creating with 500 free credits. Let your imagination run wild!',
    icon: '🚀',
    image: null
  }
];

export default function Onboarding({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('onboarding_completed', 'true');
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_completed', 'true');
    onComplete();
  };

  const step = ONBOARDING_STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
      {/* Skip Button */}
      {currentStep < ONBOARDING_STEPS.length - 1 && (
        <button
          onClick={handleSkip}
          className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
        >
          Skip
        </button>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Icon/Image */}
        <div className="mb-8 animate-scale-in">
          {step.image ? (
            <img src={step.image} alt={step.title} className="w-64 h-64 object-contain" />
          ) : (
            <div className="text-8xl mb-4">{step.icon}</div>
          )}
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-white mb-4 animate-slide-up">
          {step.title}
        </h2>

        {/* Description */}
        <p className="text-lg text-slate-400 max-w-md mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
          {step.description}
        </p>

        {/* Progress Dots */}
        <div className="flex space-x-2 mb-8">
          {ONBOARDING_STEPS.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentStep
                  ? 'w-8 bg-gradient-to-r from-indigo-500 to-purple-500'
                  : 'bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-indigo-500/50 transition-all animate-scale-in"
          style={{ animationDelay: '200ms' }}
        >
          {currentStep < ONBOARDING_STEPS.length - 1 ? 'Next' : 'Get Started'}
        </button>
      </div>
    </div>
  );
}
