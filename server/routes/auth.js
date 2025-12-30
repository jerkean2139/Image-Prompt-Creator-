import express from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

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

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials' });
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
      
      // Log the session reload event
      await prisma.creditEvent.create({
        data: {
          userId: user.id,
          type: 'SESSION_RELOAD',
          amount: sessionCredits,
          reason: 'Infinity tier session reload'
        }
      });
      console.log(`♾️ INFINITY tier user ${user.email} credits reloaded to ${sessionCredits}`);
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
