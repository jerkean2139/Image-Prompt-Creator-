import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGES_DIR = path.join(__dirname, '../public/images');

if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

export async function downloadAndSaveImage(imageUrl, provider) {
  try {
    const imageId = uuidv4();
    const filename = `${provider.toLowerCase()}_${imageId}.png`;
    const filepath = path.join(IMAGES_DIR, filename);
    
    const response = await axios({
      method: 'get',
      url: imageUrl,
      responseType: 'arraybuffer',
      timeout: 60000,
      headers: {
        'User-Agent': 'PromptFusion/1.0'
      }
    });
    
    fs.writeFileSync(filepath, response.data);
    
    const localUrl = `/api/images/${filename}`;
    
    console.log(`💾 Saved image: ${filename}`);
    
    return {
      success: true,
      localUrl,
      filename,
      size: response.data.length
    };
  } catch (error) {
    console.error(`❌ Failed to download image from ${provider}:`, error.message);
    return {
      success: false,
      error: error.message,
      originalUrl: imageUrl
    };
  }
}

export async function downloadBase64Image(base64Data, provider) {
  try {
    const imageId = uuidv4();
    const filename = `${provider.toLowerCase()}_${imageId}.png`;
    const filepath = path.join(IMAGES_DIR, filename);
    
    const base64Content = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Content, 'base64');
    
    fs.writeFileSync(filepath, buffer);
    
    const localUrl = `/api/images/${filename}`;
    
    console.log(`💾 Saved base64 image: ${filename}`);
    
    return {
      success: true,
      localUrl,
      filename,
      size: buffer.length
    };
  } catch (error) {
    console.error(`❌ Failed to save base64 image from ${provider}:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}
