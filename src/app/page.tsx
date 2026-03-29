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
        <div className={styles.headerContainer}>
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
            </div>
          </div>
          <nav className={styles.nav}>
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
          </nav>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroOverlay}>
          <div className={styles.heroContent}>
            <h2 className={styles.heroTitle}>CRIAÇÕES FEITAS À MÃO</h2>
            <p className={styles.heroSubtitle}>Qualidade e Charme em Cada Ponto</p>
          </div>
        </div>
      </section>

      <main className={styles.main}>
        <ProductGrid
          products={products}
          whatsappNumber={WHATSAPP_NUMBER}
        />
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerSocial}>
            <div className={styles.socialIcons}>
              {/* Ícones placeholder simples */}
              <span className={styles.socialIcon}>F</span>
              <span className={styles.socialIcon}>T</span>
              <span className={styles.socialIcon}>V</span>
              <span className={styles.socialIcon}>I</span>
            </div>
            <p className={styles.socialText}>Siga-nos em nossas redes</p>
          </div>
          <div className={styles.footerNewsletter}>
            <p className={styles.newsletterLabel}>Newsletter</p>
            <p className={styles.newsletterSub}>Assine nosso contato</p>
            <div className={styles.newsletterInputContainer}>
              <input type="email" placeholder="E-mail de Notificação" className={styles.newsletterInput} />
            </div>
          </div>
          <div className={styles.footerLinks}>
            <Link href="#">Termos do Serviço</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
