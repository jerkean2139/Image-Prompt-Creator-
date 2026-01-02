# Zenoflo Build Tracker - Runtz AI

## Project Information

**Project Title:** Runtz AI (PromptFusion)  
**Project Slug:** runtz-ai  
**Category:** platform  
**Client Name:** Internal Project  
**Client Industry:** AI / Creative Tools  
**Build Start Date:** 2024-12-30  

---

## Tagline

> Multi-model AI image generation platform that runs your prompt through 3+ providers simultaneously for maximum creative options.

---

## Description

Runtz AI is a sophisticated AI image generation platform that sends your creative prompts to multiple AI providers (DALL-E 3, Gemini, Ideogram) simultaneously. It features intelligent prompt enhancement, quality grading, a vault system for saving favorites, and credit-based usage management.

---

## The Challenge (Problem Statement)

Users wanting AI-generated images typically have to manually test different providers to find the best results. Each provider has different strengths, pricing, and style tendencies. Managing multiple API subscriptions, comparing outputs, and tracking usage is time-consuming and fragmented across multiple platforms.

---

## The Solution (Solution Overview)

Runtz AI solves this by acting as a unified hub that sends prompts to multiple AI image providers in parallel. Users submit one prompt and receive multiple variations from different AI models, allowing them to compare and choose the best results. The platform includes smart prompt enhancement, persistent local image storage (preventing URL expiration issues), a favorites vault, and credit-based billing.

---

## Key Features

- [x] Feature 1: Multi-provider image generation (DALL-E 3, Gemini 2.5 Flash, Ideogram)
- [x] Feature 2: Local image storage system preventing expired URL 403 errors
- [x] Feature 3: Prompt enhancement with provider-specific optimization
- [x] Feature 4: Vault system for saving and organizing favorite images
- [x] Feature 5: Remix functionality to iterate on generated images
- [x] Feature 6: Credit-based usage management
- [x] Feature 7: Job queue system with BullMQ for reliable processing

---

## Build Approach

The platform was built with a microservices-inspired architecture:
1. **Frontend**: React + Vite + Tailwind CSS with a dark cyberpunk aesthetic
2. **Backend**: Express.js API server handling authentication, jobs, and vault management
3. **Worker**: Separate BullMQ worker process for async image generation
4. **Database**: PostgreSQL with Prisma ORM for data persistence
5. **Queue**: Redis-backed BullMQ for reliable job processing
6. **Storage**: Local file system storage for generated images (solving URL expiration issues)

Key architectural decisions:
- Downloading and saving images locally immediately after generation to prevent provider URL expiration
- Using provider-specific prompt optimization to maximize quality for each AI model
- Implementing aspect ratio mapping for providers with limited size options (DALL-E 3)

---

## Tech Stack

- React 18 + Vite
- Node.js + Express
- PostgreSQL + Prisma ORM
- Redis + BullMQ
- Tailwind CSS
- OpenAI API (DALL-E 3)
- Google Gemini API (2.5 Flash)
- Ideogram API

---

## Build Milestones

### Milestone 1: Core Platform Setup
- **Date:** 2024-12-30
- **Description:** Set up React frontend with Vite, Express backend, PostgreSQL database, and BullMQ job queue system
- **Agent Notes:** Established the foundational architecture with authentication, session management, and basic UI

### Milestone 2: Multi-Provider Integration
- **Date:** 2024-12-30
- **Description:** Integrated 5 AI providers: OpenAI GPT Image, DALL-E 3, Gemini 2.5 Flash, Flux Pro 2, and Ideogram
- **Agent Notes:** Each provider required unique API handling and response parsing

### Milestone 3: Local Image Storage System
- **Date:** 2024-12-31
- **Description:** Implemented local image storage to download and save images immediately after generation, preventing 403 errors from expired provider URLs
- **Agent Notes:** Critical fix - external provider URLs expire within hours, causing broken images in the UI

### Milestone 4: DALL-E 3 Aspect Ratio Mapping
- **Date:** 2024-12-31
- **Description:** Added size mapping function to convert requested aspect ratios to DALL-E 3's supported sizes (1024x1024, 1024x1792, 1792x1024)
- **Agent Notes:** DALL-E 3 only supports 3 specific sizes, so we map user requests to the closest supported option

