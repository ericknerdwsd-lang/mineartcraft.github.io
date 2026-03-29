export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import ProductGrid from "@/components/ProductGrid";
import styles from "./page.module.css";
import { Product, Prisma } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";
import HeroCarousel from "@/components/HeroCarousel";

const INSTAGRAM_USERNAME = process.env.INSTAGRAM_USERNAME || "mine.artecraft"; // placeholder

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category: activeCategory, q: searchQuery } = await searchParams;
  let products: Product[] = [];
  let carouselImages: any[] = [];

  try {
    const where: Prisma.ProductWhereInput = {};
    if (activeCategory) where.category = activeCategory;
    if (searchQuery) {
      where.name = { contains: searchQuery, mode: "insensitive" };
    }

    products = await prisma.product.findMany({
      where: where,
      orderBy: { createdAt: "desc" },
    });

    try {
      carouselImages = await prisma.carouselImage.findMany({
        orderBy: { order: "asc" }
      });
    } catch (e) {
      console.error("Aviso: Tabela Carrossel ainda não sincronizada, fallback ativado.");
    }
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
          <Link href="/" className={styles.logoContainer}>
            <Image
              src="/logo.png"
              alt="Logo"
              width={80}
              height={80}
              className={styles.headerLogo}
            />
            <h1 className={styles.headerTitle}>Mineartecraft</h1>
          </Link>

          <form action="/" method="GET" className={styles.searchForm}>
            {activeCategory && <input type="hidden" name="category" value={activeCategory} />}
            <input
              type="text"
              name="q"
              placeholder="Buscar produtos..."
              defaultValue={searchQuery}
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchButton}>🔍</button>
          </form>
        </div>
      </header>

      <HeroCarousel images={carouselImages} />

      <main className={styles.main}>
        <div className={styles.catalogFilter}>
          <h2 className={styles.catalogTitle}>Catálogo de Produtos</h2>
          <nav className={styles.filterNav}>
            {categories.map((cat) => {
              const params = new URLSearchParams();
              if (cat.id) params.set("category", cat.id);
              if (searchQuery) params.set("q", searchQuery);
              const href = params.toString() ? `/?${params.toString()}` : "/";

              return (
                <Link
                  key={cat.id}
                  href={href}
                  scroll={false}
                  className={`${styles.filterItem} ${(activeCategory || "") === cat.id ? styles.filterItemActive : ""
                    }`}
                >
                  {cat.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <ProductGrid
          products={products}
          instagramUsername={INSTAGRAM_USERNAME}
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
