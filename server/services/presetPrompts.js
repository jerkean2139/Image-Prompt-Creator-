// Preset-specific master prompt templates for Claude

export const PRESET_TEMPLATES = {
  'reference': {
    name: 'Reference Image',
    masterPrompt: `You are creating an image generation prompt based on a reference image. 
    
Key objectives:
- Analyze the reference image's composition, style, lighting, and mood
- Maintain the core visual elements while allowing creative interpretation
- Preserve the reference's aesthetic qualities
- Adapt the user's idea to match the reference style

Focus on: composition similarity, style matching, color palette consistency, lighting direction, subject positioning`
  },

  'business-headshots': {
    name: 'Business Headshots',
    masterPrompt: `You are creating professional business headshot prompts.

Key objectives:
- Professional, corporate-appropriate appearance
- Clean, neutral backgrounds (solid colors, subtle gradients, or soft office blur)
- Professional attire (suits, business casual, appropriate for corporate settings)
- Confident, approachable facial expressions
- Studio-quality lighting (soft key light, subtle fill, professional portrait lighting)
- Sharp focus on face, slight background blur
- Eye-level camera angle, slight variations allowed

Technical specs: High resolution, professional color grading, minimal retouching, natural skin tones, professional depth of field`
  },

  'business-action': {
    name: 'Business in Action',
    masterPrompt: `You are creating dynamic business environment prompts.

Key objectives:
- Active business scenarios (meetings, presentations, collaboration, working)
- Modern office or professional environments
- Multiple people interacting naturally (when applicable)
- Professional attire appropriate to setting
- Natural, candid moments that feel authentic
- Environmental context (office, conference room, workspace, etc.)
- Dynamic composition with depth and activity

Technical specs: Photojournalistic style, natural lighting mixed with office lighting, environmental storytelling, authentic moments, professional color grading`
  },

  'photorealistic': {
    name: 'Photorealistic',
    masterPrompt: `You are creating hyper-realistic photographic prompts.

Key objectives:
- Absolute photorealism - indistinguishable from real photographs
- Accurate physics, lighting, and material properties
- Natural imperfections and details (skin texture, fabric weave, surface irregularities)
- Realistic depth of field and bokeh
- Authentic lighting scenarios (natural light behavior, realistic shadows, proper exposure)
- Camera-specific characteristics (lens distortion, chromatic aberration when appropriate)

Technical specs: High dynamic range, accurate color science, realistic grain/noise, proper perspective, photographic composition rules, real-world lighting physics`
  },

  'artistic': {
    name: 'Artistic',
    masterPrompt: `You are creating artistic, painterly, or stylized image prompts.

Key objectives:
- Creative interpretation over photorealism
- Artistic styles (oil painting, watercolor, digital art, illustration, concept art)
- Expressive use of color, texture, and brushwork
- Emphasis on mood, emotion, and aesthetic appeal
- Creative composition and framing
- Artistic lighting and atmosphere

Technical specs: Visible artistic techniques, stylistic coherence, creative color palettes, expressive mark-making, artistic interpretation of reality`
  },

  'cinematic': {
    name: 'Cinematic',
    masterPrompt: `You are creating cinematic, movie-quality image prompts.

Key objectives:
- Film-like quality and composition
- Dramatic lighting (motivated lighting, atmospheric effects, volumetric lighting)
- Cinematic color grading (teal and orange, desaturated, high contrast, etc.)
- Wide aspect ratios and epic scale
- Storytelling through visual composition
- Depth and layering (foreground, midground, background)
- Atmospheric effects (fog, haze, god rays, particles)

Technical specs: Anamorphic lens characteristics, film grain, cinematic depth of field, dramatic shadows, motivated key lights, atmospheric perspective, epic scale`
  },

  'product': {
    name: 'Product Photography',
    masterPrompt: `You are creating professional product photography prompts.

Key objectives:
- Clean, commercial product presentation
- Professional studio lighting or lifestyle context
- Sharp focus on product with appropriate depth of field
- Neutral or complementary backgrounds
- Showcase product features and details
- Commercial appeal and visual clarity
- Professional composition (rule of thirds, negative space, visual hierarchy)

Technical specs: Studio lighting (key, fill, rim lights), clean backgrounds, sharp focus, accurate colors, professional retouching, commercial photography standards`
  },

  'portrait': {
    name: 'Portrait',
    masterPrompt: `You are creating portrait photography prompts.

Key objectives:
- Focus on human subject(s) and their character
- Emotional connection and expression
- Flattering lighting and angles
- Environmental or studio context appropriate to subject
- Personality and mood expression
- Professional portrait composition
- Natural or creative styling

Technical specs: Portrait lighting patterns (Rembrandt, butterfly, loop, split), appropriate depth of field, eye focus, flattering angles, skin tone accuracy, emotional storytelling`
  },

  'landscape': {
    name: 'Landscape',
    masterPrompt: `You are creating landscape and nature photography prompts.

Key objectives:
- Expansive natural environments and vistas
- Dramatic natural lighting (golden hour, blue hour, dramatic weather)
- Sense of scale and grandeur
- Environmental storytelling
- Seasonal and atmospheric conditions
- Foreground interest and depth
- Natural color palettes

Technical specs: Wide angle perspective, deep depth of field, landscape composition rules, natural lighting, atmospheric effects, environmental details, seasonal characteristics`
  }
};

// Provider-specific optimization instructions
export const PROVIDER_OPTIMIZATIONS = {
  'OPENAI_GPT52_IMAGE': {
    name: 'OpenAI GPT Image 1.5',
    optimization: `Optimize for OpenAI GPT Image 1.5:
- Emphasize photorealism and natural lighting
- Use clear, descriptive language
- Include technical photography terms (aperture, focal length, lighting setup)
- Specify quality indicators (8K, high resolution, professional photography)
- Detail-oriented descriptions of textures and materials
- Natural language flow`
  },

  'OPENAI_DALLE3': {
    name: 'DALL-E 3',
    optimization: `Optimize for DALL-E 3:
- Natural, conversational language (DALL-E 3 excels at understanding context)
- Detailed scene descriptions with spatial relationships
- Emphasis on composition and framing
- Clear subject-background relationships
- Artistic and stylistic references
- Avoid overly technical jargon`
  },

  'GEMINI_NANOBANANA_PRO': {
    name: 'Gemini 2.5 Flash Image',
    optimization: `Optimize for Gemini:
- Structured, clear descriptions
- Technical specifications and parameters
- Emphasis on lighting and color theory
- Precise compositional elements
- Quality and style keywords
- Balanced technical and creative language`
  },

  'FLUX_PRO_2': {
    name: 'Flux Pro 2',
    optimization: `Optimize for Flux Pro 2:
- Artistic and creative emphasis
- Strong style references (art movements, artists, techniques)
- Emphasis on mood and atmosphere
- Creative composition and framing
- Artistic quality indicators
- Expressive, evocative language`
  },

  'IDEOGRAM': {
    name: 'Ideogram 3.0',
    optimization: `Optimize for Ideogram:
- Quality-focused keywords (masterpiece, best quality, highly detailed)
- Aesthetic and style tags
- Emphasis on visual appeal and composition
- Clear subject description
- Artistic quality indicators
- Structured prompt format with key descriptors`
  }
};
