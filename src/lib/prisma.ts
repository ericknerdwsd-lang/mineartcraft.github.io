import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL;
  
  if (connectionString) {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  }
  
  // Em Prisma 7, `new PrismaClient()` sem argumentos falha se não houver URL no schema.
  // Durante o build no Vercel, se a DATABASE_URL não estiver presente, retornamos null ou lançamos um erro amigável.
  // Mas para o singleton funcionar e não quebrar imports, podemos tentar retornar o client de qualquer forma,
  // ou garantir que as variáveis de ambiente estejam no Vercel.
  
  if (process.env.NODE_ENV === 'production') {
    throw new Error("DATABASE_URL é obrigatória em produção.");
  }

  // Build-time only: Prisma 7 exige uma URL mesmo durante o build.
  // Este client nunca será executado em runtime sem DATABASE_URL.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new PrismaClient({
    datasourceUrl: "postgresql://build:build@localhost:5432/build",
  } as any);
};

const globalForPrisma = global as unknown as { 
  prisma: ReturnType<typeof createPrismaClient> | undefined 
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

