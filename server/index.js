import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import { createClient } from 'redis';
import { PrismaClient } from '@prisma/client';

// Routes
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import vaultRoutes from './routes/vault.js';
import creditRoutes from './routes/credits.js';
import userRoutes from './routes/user.js';
import uploadRoutes from './routes/upload.js';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Initialize Redis client for sessions
let redisClient;
let sessionStore;

if (process.env.REDIS_URL) {
  redisClient = createClient({ 
    url: process.env.REDIS_URL,
    socket: {
      connectTimeout: 10000,
      reconnectStrategy: (retries) => Math.min(retries * 50, 500)
    }
  });
  
  redisClient.on('error', (err) => console.error('Redis Client Error:', err));
  redisClient.on('connect', () => console.log('✅ Redis session store connected'));
  
  // Connect asynchronously without blocking
  redisClient.connect().catch((err) => {
    console.error('❌ Redis connection failed:', err);
    console.warn('⚠️  Falling back to MemoryStore');
  });
  
  sessionStore = new RedisStore({ client: redisClient });
} else {
  console.warn('⚠️  REDIS_URL not found, using MemoryStore (not recommended for production)');
}

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
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
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

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

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'));
  
  // Serve index.html for all non-API routes (SPA routing)
  app.get('*', (req, res) => {
    res.sendFile('index.html', { root: 'dist' });
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
