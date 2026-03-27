export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import ProductGrid from "@/components/ProductGrid";
import styles from "./page.module.css";
import { Product } from "@prisma/client";

const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || "5500000000000";

export default async function Home() {
  let products: Product[] = [];
  try {
    products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Aviso: Conexão com o banco de dados falhou na Home. Verifique o arquivo .env");
  }

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.logo}>Catálogo</h1>
        <p className={styles.tagline}>Nossos Produtos</p>
      </header>

      <main className={styles.main}>
        <h2 className={styles.sectionTitle}>Produtos em Destaque</h2>
        <ProductGrid
          products={products}
          whatsappNumber={WHATSAPP_NUMBER}
        />
      </main>

      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} Catálogo. Todos os direitos reservados.</p>
      </footer>
    </>
  );
}
