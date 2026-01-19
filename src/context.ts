import { PrismaClient } from '@prisma/client';
import { inferAsyncReturnType } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const createContext = ({ req, res }: trpcExpress.CreateExpressContextOptions) => {
  return {
    req,
    res,
    prisma,
  };
};

export type Context = inferAsyncReturnType<typeof createContext>;
