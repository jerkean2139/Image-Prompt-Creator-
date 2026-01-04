import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
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

// Validate required environment variables on startup
const requiredEnvVars = ['SESSION_SECRET', 'DATABASE_URL'];
const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingEnvVars.length > 0) {
  console.error(`❌ FATAL: Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Routes
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import vaultRoutes from './routes/vault.js';
import creditRoutes from './routes/credits.js';
import userRoutes from './routes/user.js';
import uploadRoutes from './routes/upload.js';
import promptsRoutes from './routes/prompts.js';

import { prisma } from './lib/prisma.js';

const app = express();
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

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "https:", "wss:"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 auth attempts per 15 minutes
  message: { error: 'Too many authentication attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

const jobLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 job creations per minute
  message: { error: 'Rate limit exceeded for job creation' },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// CORS configuration - strict whitelist with exact hostname matching
const allowedOrigins = [
  'http://localhost:5000',
  'http://localhost:3001',
  'http://0.0.0.0:5000',
  process.env.CLIENT_URL,
  process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null,
  process.env.REPLIT_DOMAINS
].filter(Boolean);

// Extract hostname from URL for secure comparison
function getHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    
    const originHostname = getHostname(origin);
    if (!originHostname) {
      console.warn(`CORS blocked invalid origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    }
    
    // Check exact match against whitelist
    const isExactMatch = allowedOrigins.some(allowed => {
      const allowedHostname = getHostname(allowed);
      return allowedHostname && originHostname === allowedHostname;
    });
    
    // Allow Replit domains (exact suffix match for security)
    const isReplitDomain = originHostname.endsWith('.replit.dev') || 
                           originHostname.endsWith('.repl.co') ||
                           originHostname.endsWith('.janeway.replit.dev');
    
    if (isExactMatch || isReplitDomain) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(session({
  store: sessionStore || undefined,
  secret: process.env.SESSION_SECRET, // Required - validated at startup
  resave: false,
  saveUninitialized: false,
  name: 'pf_sid', // Custom session cookie name (not default 'connect.sid')
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

// API Routes (must be before catch-all route)
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobLimiter, jobRoutes);
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

// Error handler - sanitize error messages in production
app.use((err, req, res, next) => {
  // Log full error server-side
  console.error('Error:', err);
  
  // Sanitize error response for production
  const isDev = process.env.NODE_ENV !== 'production';
  const status = err.status || 500;
  
  // Never expose internal errors to client in production
  let message = 'Internal server error';
  if (status < 500 || isDev) {
    message = err.message || message;
  }
  
  res.status(status).json({
    error: message,
    ...(isDev && { stack: err.stack })
  });
});

// Health check with dependency status
app.get('/health', async (req, res) => {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'degraded', 
      timestamp: new Date().toISOString(),
      database: 'disconnected'
    });
  }
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
