import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedTags() {
  const tags = [
    { slug: "amigurumis", label: "Amigurumis", bgColor: "#E8D5F5", textColor: "#7B2D9E" },
    { slug: "roupas", label: "Roupas", bgColor: "#D5EDF5", textColor: "#1A6B8A" },
    { slug: "bolsas_acessorios", label: "Bolsas e Acessórios", bgColor: "#D5F5E3", textColor: "#1A7A4A" },
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
  }

  console.log("Tags seeded successfully!");
}

seedTags()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
