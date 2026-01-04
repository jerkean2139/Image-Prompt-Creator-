import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

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

// Get user stats
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const [jobs, vaultItems] = await Promise.all([
      prisma.job.findMany({ where: { userId: req.user.id } }),
      prisma.vaultItem.findMany({ where: { userId: req.user.id } })
    ]);

    const stats = {
      totalGenerations: jobs.length,
      totalImages: jobs.filter(j => j.status === 'completed').length * 5,
      creditsUsed: jobs.reduce((sum, j) => sum + (j.creditsUsed || 0), 0),
      favorites: vaultItems.filter(item => item.isFavorite).length
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user stats' });
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
