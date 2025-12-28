# PromptFusion 🚀

Multi-model AI image generation platform with intelligent prompt grading and vault system.

## Features

- **5 AI Image Providers**: OpenAI GPT Image 1.5, DALL-E 3, Gemini 2.5 Flash Image, Flux Pro 2, Ideogram
- **AI Prompt Engineering**: Claude 4.5 Sonnet creates and grades prompts (target: 97/100)
- **Iterative Grading**: Up to 5 iterations to perfect your prompt
- **Vault System**: Save and organize your favorite generations
- **Credit-Based Billing**: Transparent pricing, 500 free credits for new users
- **Cyberpunk UI**: Dark, glossy interface with neon accents

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL + Prisma ORM
- **Queue**: BullMQ + Redis
- **AI**: Claude 4.5 Sonnet (Anthropic), OpenAI, Google Gemini, Flux, Ideogram

## Pricing (A+ Quality)

| Provider | Cost per Image | Credits |
|----------|----------------|---------|
| Prompt Creation (Claude) | $0.025 | 25 |
| OpenAI GPT Image 1.5 (High) | $0.133 | 133 |
| DALL-E 3 (HD) | $0.080 | 80 |
| Gemini 2.5 Flash Image | $0.039 | 39 |
| Flux Pro 2 | $0.070 | 70 |
| Ideogram 3.0 (Quality) | $0.090 | 90 |

**Total per run**: 437 credits (your cost: $0.437) → User pays 219 credits ($2.19) with 5x markup

**Free tier**: 500 credits (~2 full runs)

## Setup

### Prerequisites

- Node.js 22+
- PostgreSQL 14+
- Redis 6+
- API Keys for:
  - Anthropic (Claude)
  - OpenAI
  - Google Gemini
  - Black Forest Labs (Flux)
  - Ideogram

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd promptfusion
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```
   DATABASE_URL="postgresql://promptuser:promptpass123@localhost:5432/promptfusion?schema=public"
   REDIS_URL="redis://localhost:6379"
   SESSION_SECRET="your-secret-key"
   
   ANTHROPIC_API_KEY="sk-ant-..."
   OPENAI_API_KEY="sk-..."
   GOOGLE_GEMINI_API_KEY="..."
   FLUX_API_KEY="..."
   IDEOGRAM_API_KEY="..."
   ```

4. **Set up database**
   ```bash
   # Start PostgreSQL
   sudo service postgresql start
   
   # Run migrations
   npm run prisma:migrate
   ```

5. **Start Redis**
   ```bash
   sudo service redis-server start
   ```

6. **Run the application**
   ```bash
   # Development mode (runs all services)
   npm run dev
   
   # Or run separately:
   npm run dev:server   # API server (port 3000)
   npm run dev:client   # React app (port 5173)
   npm run dev:worker   # BullMQ worker
   ```

7. **Access the app**
   - Frontend: http://localhost:5173
   - API: http://localhost:3000
   - Health check: http://localhost:3000/health

## Project Structure

```
promptfusion/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── styles/        # CSS files
│   │   └── main.jsx       # Entry point
│   └── index.html
├── server/                # Express backend
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── workers/          # BullMQ workers
│   ├── middleware/       # Auth, etc.
│   ├── index.js          # Server entry
│   └── worker.js         # Worker entry
├── prisma/               # Database schema
│   └── schema.prisma
├── uploads/              # Local file storage
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Jobs
- `POST /api/jobs` - Create new generation job
- `GET /api/jobs` - List user's jobs
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs/:id/cancel` - Cancel job

### Vault
- `GET /api/vault/collections` - List collections
- `POST /api/vault/collections` - Create collection
- `GET /api/vault/items` - List vault items
- `POST /api/vault/items` - Save image to vault
- `DELETE /api/vault/items/:id` - Remove from vault

### Credits
- `GET /api/credits` - Get balance and history

### User
- `GET /api/user/profile` - Get profile
- `PATCH /api/user/profile` - Update profile

## Deployment

### Railway

1. **Create Railway project**
   ```bash
   railway init
   ```

2. **Add services**
   - PostgreSQL
   - Redis
   - Web (API server)
   - Worker (BullMQ worker)

3. **Set environment variables** in Railway dashboard

4. **Deploy**
   ```bash
   railway up
   ```

### Environment Variables for Production

```
NODE_ENV=production
DATABASE_URL=<railway-postgres-url>
REDIS_URL=<railway-redis-url>
SESSION_SECRET=<strong-random-secret>
CLIENT_URL=<your-frontend-url>

# API Keys
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...
GOOGLE_GEMINI_API_KEY=...
FLUX_API_KEY=...
IDEOGRAM_API_KEY=...

# Storage (optional)
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=promptfusion
```

## Development

- **Database migrations**: `npm run prisma:migrate`
- **Prisma Studio**: `npm run prisma:studio`
- **Build frontend**: `npm run build`

## License

ISC

## Credits

Built with ❤️ using Claude 4.5 Sonnet, OpenAI, Gemini, Flux, and Ideogram APIs.