### Milestone 5: Remix Functionality
- **Date:** 2024-12-31
- **Description:** Added Remix buttons to image cards allowing users to iterate on generated images with modified prompts
- **Agent Notes:** Enables creative iteration workflow

### Milestone 6: Provider Optimization
- **Date:** 2024-12-31
- **Description:** Reduced to 3 providers (DALL-E 3, Gemini, Ideogram) for reliability. Removed Flux (503 errors) and GPT Image (org verification required)
- **Agent Notes:** Focusing on working providers for better user experience

---

## Challenges Faced

1. **Expired Image URLs (403 Errors)**: Provider-generated URLs expire after hours. Solved by implementing local image storage that downloads and saves images immediately after generation.

2. **DALL-E 3 Size Restrictions**: Only supports 3 specific sizes. Solved by creating an aspect ratio mapping function that converts user requests to supported sizes.

3. **Provider API Variations**: Each provider has different request/response formats, error handling, and rate limits. Solved with provider-specific adapter functions.

4. **GPT Image Model Access**: Requires OpenAI organization verification. Documented as external dependency for future enablement.

5. **Gemini Quota Limits**: Free tier quickly exhausted. Resolved when user upgraded to paid plan.

---

## Lessons Learned

1. **Always store generated content locally** - External URLs from AI providers are temporary and will expire, causing broken user experiences

2. **Provider-specific optimization matters** - Each AI model responds differently to prompts; tailoring prompts per provider improves results

3. **Graceful degradation is essential** - When providers fail, the system should continue with remaining providers rather than failing entirely

4. **Aspect ratio handling varies widely** - Each provider has different supported sizes; abstraction layers help manage this complexity

---

## Results Achieved

1. Successfully generating images from 3 AI providers simultaneously
2. Zero 403 errors from expired URLs with local storage system
3. Reliable job processing with BullMQ queue system
4. Persistent image storage that survives server restarts

---

## Next Steps

- [ ] Re-enable GPT Image once OpenAI org is verified
- [ ] Re-enable Flux when HuggingFace service stabilizes
- [ ] Add Anthropic Claude for prompt grading (currently using fallback)
- [ ] Implement image upscaling options
- [ ] Add batch generation for multiple prompts

---

## Media Gallery

| ID | Type | URL | Caption | Phase |
|----|------|-----|---------|-------|
| media-1 | image | /api/images/gemini_nanobanana_pro_800a03df-1e00-418d-9b0b-e8d3baeb0ca3.png | Gemini 2.5 Flash generated image | Production |
| media-2 | image | /api/images/openai_dalle3_f4a0ec37-59ca-449e-9b20-71c4bf81afe0.png | DALL-E 3 generated image | Production |
| media-3 | image | /api/images/ideogram_8e9cc8ed-6a8a-4a11-a34b-d2fd670fc2e5.png | Ideogram generated image | Production |

---

## Links

- **Live URL:** [Replit deployment URL]
- **Replit URL:** https://replit.com/@[username]/runtz-ai
- **GitHub URL:** N/A (Replit-hosted)
- **Featured Image URL:** [Hero image pending]
- **Hero Video URL:** [Demo video pending]

---

# PORTFOLIO EXPORT

