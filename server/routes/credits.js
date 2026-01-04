import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// Query limit caps
const MAX_LIMIT = 100;

// Get credit balance and history
router.get('/', requireAuth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, MAX_LIMIT);
    const offset = Math.max(parseInt(req.query.offset) || 0, 0);
    
    const events = await prisma.creditEvent.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });
    
    res.json({
      balance: req.user.creditsBalance,
      events
    });
  } catch (error) {
    console.error('Get credits error:', error);
    res.status(500).json({ error: 'Failed to fetch credit history' });
  }
});

export default router;
