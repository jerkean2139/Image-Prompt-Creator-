# Runtz AI - Deployment Guide

## 🚀 Quick Deploy to Railway

### Prerequisites
- Railway account (https://railway.app)
- GitHub account
- Your API keys ready

### Step 1: Push to GitHub

```bash
# If you haven't already, push the code to your GitHub repo
git remote set-url origin https://github.com/jerkean2139/Image-Prompt-Creator-.git
git push -u origin master
```

### Step 2: Deploy on Railway

1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select `jerkean2139/Image-Prompt-Creator-`
4. Railway will auto-detect Node.js and deploy

### Step 3: Add Services

In your Railway project, add these services:

#### PostgreSQL
1. Click "+ New"
2. Select "Database" → "PostgreSQL"
3. Railway will auto-provision it

#### Redis
1. Click "+ New"
2. Select "Database" → "Redis"
3. Railway will auto-provision it

### Step 4: Configure Environment Variables

In your main app service, add these variables:

```env
# Database (auto-filled by Railway)
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}

# Session & Auth
SESSION_SECRET=your-session-secret-here
JWT_SECRET=your-jwt-secret-here

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-app.railway.app/api/auth/google/callback

# AI APIs - Use your modelfarm or real APIs
AI_INTEGRATIONS_ANTHROPIC_BASE_URL=http://your-modelfarm:1106/modelfarm/anthropic
AI_INTEGRATIONS_ANTHROPIC_API_KEY=_DUMMY_API_KEY_

AI_INTEGRATIONS_OPENAI_BASE_URL=http://your-modelfarm:1106/modelfarm/openai
AI_INTEGRATIONS_OPENAI_API_KEY=_DUMMY_API_KEY_

AI_INTEGRATIONS_GEMINI_BASE_URL=http://your-modelfarm:1106/modelfarm/gemini
AI_INTEGRATIONS_GEMINI_API_KEY=_DUMMY_API_KEY_

# OR use real APIs:
# ANTHROPIC_API_KEY=sk-ant-...
# OPENAI_API_KEY=sk-...
# GOOGLE_GEMINI_API_KEY=...

# Mock prompts (set to false when modelfarm is ready)
USE_MOCK_PROMPTS=true

# Flux & Ideogram (optional)
FLUX_API_KEY=your-flux-api-key
IDEOGRAM_API_KEY=your-ideogram-api-key
```

### Step 5: Deploy

1. Railway will automatically build and deploy
2. It will run migrations automatically
3. Your app will be live at `https://your-app.railway.app`

---

## 📦 Alternative: Manual Deployment

### Build Locally

```bash
# Install dependencies
npm install

# Build frontend
npm run build

# Run migrations
npx prisma migrate deploy
npx prisma generate
```

### Run in Production

```bash
# Option 1: Use start script
./start.sh

# Option 2: Use PM2
npm install -g pm2
pm2 start ecosystem.config.js
```

---

## 🔧 Configuration

### Mock Prompts vs Real AI

**Mock Prompts (Default)**
- Set `USE_MOCK_PROMPTS=true`
- No Claude API needed
- Prompts generated locally
- Good for testing

**Real AI Prompts**
- Set `USE_MOCK_PROMPTS=false`
- Requires Claude API or modelfarm
- Better quality prompts
- Production recommended

### Image Generation Providers

The app uses 5 providers:
1. OpenAI GPT Image 1.5
2. DALL-E 3
3. Gemini 2.5 Flash Image
4. Flux Pro 2
5. Ideogram 3.0

Configure via modelfarm or direct API keys.

---

## 🎯 Post-Deployment

### Create Admin User

```bash
# SSH into your Railway deployment
railway run bash

# Create admin
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
(async () => {
  const hash = await bcrypt.hash('your-password', 10);
  const user = await prisma.user.create({
    data: {
      email: 'admin@runtzai.com',
      passwordHash: hash,
      displayName: 'Admin',
      creditsBalance: 100000
    }
  });
  console.log('Admin created:', user.email);
  await prisma.\$disconnect();
})();
"
```

### Monitor Logs

```bash
# Railway dashboard
railway logs

# Or use Railway CLI
railway logs --follow
```

---

## 🐛 Troubleshooting

### Database Connection Issues
- Check `DATABASE_URL` is set correctly
- Ensure PostgreSQL service is running
- Verify network connectivity between services

### Worker Not Processing Jobs
- Check Redis connection
- Verify `REDIS_URL` is correct
- Check worker logs for errors

### Image Generation Failing
- Verify API keys are correct
- Check modelfarm is accessible
- Enable `USE_MOCK_PROMPTS=true` for testing

---

## 📊 Monitoring

### Health Checks

```bash
# API health
curl https://your-app.railway.app/health

# Check job status
curl https://your-app.railway.app/api/jobs/:jobId
```

### Database

```bash
# Connect to database
railway connect postgres

# View jobs
SELECT id, status, created_at FROM "Job" ORDER BY created_at DESC LIMIT 10;
```

---

## 🔐 Security

1. **Change default secrets** in production
2. **Use strong passwords** for admin accounts
3. **Enable HTTPS** (Railway does this automatically)
4. **Rotate API keys** regularly
5. **Monitor credit usage** to prevent abuse

---

## 📈 Scaling

Railway auto-scales based on traffic. To optimize:

1. **Separate worker service** for better scaling
2. **Use Redis for caching**
3. **Enable CDN** for static assets
4. **Monitor database performance**

---

## 💰 Costs

Estimated monthly costs:

- **Railway**: $5-20 (Hobby plan)
- **PostgreSQL**: Included
- **Redis**: Included
- **AI APIs**: Variable based on usage
  - OpenAI: ~$0.034/image
  - DALL-E 3: ~$0.040/image
  - Gemini: ~$0.039/image
  - Flux: ~$0.070/image
  - Ideogram: ~$0.060/image

**Total per run (5 images)**: ~$0.437 cost, $2.19 revenue (5x markup)

---

## 🆘 Support

For issues:
1. Check Railway logs
2. Review environment variables
3. Test with `USE_MOCK_PROMPTS=true`
4. Check database connectivity
5. Verify Redis is running

---

**Your app is ready to deploy! 🚀**
