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
  
  if (process.env.NODE_ENV === 'production' && !connectionString) {
    console.warn('AVISO: DATABASE_URL não encontrada. O PrismaClient pode falhar na inicialização.');
  }

  // Se não houver connectionString, o Prisma 7 exige que forneçamos algo ou ele lançará o erro observado no Vercel.
  // Para permitir que o build prossiga sem quebrar em rotas que não usam o banco no momento do build:
  return new PrismaClient({
    // @ts-ignore - Forçando uma tentativa para evitar o erro de "opções vazias", 
    // embora vá falhar se for realmente executado sem URL.
    datasourceUrl: connectionString || "postgres://dummy", 
  });
};

const globalForPrisma = global as unknown as { 
  prisma: ReturnType<typeof createPrismaClient> | undefined 
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

