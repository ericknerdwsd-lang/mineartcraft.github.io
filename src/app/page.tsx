export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import ProductGrid from "@/components/ProductGrid";
import styles from "./page.module.css";
import { Product } from "@prisma/client";
import Image from "next/image";

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
        <div className={styles.logoContainer}>
          <Image 
            src="/logo.png" 
            alt="Logo" 
            width={80} 
            height={80} 
            className={styles.headerLogo}
          />
          <div>
            <h1 className={styles.logo}>Catálogo de Produtos</h1>
            <p className={styles.tagline}>Nossos Produtos Amigurumi</p>
          </div>
        </div>
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
