import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get user profile
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        displayName: true,
        creditsBalance: true,
        createdAt: true,
        _count: {
          select: {
            jobs: true,
            vaultItems: true
          }
        }
      }
    });
    
    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update profile
router.patch('/profile', requireAuth, async (req, res) => {
  try {
    const { displayName } = req.body;
    
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        displayName: displayName || undefined
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        creditsBalance: true
      }
    });
    
    res.json({ user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
