import express from 'express';
import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// Password validation helper
const validatePassword = (password) => {
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain a number';
  return null;
};

// Register with validation
router.post('/register', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('displayName').optional().trim().isLength({ max: 50 }).escape()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email, password, displayName } = req.body;

    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password with higher cost factor
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user with 500 free credits
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName: displayName || email.split('@')[0],
        creditsBalance: 500
      }
    });

    // Create credit event for free credits
    await prisma.creditEvent.create({
      data: {
        userId: user.id,
        type: 'GRANT',
        amount: 500,
        reason: 'Welcome bonus'
      }
    });

    // Create session
    req.session.userId = user.id;

    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        creditsBalance: user.creditsBalance
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login with validation
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    // Find user - timing attack safe response
    let user = await prisma.user.findUnique({ where: { email } });
    
    // Pre-computed bcrypt hash for timing attack prevention
    const DUMMY_HASH = '$2b$12$K4G0AoIJZrVlPm1Yf6tFjOHJ3cMrJ5Q9xELnBdj8qNpVcZmE5Y2Uy';
    
    if (!user) {
      // User doesn't exist - dummy hash comparison for timing attack prevention
      await bcrypt.compare(password, DUMMY_HASH);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    if (!user.passwordHash) {
      // OAuth-only user trying password login - dummy hash for timing attack prevention
      await bcrypt.compare(password, DUMMY_HASH);
      return res.status(401).json({ error: 'Please use your OAuth provider to sign in' });
    }

    // Check password
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // For INFINITY tier users, reload credits on each login session
    if (user.accountTier === 'INFINITY') {
      const sessionCredits = user.sessionCredits || 10000;
      user = await prisma.user.update({
        where: { id: user.id },
        data: { creditsBalance: sessionCredits }
      });
      
      // Log the session reload event (no PII in logs)
      await prisma.creditEvent.create({
        data: {
          userId: user.id,
          type: 'SESSION_RELOAD',
          amount: sessionCredits,
          reason: 'Infinity tier session reload'
        }
      });
      console.log(`♾️ INFINITY tier user credits reloaded to ${sessionCredits}`);
    }

    // Create session
    req.session.userId = user.id;

    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        creditsBalance: user.creditsBalance,
        accountTier: user.accountTier
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Get current user
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
