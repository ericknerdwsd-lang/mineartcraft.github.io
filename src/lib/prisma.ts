import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

let prismaInstance: PrismaClient;

if (typeof window === "undefined") {
  if (connectionString) {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    prismaInstance = new PrismaClient({ adapter });
  } else {
    // Fallback for build time if DATABASE_URL is missing
    prismaInstance = new PrismaClient();
  }
} else {
  // Client side (usually not used with this singleton pattern in Next.js Server Components, but for safety)
  prismaInstance = new PrismaClient();
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || prismaInstance;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

