import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import { createClient } from 'redis';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Routes
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import vaultRoutes from './routes/vault.js';
import creditRoutes from './routes/credits.js';
import userRoutes from './routes/user.js';
import uploadRoutes from './routes/upload.js';
import promptsRoutes from './routes/prompts.js';

const app = express();
const prisma = new PrismaClient();
// Detect if running in Replit development environment
const isReplitDev = process.env.REPLIT_DEV_DOMAIN || process.env.REPL_ID;
// In Replit dev, always use 3001 for the vite proxy
// In production (Railway), use PORT env var
const PORT = isReplitDev ? 3001 : (process.env.PORT || 8080);

// Initialize Redis client for sessions
let sessionStore = undefined;

if (process.env.REDIS_URL) {
  try {
    const redisClient = createClient({ 
      url: process.env.REDIS_URL,
      socket: {
        connectTimeout: 10000,
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            console.warn('⚠️  Redis connection failed after 3 retries, using MemoryStore');
            return false; // Stop retrying
          }
          return Math.min(retries * 100, 1000);
        }
      }
    });
    
    redisClient.on('error', (err) => {
      // Only log once, not repeatedly
      if (!redisClient._errorLogged) {
        console.error('Redis Client Error:', err.message);
        redisClient._errorLogged = true;
      }
    });
    redisClient.on('connect', () => console.log('✅ Redis session store connected'));
    
    // Connect asynchronously without blocking
    redisClient.connect().then(() => {
      console.log('✅ Redis connected successfully');
    }).catch((err) => {
      console.error('❌ Redis connection failed:', err.message);
    });
    
    sessionStore = new RedisStore({ client: redisClient });
  } catch (err) {
    console.error('❌ Failed to initialize Redis:', err.message);
  }
} else {
  console.warn('⚠️  REDIS_URL not found, using MemoryStore (OK for development)');
}

// Middleware
// CORS configuration
const allowedOrigins = [
  'http://localhost:5000',
  'http://localhost:3001',
  'http://0.0.0.0:5000',
  process.env.CLIENT_URL,
  process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(allowed => origin.includes(allowed.replace(/https?:\/\//, '')))) {
      callback(null, true);
    } else if (origin.includes('.replit.dev') || origin.includes('.repl.co')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(session({
  store: sessionStore || undefined,
  secret: process.env.SESSION_SECRET || 'change-this-secret',
  resave: false,
  saveUninitialized: false,
  proxy: process.env.NODE_ENV === 'production',
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Serve generated images
app.use('/api/images', express.static(path.join(__dirname, 'public/images')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes (must be before catch-all route)
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/vault', vaultRoutes);
app.use('/api/credits', creditRoutes);
app.use('/api/user', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/prompts', promptsRoutes);

// Serve frontend static files in production (not in Replit dev environment)
if (process.env.NODE_ENV === 'production' && !isReplitDev) {
  const distPath = path.join(__dirname, '..', 'dist');
  
  app.use(express.static(distPath));
  
  // Serve index.html for all non-API routes (SPA routing)
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PromptFusion API running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

export { prisma };
