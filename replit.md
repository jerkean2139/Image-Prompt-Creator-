# PromptFusion (Runtz AI)

Multi-model AI image generation platform with prompt grading and vault system.

## Overview

PromptFusion is a full-stack application that generates AI images using multiple providers (OpenAI, Stability, Replicate, etc.) with intelligent prompt grading and optimization. Users can create, save, and organize generated images in a personal vault.

## Architecture

- **Frontend**: React + Vite (port 5000)
- **Backend**: Express.js API (port 3001)
- **Database**: PostgreSQL with Prisma ORM
- **Job Queue**: BullMQ with Redis (optional in development)
- **Auth**: Session-based authentication with bcrypt

## Development Setup

The app runs in development mode with:
- Vite dev server on port 5000 (frontend)
- Express server on port 3001 (backend)
- PostgreSQL database (Replit managed)
- Redis/BullMQ disabled (no REDIS_URL set)

### Environment Variables Required for Production

- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection for BullMQ job queue
- `SESSION_SECRET` - Session encryption key
- `OPENAI_API_KEY` - OpenAI API for DALL-E
- `STABILITY_API_KEY` - Stability AI for image generation
- `REPLICATE_API_TOKEN` - Replicate API for various models
- `ANTHROPIC_API_KEY` - Claude API for prompt grading

## Key Files

- `vite.config.js` - Frontend config (port 5000, host 0.0.0.0)
- `server/index.js` - Express server entry point
- `server/routes/` - API route handlers
- `server/services/` - Business logic (image generation, prompt grading)
- `server/worker.js` - BullMQ worker for processing jobs
- `prisma/schema.prisma` - Database schema

## Recent Changes (Dec 2024)

- Made Redis/BullMQ optional for development (only connects if REDIS_URL set)
- Fixed OpenAI client lazy initialization to prevent crashes
- Configured Vite for Replit proxy compatibility (allowedHosts: true)
- Added graceful degradation when Redis unavailable

## Running the App

Development: `npm run dev` (starts both frontend and backend)
Worker: `npm run worker` (requires REDIS_URL)

## Deployment Notes

This project is designed for deployment to Railway with:
- PostgreSQL database (production)
- Redis for job queue (production)
- Environment variables set in Railway dashboard
