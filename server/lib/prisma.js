import { PrismaClient } from '@prisma/client';

// Singleton PrismaClient to prevent connection leaks
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
});

export { prisma };
