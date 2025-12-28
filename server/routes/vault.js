import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get user's vault collections
router.get('/collections', requireAuth, async (req, res) => {
  try {
    const collections = await prisma.vaultCollection.findMany({
      where: { userId: req.user.id },
      include: {
        _count: {
          select: { items: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    res.json({ collections });
  } catch (error) {
    console.error('Get collections error:', error);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
});

// Create collection
router.post('/collections', requireAuth, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Collection name is required' });
    }
    
    const collection = await prisma.vaultCollection.create({
      data: {
        userId: req.user.id,
        name: name.trim(),
        description: description || null
      }
    });
    
    res.json({ collection });
  } catch (error) {
    console.error('Create collection error:', error);
    res.status(500).json({ error: 'Failed to create collection' });
  }
});

// Get vault items
router.get('/items', requireAuth, async (req, res) => {
  try {
    const { collectionId, limit = 50, offset = 0 } = req.query;
    
    const where = { userId: req.user.id };
    if (collectionId) {
      where.collectionId = collectionId;
    }
    
    const items = await prisma.vaultItem.findMany({
      where,
      include: {
        asset: true,
        collection: true,
        imageOutput: {
          include: {
            modelRun: {
              include: {
                prompt: true,
                job: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });
    
    res.json({ items });
  } catch (error) {
    console.error('Get vault items error:', error);
    res.status(500).json({ error: 'Failed to fetch vault items' });
  }
});

// Save image to vault
router.post('/items', requireAuth, async (req, res) => {
  try {
    const { imageOutputId, collectionId, title, tags, notes } = req.body;
    
    if (!imageOutputId) {
      return res.status(400).json({ error: 'Image output ID is required' });
    }
    
    // Get image output
    const imageOutput = await prisma.imageOutput.findUnique({
      where: { id: imageOutputId },
      include: {
        modelRun: {
          include: {
            job: true
          }
        }
      }
    });
    
    if (!imageOutput) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    if (imageOutput.modelRun.job.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Create or get asset
    let asset;
    if (imageOutput.assetId) {
      asset = await prisma.asset.findUnique({
        where: { id: imageOutput.assetId }
      });
    } else {
      asset = await prisma.asset.create({
        data: {
          userId: req.user.id,
          type: 'GENERATED_OUTPUT',
          url: imageOutput.url,
          thumbUrl: imageOutput.thumbUrl,
          width: imageOutput.width,
          height: imageOutput.height,
          metaJson: imageOutput.metaJson
        }
      });
      
      // Link asset to image output
      await prisma.imageOutput.update({
        where: { id: imageOutputId },
        data: { assetId: asset.id }
      });
    }
    
    // Create vault item
    const vaultItem = await prisma.vaultItem.create({
      data: {
        userId: req.user.id,
        assetId: asset.id,
        imageOutputId: imageOutputId,
        collectionId: collectionId || null,
        title: title || null,
        tags: tags || null,
        notes: notes || null,
        sourceJobId: imageOutput.modelRun.jobId
      },
      include: {
        asset: true,
        collection: true,
        imageOutput: {
          include: {
            modelRun: {
              include: {
                prompt: true
              }
            }
          }
        }
      }
    });
    
    res.json({ vaultItem });
  } catch (error) {
    console.error('Save to vault error:', error);
    res.status(500).json({ error: 'Failed to save to vault' });
  }
});

// Delete vault item
router.delete('/items/:id', requireAuth, async (req, res) => {
  try {
    const item = await prisma.vaultItem.findUnique({
      where: { id: req.params.id }
    });
    
    if (!item) {
      return res.status(404).json({ error: 'Vault item not found' });
    }
    
    if (item.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    await prisma.vaultItem.delete({
      where: { id: req.params.id }
    });
    
    res.json({ message: 'Vault item deleted' });
  } catch (error) {
    console.error('Delete vault item error:', error);
    res.status(500).json({ error: 'Failed to delete vault item' });
  }
});

export default router;
