# 🚀 Deploy Runtz AI to Railway

## Quick Deploy (3 Steps)

### Step 1: Push to GitHub

```bash
cd /home/ubuntu/promptfusion

# Set up GitHub token (get from https://github.com/settings/tokens/new)
git remote set-url origin https://YOUR_TOKEN@github.com/jerkean2139/Image-Prompt-Creator-.git

# Push
git push -u origin master --force
```

### Step 2: Deploy on Railway

1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select `jerkean2139/Image-Prompt-Creator-`
4. Railway will auto-detect Node.js and deploy

### Step 3: Add Services & Environment Variables

#### Add PostgreSQL
- Click "+ New" → "Database" → "PostgreSQL"

#### Add Redis  
- Click "+ New" → "Database" → "Redis"

#### Configure Web Service

Click on your web service → "Variables" → Add these:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}

# Session
SESSION_SECRET=+4oJTXp9A2ltiZcHFe7S4tfVzcrMt7GXyZzEbzqFGqdWesX1FKHmBBLOppk4H1Ex1RAVsdXGmmfgBRHQlANAKw==

# AI APIs (Update these with production URLs!)
ANTHROPIC_API_KEY=_DUMMY_API_KEY_
ANTHROPIC_BASE_URL=https://your-modelfarm.com/anthropic

OPENAI_API_KEY=_DUMMY_API_KEY_
OPENAI_BASE_URL=https://your-modelfarm.com/openai

GOOGLE_GEMINI_API_KEY=_DUMMY_API_KEY_
GEMINI_BASE_URL=https://your-modelfarm.com/gemini

FLUX_API_KEY=mock
IDEOGRAM_API_KEY=mock

# Google OAuth (update callback URL after deployment)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-app.railway.app/api/auth/google/callback

# Other (optional)
HUGGING_FACE_API=your-huggingface-token
RESEND_API=your-resend-api-key
JWT_SECRET=your-random-jwt-secret-here

# Will be set after first deploy
CLIENT_URL=https://your-app.railway.app
```

#### Create Worker Service

1. Click "+ New" → "Empty Service"
2. Name it "Worker"
3. Connect to same GitHub repo
4. Set same environment variables as web service
5. Go to "Settings" → "Deploy" → Set start command: `node server/worker.js`

### Step 4: Run Database Migration

After deployment, open Railway terminal for web service and run:
```bash
npx prisma migrate deploy
```

### Step 5: Update URLs

After deployment, update these variables with your actual Railway URL:
- `CLIENT_URL`
- `GOOGLE_CALLBACK_URL`

Then redeploy.

## ⚠️ Important: Modelfarm URLs

Your local modelfarm (`http://localhost:1106`) won't work in production. Options:

1. **Deploy modelfarm to Railway** and update base URLs
2. **Use real API endpoints:**
   ```
   ANTHROPIC_BASE_URL=https://api.anthropic.com
   OPENAI_BASE_URL=https://api.openai.com/v1
   GEMINI_BASE_URL=https://generativelanguage.googleapis.com
   ```
3. **Use Railway private networking** to connect services

## Alternative: Railway CLI

```bash
npm install -g @railway/cli
cd /home/ubuntu/promptfusion
railway login
railway init
railway up
```

## Test Production

1. Visit your Railway URL
2. Register account (500 free credits)
3. Create test generation
4. Check logs in Railway dashboard

---

**Need help?** Railway docs: https://docs.railway.app
