import { prisma } from '../lib/prisma.js';

export const requireAuth = async (req, res, next) => {
  try {
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        creditsBalance: true,
        accountTier: true,
        sessionCredits: true,
        createdAt: true
      }
    });

    if (!user) {
      req.session.userId = null;
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const userId = req.session?.userId;
    
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          displayName: true,
          creditsBalance: true,
          accountTier: true,
          sessionCredits: true,
          createdAt: true
        }
      });
      
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};
