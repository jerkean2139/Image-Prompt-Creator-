import { PRESET_TEMPLATES } from './presetPrompts.js';

/**
 * Mock prompt maker that creates prompts without calling Claude API
 * Useful for testing and when modelfarm is not available
 */

export async function createMockPrompt(idea, presetKey, aspectRatio, moodTags, presetAnswers) {
  // Get preset template
  const preset = PRESET_TEMPLATES[presetKey] || null;
  
  // Build master prompt from idea and preset
  let masterPrompt = idea;
  
  // Add preset-specific enhancements
  if (preset && preset.masterPrompt) {
    const presetGuidelines = preset.masterPrompt.split('\n').slice(0, 3).join(' ');
    masterPrompt = `${idea}. ${presetGuidelines}`;
  }
  
  // Add mood tags if provided
  if (moodTags) {
    masterPrompt += `. Mood: ${moodTags}`;
  }
  
  // Add aspect ratio context
  const aspectMap = {
    '1024x1024': 'square composition',
    '1536x1024': 'wide landscape format',
    '1024x1536': 'tall portrait format',
    '1792x1024': 'ultra-wide cinematic format',
    '1024x1792': 'ultra-tall format'
  };
  
  if (aspectMap[aspectRatio]) {
    masterPrompt += `, ${aspectMap[aspectRatio]}`;
  }
  
  // Create provider-specific prompts
  const providerPrompts = {
    OPENAI_GPT52_IMAGE: enhanceForOpenAI(masterPrompt, preset),
    OPENAI_DALLE3: enhanceForDALLE(masterPrompt, preset),
    GEMINI_NANOBANANA_PRO: enhanceForGemini(masterPrompt, preset),
    FLUX_PRO_2: enhanceForFlux(masterPrompt, preset),
    IDEOGRAM: enhanceForIdeogram(masterPrompt, preset)
  };
  
  return {
    masterPrompt,
    negatives: 'blurry, low quality, distorted, ugly, bad anatomy, watermark, text, signature',
    styleNotes: preset ? preset.name : 'General',
    params: {
      aspectRatio,
      moodTags,
      presetKey
    },
    style: {
      preset: presetKey || 'none'
    },
    providerPrompts,
    gradeScore: 95, // Mock grade score
    gradeNotes: 'Mock prompt - testing mode'
  };
}

function enhanceForOpenAI(prompt, preset) {
  // OpenAI likes technical photography terms
  return `${prompt}, professional photography, high resolution, sharp focus, detailed, 8k quality`;
}

function enhanceForDALLE(prompt, preset) {
  // DALL-E likes natural language descriptions
  return `A highly detailed image of ${prompt}, with excellent composition and lighting`;
}

function enhanceForGemini(prompt, preset) {
  // Gemini likes structured descriptions
  return `${prompt}. Technical specifications: high quality, professional grade, detailed rendering`;
}

function enhanceForFlux(prompt, preset) {
  // Flux likes artistic emphasis
  return `${prompt}, artistic composition, creative interpretation, visually stunning`;
}

function enhanceForIdeogram(prompt, preset) {
  // Ideogram likes quality keywords
  return `${prompt}, masterpiece, best quality, highly detailed, professional`;
}

export async function createProviderSpecificPrompts(masterPromptData) {
  // If provider prompts already exist, return them
  if (masterPromptData.providerPrompts) {
    return masterPromptData.providerPrompts;
  }
  
  // Otherwise create them from master prompt
  const { masterPrompt } = masterPromptData;
  
  return {
    OPENAI_GPT52_IMAGE: enhanceForOpenAI(masterPrompt),
    OPENAI_DALLE3: enhanceForDALLE(masterPrompt),
    GEMINI_NANOBANANA_PRO: enhanceForGemini(masterPrompt),
    FLUX_PRO_2: enhanceForFlux(masterPrompt),
    IDEOGRAM: enhanceForIdeogram(masterPrompt)
  };
}
