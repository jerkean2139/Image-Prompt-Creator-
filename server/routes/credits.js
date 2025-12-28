import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get credit balance and history
router.get('/', requireAuth, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const events = await prisma.creditEvent.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
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
