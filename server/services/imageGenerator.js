import OpenAI from 'openai';
import axios from 'axios';

// Provider credit costs (based on A+ quality pricing)
export const PROVIDER_COSTS = {
  OPENAI_GPT52_IMAGE: 133, // High quality
  OPENAI_DALLE3: 80,       // HD
  GEMINI_NANOBANANA_PRO: 39,
  FLUX_PRO_2: 70,
  IDEOGRAM: 90             // Quality tier
};

// Initialize OpenAI client lazily to avoid crashes when key is missing
let openai = null;
function getOpenAI() {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL
    });
  }
  return openai;
}

/**
 * Generate image with OpenAI GPT Image 1.5 (High quality)
 */
export async function generateWithGPTImage(prompt, aspectRatio = '1024x1024') {
  try {
    const client = getOpenAI();
    if (!client) {
      return { success: false, error: 'OpenAI API key not configured' };
    }
    const response = await client.images.generate({
      model: 'gpt-image-1-5',
      prompt: prompt,
      n: 1,
      size: aspectRatio,
      quality: 'high',
      response_format: 'url'
    });

    return {
      success: true,
      images: response.data.map(img => ({
        url: img.url,
        width: parseInt(aspectRatio.split('x')[0]),
        height: parseInt(aspectRatio.split('x')[1])
      }))
    };
  } catch (error) {
    console.error('GPT Image generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate image with DALL-E 3 (HD quality)
 */
export async function generateWithDALLE3(prompt, aspectRatio = '1024x1024') {
  try {
    const client = getOpenAI();
    if (!client) {
      return { success: false, error: 'OpenAI API key not configured' };
    }
    const response = await client.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: aspectRatio,
      quality: 'hd',
      response_format: 'url'
    });

    return {
      success: true,
      images: response.data.map(img => ({
        url: img.url,
        revisedPrompt: img.revised_prompt,
        width: parseInt(aspectRatio.split('x')[0]),
        height: parseInt(aspectRatio.split('x')[1])
      }))
    };
  } catch (error) {
    console.error('DALL-E 3 generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate image with Google Gemini (Nano Banana Pro / 2.5 Flash Image)
 */
export async function generateWithGemini(prompt, aspectRatio = '1024x1024') {
  try {
    // Note: Using Google's Gemini API for image generation
    // Adjust endpoint based on actual Google API structure
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateImage',
      {
        prompt: prompt,
        imageSize: aspectRatio
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GOOGLE_GEMINI_API_KEY
        }
      }
    );

    return {
      success: true,
      images: [{
        url: response.data.imageUrl || response.data.url,
        width: parseInt(aspectRatio.split('x')[0]),
        height: parseInt(aspectRatio.split('x')[1])
      }]
    };
  } catch (error) {
    console.error('Gemini generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate image with Flux Pro 2
 */
export async function generateWithFlux(prompt, aspectRatio = '1024x1024') {
  try {
    const [width, height] = aspectRatio.split('x').map(Number);
    
    const response = await axios.post(
      'https://api.bfl.ml/v1/flux-pro-2',
      {
        prompt: prompt,
        width: width,
        height: height,
        num_images: 1
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Key': process.env.FLUX_API_KEY
        }
      }
    );

    // Flux API may return a task ID that needs polling
    const taskId = response.data.id;
    
    // Poll for result (simplified - in production, use proper async polling)
    let result;
    for (let i = 0; i < 30; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const statusResponse = await axios.get(
        `https://api.bfl.ml/v1/get_result?id=${taskId}`,
        {
          headers: { 'X-Key': process.env.FLUX_API_KEY }
        }
      );
      
      if (statusResponse.data.status === 'Ready') {
        result = statusResponse.data.result;
        break;
      }
    }

    if (!result) {
      throw new Error('Flux generation timeout');
    }

    return {
      success: true,
      images: [{
        url: result.sample || result.url,
        width: width,
        height: height
      }]
    };
  } catch (error) {
    console.error('Flux generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate image with Ideogram (Quality tier)
 */
export async function generateWithIdeogram(prompt, aspectRatio = '1024x1024') {
  try {
    const response = await axios.post(
      'https://api.ideogram.ai/generate',
      {
        image_request: {
          prompt: prompt,
          aspect_ratio: aspectRatio.replace('x', ':'),
          model: 'V_3_0',
          magic_prompt_option: 'AUTO',
          quality: 'QUALITY' // Highest quality tier
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': process.env.IDEOGRAM_API_KEY
        }
      }
    );

    return {
      success: true,
      images: response.data.data.map(img => ({
        url: img.url,
        width: parseInt(aspectRatio.split('x')[0]),
        height: parseInt(aspectRatio.split('x')[1]),
        seed: img.seed
      }))
    };
  } catch (error) {
    console.error('Ideogram generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Main function to generate with specific provider
 */
export async function generateImage(provider, prompt, aspectRatio = '1024x1024', variations = 1) {
  let result;
  
  switch (provider) {
    case 'OPENAI_GPT52_IMAGE':
      result = await generateWithGPTImage(prompt, aspectRatio);
      break;
    case 'OPENAI_DALLE3':
      result = await generateWithDALLE3(prompt, aspectRatio);
      break;
    case 'GEMINI_NANOBANANA_PRO':
      result = await generateWithGemini(prompt, aspectRatio);
      break;
    case 'FLUX_PRO_2':
      result = await generateWithFlux(prompt, aspectRatio);
      break;
    case 'IDEOGRAM':
      result = await generateWithIdeogram(prompt, aspectRatio);
      break;
    default:
      return {
        success: false,
        error: `Unknown provider: ${provider}`
      };
  }
  
  return result;
}
