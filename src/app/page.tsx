export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import ProductGrid from "@/components/ProductGrid";
import styles from "./page.module.css";
import { Product } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";

const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || "5500000000000";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: activeCategory } = await searchParams;
  let products: Product[] = [];
  
  try {
    const where = activeCategory ? { category: activeCategory } : {};
    products = await prisma.product.findMany({
      where: where as any, // Cast to any to avoid temporarily outdated types lint error
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Aviso: Conexão com o banco de dados falhou na Home. Verifique o arquivo .env");
  }

  const categories = [
    { id: "", label: "Todos" },
    { id: "amigurumis", label: "Amigurumis" },
    { id: "roupas", label: "Roupas" },
    { id: "bolsas_acessorios", label: "Bolsas e Acessórios" },
  ];

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
            <p className={styles.tagline}>Feito à mão com amor</p>
          </div>
        </div>
      </header>

      <nav className={styles.nav}>
        <div className={styles.navContainer}>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={cat.id ? `/?category=${cat.id}` : "/"}
              className={`${styles.navItem} ${
                (activeCategory || "") === cat.id ? styles.navItemActive : ""
              }`}
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </nav>

      <main className={styles.main}>
        <h2 className={styles.sectionTitle}>
          {activeCategory 
            ? categories.find(c => c.id === activeCategory)?.label 
            : "Nossos Produtos"}
        </h2>
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
