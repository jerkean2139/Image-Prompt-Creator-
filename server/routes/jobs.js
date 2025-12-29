import express from 'express';
import { PrismaClient } from '@prisma/client';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Redis connection for queue - only create if REDIS_URL is set
let jobQueue = null;

if (process.env.REDIS_URL) {
  try {
    const connection = new IORedis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      lazyConnect: true
    });
    
    connection.on('error', (err) => {
      console.error('BullMQ Redis error:', err.message);
    });
    
    jobQueue = new Queue('promptfusion-jobs', { connection });
    console.log('✅ BullMQ job queue initialized');
  } catch (err) {
    console.error('❌ Failed to initialize job queue:', err.message);
  }
} else {
  console.warn('⚠️  REDIS_URL not set - job queue disabled (jobs will be created but not processed)');
}

// Create new job
router.post('/', requireAuth, async (req, res) => {
  try {
    const { idea, presetKey, aspectRatio, moodTags, selectedProviders, bypassPromptCreation, directPrompt, referenceImages, presetAnswers } = req.body;
    
    if (!bypassPromptCreation && (!idea || idea.trim().length === 0)) {
      return res.status(400).json({ error: 'Idea is required' });
    }
    
    if (bypassPromptCreation && !directPrompt) {
      return res.status(400).json({ error: 'Direct prompt is required for bypass mode' });
    }
    
    // Check if user has enough credits (rough estimate)
    const estimatedCost = 500; // Rough estimate for full run
    if (req.user.creditsBalance < estimatedCost) {
      return res.status(402).json({ 
        error: 'Insufficient credits',
        required: estimatedCost,
        balance: req.user.creditsBalance
      });
    }
    
    // Deduct credits upfront
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        creditsBalance: {
          decrement: estimatedCost
        }
      }
    });
    
    // Create job
    const job = await prisma.job.create({
      data: {
        userId: req.user.id,
        idea: idea?.trim() || (bypassPromptCreation ? 'Direct prompt' : ''),
        presetKey: presetKey || null,
        aspectRatio: aspectRatio || '1024x1024',
        moodTags: moodTags || null,
        status: 'QUEUED',
        bypassPromptCreation: bypassPromptCreation || false,
        directPrompt: directPrompt ? JSON.stringify(directPrompt) : null,
        referenceImages: referenceImages || [],
        presetAnswers: presetAnswers ? JSON.stringify(presetAnswers) : null
      }
    });
    
    // Add to queue if available
    if (jobQueue) {
      await jobQueue.add('process-job', { jobId: job.id });
    } else {
      console.warn(`⚠️  Job ${job.id} created but queue unavailable - set REDIS_URL to enable processing`);
    }
    
    res.json({ 
      job: {
        id: job.id,
        status: job.status,
        idea: job.idea,
        createdAt: job.createdAt
      }
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// Get user's jobs
router.get('/', requireAuth, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    const jobs = await prisma.job.findMany({
      where: { userId: req.user.id },
      include: {
        runs: {
          include: {
            outputs: true
          }
        },
        gradedPrompt: true
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });
    
    res.json({ jobs });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Get specific job
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: {
        draftPrompt: true,
        gradedPrompt: true,
        runs: {
          include: {
            outputs: true,
            prompt: true
          }
        },
        referenceAssets: true
      }
    });
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    if (job.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json({ job });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

// Cancel job
router.post('/:id/cancel', requireAuth, async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id }
    });
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    if (job.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (job.status !== 'QUEUED' && job.status !== 'RUNNING') {
      return res.status(400).json({ error: 'Job cannot be canceled' });
    }
    
    await prisma.job.update({
      where: { id: req.params.id },
      data: { status: 'CANCELED' }
    });
    
    res.json({ message: 'Job canceled' });
  } catch (error) {
    console.error('Cancel job error:', error);
    res.status(500).json({ error: 'Failed to cancel job' });
  }
});

export default router;
