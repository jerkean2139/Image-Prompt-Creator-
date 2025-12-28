import Anthropic from '@anthropic-ai/sdk';
import { PRESET_TEMPLATES, PROVIDER_OPTIMIZATIONS } from './presetPrompts.js';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: process.env.ANTHROPIC_BASE_URL
});

const MASTER_PROMPT_SYSTEM = `You are an expert AI prompt engineer specializing in image generation. Your task is to transform user ideas into professional, detailed master prompts.

**Your Process:**
1. Analyze the user's idea and the selected preset style
2. Apply the preset-specific guidelines to enhance the prompt
3. Create a rich, detailed master prompt that captures the essence
4. Include technical specifications appropriate to the style
5. Generate appropriate negative prompts

**Output Format (JSON):**
{
  "masterPrompt": "The comprehensive master prompt (200-300 words)",
  "negatives": "Negative prompt to avoid unwanted elements",
  "styleNotes": "Brief notes on style decisions made"
}`;

const PROVIDER_SPECIFIC_SYSTEM = `You are an expert at adapting image generation prompts for specific AI models. Each model has unique strengths and optimal prompt formats.

**Your Task:**
Take the master prompt and create 5 provider-specific variations, each optimized for that provider's strengths.

**Output Format (JSON):**
{
  "prompts": {
    "OPENAI_GPT52_IMAGE": "Prompt optimized for OpenAI GPT Image 1.5",
    "OPENAI_DALLE3": "Prompt optimized for DALL-E 3",
    "GEMINI_NANOBANANA_PRO": "Prompt optimized for Gemini",
    "FLUX_PRO_2": "Prompt optimized for Flux Pro 2",
    "IDEOGRAM": "Prompt optimized for Ideogram"
  }
}`;

/**
 * Step 1: Create master prompt based on user idea and preset
 */
export async function createMasterPrompt(idea, presetKey = null, aspectRatio = null, moodTags = null) {
  try {
    const preset = presetKey ? PRESET_TEMPLATES[presetKey] : null;
    
    let userMessage = `Create a master image generation prompt for this idea:\n\n"${idea}"\n\n`;
    
    if (preset) {
      userMessage += `**Preset Style:** ${preset.name}\n\n`;
      userMessage += `**Preset Guidelines:**\n${preset.masterPrompt}\n\n`;
    }
    
    if (aspectRatio) {
      userMessage += `**Aspect Ratio:** ${aspectRatio}\n`;
    }
    
    if (moodTags) {
      userMessage += `**Mood/Tags:** ${moodTags}\n`;
    }
    
    userMessage += `\nProvide your response as valid JSON matching the specified format.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: MASTER_PROMPT_SYSTEM,
      messages: [{
        role: 'user',
        content: userMessage
      }]
    });

    const content = response.content[0].text;
    
    let promptData;
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        promptData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse Claude response:', content);
      promptData = {
        masterPrompt: content,
        negatives: 'low quality, blurry, distorted, ugly, bad anatomy',
        styleNotes: 'Fallback prompt generation'
      };
    }

    return {
      success: true,
      masterPrompt: promptData,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens
      }
    };
  } catch (error) {
    console.error('Master prompt creation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Step 2: Create provider-specific prompts from master prompt
 */
export async function createProviderSpecificPrompts(masterPrompt, presetKey = null) {
  try {
    let userMessage = `Create 5 provider-specific prompt variations from this master prompt:\n\n`;
    userMessage += `**Master Prompt:**\n${masterPrompt.masterPrompt}\n\n`;
    userMessage += `**Negative Prompt:**\n${masterPrompt.negatives}\n\n`;
    
    if (presetKey && PRESET_TEMPLATES[presetKey]) {
      userMessage += `**Preset Context:** ${PRESET_TEMPLATES[presetKey].name}\n\n`;
    }
    
    userMessage += `**Provider Optimization Guidelines:**\n\n`;
    
    Object.entries(PROVIDER_OPTIMIZATIONS).forEach(([provider, config]) => {
      userMessage += `**${config.name}:**\n${config.optimization}\n\n`;
    });
    
    userMessage += `\nCreate 5 optimized variations. Provide your response as valid JSON matching the specified format.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      system: PROVIDER_SPECIFIC_SYSTEM,
      messages: [{
        role: 'user',
        content: userMessage
      }]
    });

    const content = response.content[0].text;
    
    let promptData;
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        promptData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse provider prompts:', content);
      // Fallback: use master prompt for all providers
      promptData = {
        prompts: {
          'OPENAI_GPT52_IMAGE': masterPrompt.masterPrompt,
          'OPENAI_DALLE3': masterPrompt.masterPrompt,
          'GEMINI_NANOBANANA_PRO': masterPrompt.masterPrompt,
          'FLUX_PRO_2': masterPrompt.masterPrompt,
          'IDEOGRAM': masterPrompt.masterPrompt
        }
      };
    }

    return {
      success: true,
      providerPrompts: promptData.prompts,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens
      }
    };
  } catch (error) {
    console.error('Provider-specific prompt creation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Complete prompt creation workflow
 */
export async function createPrompt(idea, referenceImages = [], presetKey = null, aspectRatio = null, moodTags = null) {
  // Step 1: Create master prompt
  const masterResult = await createMasterPrompt(idea, presetKey, aspectRatio, moodTags);
  
  if (!masterResult.success) {
    return masterResult;
  }
  
  // Step 2: Create provider-specific prompts
  const providerResult = await createProviderSpecificPrompts(masterResult.masterPrompt, presetKey);
  
  if (!providerResult.success) {
    return providerResult;
  }
  
  return {
    success: true,
    masterPrompt: masterResult.masterPrompt,
    providerPrompts: providerResult.providerPrompts,
    usage: {
      inputTokens: masterResult.usage.inputTokens + providerResult.usage.inputTokens,
      outputTokens: masterResult.usage.outputTokens + providerResult.usage.outputTokens
    }
  };
}