```
Please add/update this project in the Zenoflo Portfolio:

PORTFOLIO_DATA_START
{
  "title": "Runtz AI",
  "slug": "runtz-ai",
  "description": "Multi-model AI image generation platform that sends prompts to DALL-E 3, Gemini, and Ideogram simultaneously, featuring local image storage, prompt enhancement, favorites vault, and credit management.",
  "category": "platform",
  "status": "in_progress",
  "techStack": ["React", "Node.js", "Express", "PostgreSQL", "Prisma", "Redis", "BullMQ", "Tailwind CSS", "OpenAI API", "Google Gemini API", "Ideogram API"],
  "liveUrl": null,
  "replitUrl": "https://replit.com/@[username]/runtz-ai",
  "githubUrl": null,
  "featuredImage": null,
  "heroVideoUrl": null,
  "clientName": "Internal Project",
  "clientIndustry": "AI / Creative Tools",
  "buildStartDate": "2024-12-30",
  "buildEndDate": null,
  "caseStudy": {
    "tagline": "One prompt, multiple AI models, endless creative possibilities",
    "problemStatement": "Users wanting AI-generated images must manually test different providers to find the best results. Managing multiple API subscriptions and comparing outputs is fragmented and time-consuming.",
    "solutionOverview": "Runtz AI acts as a unified hub that sends prompts to multiple AI providers in parallel. Users submit one prompt and receive variations from different AI models, with persistent local storage preventing URL expiration issues.",
    "keyFeatures": [
      "Multi-provider parallel image generation (DALL-E 3, Gemini, Ideogram)",
      "Local image storage preventing expired URL errors",
      "Prompt enhancement with provider-specific optimization",
      "Vault system for saving favorite images",
      "Remix functionality for creative iteration",
      "Credit-based usage management",
      "BullMQ job queue for reliable processing"
    ],
    "buildApproach": "Microservices-inspired architecture with React frontend, Express API, separate BullMQ worker, PostgreSQL database, and Redis queue. Key innovation: downloading images locally immediately after generation to prevent provider URL expiration.",
    "challengesFaced": [
      "Provider URLs expire causing 403 errors - solved with local storage",
      "DALL-E 3 only supports 3 sizes - solved with aspect ratio mapping",
      "Provider API variations - solved with adapter pattern",
      "Rate limits and quota management across providers"
    ],
    "lessonsLearned": [
      "Always store generated content locally - external URLs are temporary",
      "Provider-specific prompt optimization improves results",
      "Graceful degradation keeps the system functional when providers fail"
    ],
    "resultsAchieved": [
      "3 AI providers generating images simultaneously",
      "Zero 403 errors with local image storage",
      "Reliable async job processing with BullMQ"
    ],
    "clientTestimonial": null,
    "nextSteps": [
      "Re-enable GPT Image after org verification",
      "Re-enable Flux when HuggingFace stabilizes",
      "Add Anthropic Claude for prompt grading",
      "Implement image upscaling"
    ]
  },
  "milestones": [
    {
      "id": "m1",
      "title": "Core Platform Setup",
      "description": "Set up React frontend, Express backend, PostgreSQL, and BullMQ job queue",
      "date": "2024-12-30",
      "mediaUrl": null,
      "mediaType": "image",
      "agentNotes": "Foundational architecture with auth and session management"
    },
    {
      "id": "m2",
      "title": "Multi-Provider Integration",
      "description": "Integrated 5 AI providers with unique API handling",
      "date": "2024-12-30",
      "mediaUrl": null,
      "mediaType": "image",
      "agentNotes": "GPT Image, DALL-E 3, Gemini, Flux, Ideogram"
    },
    {
      "id": "m3",
      "title": "Local Image Storage System",
      "description": "Implemented local storage to prevent 403 errors from expired URLs",
      "date": "2024-12-31",
      "mediaUrl": null,
      "mediaType": "image",
      "agentNotes": "Critical fix for persistent image access"
    },
    {
      "id": "m4",
      "title": "DALL-E 3 Aspect Ratio Mapping",
      "description": "Added size mapping for DALL-E 3 supported dimensions",
      "date": "2024-12-31",
      "mediaUrl": null,
      "mediaType": "image",
      "agentNotes": "Maps user requests to 1024x1024, 1024x1792, or 1792x1024"
    },
    {
      "id": "m5",
      "title": "Provider Optimization",
      "description": "Streamlined to 3 reliable providers for better UX",
      "date": "2024-12-31",
      "mediaUrl": null,
      "mediaType": "image",
      "agentNotes": "Removed Flux and GPT Image due to external issues"
    }
  ],
  "mediaGallery": [
    {
      "id": "media-1",
      "url": "/api/images/gemini_nanobanana_pro_800a03df-1e00-418d-9b0b-e8d3baeb0ca3.png",
      "type": "image",
      "caption": "Gemini 2.5 Flash generated image",
      "phase": "Production"
    },
    {
      "id": "media-2",
      "url": "/api/images/openai_dalle3_f4a0ec37-59ca-449e-9b20-71c4bf81afe0.png",
      "type": "image",
      "caption": "DALL-E 3 generated image",
      "phase": "Production"
    },
    {
      "id": "media-3",
      "url": "/api/images/ideogram_8e9cc8ed-6a8a-4a11-a34b-d2fd670fc2e5.png",
      "type": "image",
      "caption": "Ideogram generated image",
      "phase": "Production"
    }
  ]
}
PORTFOLIO_DATA_END
```

---

*This template is part of the Zenoflo Portfolio System for Kean on Biz*
