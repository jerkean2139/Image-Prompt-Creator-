import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all saved prompts for user
router.get('/saved', requireAuth, async (req, res) => {
  try {
    const prompts = await prisma.savedPrompt.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ prompts });
  } catch (error) {
    console.error('Error fetching saved prompts:', error);
    res.status(500).json({ error: 'Failed to fetch saved prompts' });
  }
});

// Create saved prompt
router.post('/saved', requireAuth, async (req, res) => {
  try {
    const prompt = await prisma.savedPrompt.create({
      data: {
        ...req.body,
        userId: req.user.id
      }
    });
    res.json({ prompt });
  } catch (error) {
    console.error('Error creating saved prompt:', error);
    res.status(500).json({ error: 'Failed to create saved prompt' });
  }
});

// Update saved prompt
router.patch('/saved/:id', requireAuth, async (req, res) => {
  try {
    const prompt = await prisma.savedPrompt.updateMany({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.id
      },
      data: req.body
    });
    res.json({ prompt });
  } catch (error) {
    console.error('Error updating saved prompt:', error);
    res.status(500).json({ error: 'Failed to update saved prompt' });
  }
});

// Delete saved prompt
router.delete('/saved/:id', requireAuth, async (req, res) => {
  try {
    await prisma.savedPrompt.deleteMany({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.id
      }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting saved prompt:', error);
    res.status(500).json({ error: 'Failed to delete saved prompt' });
  }
});

export default router;
