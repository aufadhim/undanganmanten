import { PrismaClient } from '@prisma/client';

// Singleton pattern biar gak bikin banyak koneksi DB pas hot-reload
const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
