# PromptFusion Deployment Guide

## Quick Start Summary

**PromptFusion** is a production-ready multi-model AI image generation platform built with:
- React + Vite + Tailwind (cyberpunk UI)
- Node.js + Express + BullMQ
- PostgreSQL + Prisma + Redis
- Claude 4.5 Sonnet + 5 image generation providers

## What's Built

### ✅ Complete Features
1. **Authentication System** - Email/password registration & login with sessions
2. **AI Prompt Engineering** - Claude 4.5 Sonnet creates and grades prompts (target: 97/100)
3. **Multi-Model Generation** - Parallel image generation across 5 providers
4. **Credit System** - Transparent pricing, 500 free credits for new users
5. **Vault System** - Save and organize favorite generations
6. **Real-time Updates** - Job status polling and progress tracking
7. **Cyberpunk UI** - Dark theme with neon blue→purple→magenta gradients

### 📊 Pricing (A+ Quality)
- **Per run cost**: $0.437 (your cost) → $2.19 (user pays with 5x markup)
- **Credits**: 100 credits = $1.00
- **Free tier**: 500 credits (~2 full runs)

## Local Testing

### 1. Add API Keys to .env
```bash
# Required API keys
ANTHROPIC_API_KEY="sk-ant-..."
OPENAI_API_KEY="sk-..."
GOOGLE_GEMINI_API_KEY="..."
FLUX_API_KEY="..."
IDEOGRAM_API_KEY="..."
```

### 2. Start Services
```bash
# Terminal 1: API Server
npm run dev:server

# Terminal 2: Worker
npm run dev:worker

# Terminal 3: Frontend
npm run dev:client
```

### 3. Test the Flow
1. Open http://localhost:5173
2. Register a new account (gets 500 free credits)
3. Create a generation job
4. Watch real-time progress
5. View results and save to vault

## GitHub Setup

### Create Repository
```bash
# In the promptfusion directory
gh repo create promptfusion --private --source=. --remote=origin --push
```

Or manually:
1. Create new repo on GitHub: https://github.com/new
2. Push code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/promptfusion.git
   git branch -M main
   git push -u origin main
   ```

## Railway Deployment

### Option 1: Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add PostgreSQL
railway add --plugin postgresql

# Add Redis
railway add --plugin redis

# Deploy
railway up
```

### Option 2: Railway Dashboard
1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `promptfusion` repository
4. Add services:
   - **PostgreSQL** (database)
   - **Redis** (queue)
5. Set environment variables (see below)
6. Deploy!

### Environment Variables for Railway

**Web Service (API + Frontend)**
```
NODE_ENV=production
PORT=3000
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
SESSION_SECRET=<generate-strong-random-secret>
CLIENT_URL=https://your-app.railway.app

ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_GEMINI_API_KEY=...
FLUX_API_KEY=...
IDEOGRAM_API_KEY=...
```

**Worker Service**
```
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}

ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_GEMINI_API_KEY=...
FLUX_API_KEY=...
IDEOGRAM_API_KEY=...
```

### Railway Configuration Files

Create `railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run dev:server",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

Create separate worker service with start command: `npm run dev:worker`

## Post-Deployment

### 1. Run Database Migrations
```bash
railway run npx prisma migrate deploy
```

### 2. Seed Provider Configs (Optional)
```bash
railway run node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  const providers = [
    { provider: 'OPENAI_GPT52_IMAGE', baseCreditsPerImage: 133 },
    { provider: 'OPENAI_DALLE3', baseCreditsPerImage: 80 },
    { provider: 'GEMINI_NANOBANANA_PRO', baseCreditsPerImage: 39 },
    { provider: 'FLUX_PRO_2', baseCreditsPerImage: 70 },
    { provider: 'IDEOGRAM', baseCreditsPerImage: 90 }
  ];
  
  for (const p of providers) {
    await prisma.providerConfig.upsert({
      where: { provider: p.provider },
      update: p,
      create: p
    });
  }
  
  console.log('Provider configs seeded!');
}

seed().then(() => process.exit(0));
"
```

### 3. Test Production
1. Visit your Railway URL
2. Register test account
3. Create test generation
4. Monitor logs: `railway logs`

## Monitoring

### Check Service Health
```bash
# API health check
curl https://your-app.railway.app/health

# View logs
railway logs --service web
railway logs --service worker
```

### Common Issues

**Issue**: Worker not processing jobs
- **Fix**: Check Redis connection in worker logs
- **Fix**: Ensure `REDIS_URL` is set correctly

**Issue**: Database connection errors
- **Fix**: Run `railway run npx prisma migrate deploy`
- **Fix**: Check `DATABASE_URL` format

**Issue**: API keys not working
- **Fix**: Verify all 5 provider API keys are set
- **Fix**: Check API key permissions and quotas

## Scaling

### Horizontal Scaling
- **Web**: Scale to 2-3 instances for high traffic
- **Worker**: Scale to 2-5 instances for parallel processing

### Performance Tips
1. Enable Redis caching for prompt results
2. Use CDN for generated images (Cloudflare R2)
3. Implement rate limiting per user
4. Add job priority queues

## Cost Optimization

### Current Costs (per 1000 runs)
- Your cost: $437
- User revenue (5x markup): $2,190
- Gross margin: $1,753 (80%)

### Reduce Costs
1. **Batch processing**: Group similar prompts
2. **Caching**: Reuse graded prompts for similar ideas
3. **Provider selection**: Let users choose quality tiers
4. **Smart routing**: Use cheaper providers for simple requests

## Next Steps

1. ✅ Deploy to Railway
2. ⚙️ Add your API keys
3. 🧪 Test with real generations
4. 📈 Monitor usage and costs
5. 🚀 Launch to users!

## Support

- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: See README.md for full API docs
- **Logs**: Use `railway logs` for debugging

---

Built with ❤️ using Claude, OpenAI, Gemini, Flux, and Ideogram.
