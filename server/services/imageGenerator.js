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
      model: 'gpt-image-1.5',
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
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent',
      {
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE']
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GOOGLE_GEMINI_API_KEY
        },
        timeout: 120000
      }
    );

    // Parse response - look for image data in parts
    const candidates = response.data.candidates || [];
    const images = [];
    
    for (const candidate of candidates) {
      const parts = candidate.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData) {
          const base64Data = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || 'image/png';
          images.push({
            url: `data:${mimeType};base64,${base64Data}`,
            width: parseInt(aspectRatio.split('x')[0]),
            height: parseInt(aspectRatio.split('x')[1])
          });
        }
      }
    }

    if (images.length === 0) {
      return { success: false, error: 'No images in Gemini response' };
    }

    return { success: true, images };
  } catch (error) {
    console.error('Gemini generation error:', error.response?.data || error);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
}

/**
 * Generate image with Flux Pro via Hugging Face Router API
 */
export async function generateWithFlux(prompt, aspectRatio = '1024x1024') {
  try {
    const [width, height] = aspectRatio.split('x').map(Number);
    
    // Use new Hugging Face Router API (api-inference deprecated)
    const response = await axios.post(
      'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-dev',
      {
        inputs: prompt,
        parameters: {
          width: width,
          height: height,
          num_inference_steps: 28,
          guidance_scale: 3.5
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer',
        timeout: 180000 // 3 minute timeout for Flux
      }
    );

    // Convert the image buffer to base64 data URL
    const base64Image = Buffer.from(response.data).toString('base64');
    const dataUrl = `data:image/png;base64,${base64Image}`;

    return {
      success: true,
      images: [{
        url: dataUrl,
        width: width,
        height: height
      }]
    };
  } catch (error) {
    console.error('Flux/HuggingFace generation error:', error.response?.data ? Buffer.from(error.response.data).toString() : error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Convert aspect ratio to Ideogram format
 */
function getIdeogramAspectRatio(aspectRatio) {
  const ratioMap = {
    '1024x1024': 'ASPECT_1_1',
    '1024x768': 'ASPECT_4_3',
    '768x1024': 'ASPECT_3_4',
    '1024x576': 'ASPECT_16_9',
    '576x1024': 'ASPECT_9_16',
    '1024x682': 'ASPECT_3_2',
    '682x1024': 'ASPECT_2_3',
    '1024x640': 'ASPECT_16_10',
    '640x1024': 'ASPECT_10_16'
  };
  return ratioMap[aspectRatio] || 'ASPECT_1_1';
}

/**
 * Generate image with Ideogram (Quality tier)
 */
export async function generateWithIdeogram(prompt, aspectRatio = '1024x1024') {
  try {
    const ideogramAspect = getIdeogramAspectRatio(aspectRatio);
    
    const response = await axios.post(
      'https://api.ideogram.ai/generate',
      {
        image_request: {
          prompt: prompt,
          aspect_ratio: ideogramAspect,
          model: 'V_2',
          magic_prompt_option: 'AUTO'
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': process.env.IDEOGRAM_API_KEY
        },
        timeout: 120000
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
    console.error('Ideogram generation error:', error.response?.data || error);
    return {
      success: false,
      error: error.response?.data?.detail || error.message
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
