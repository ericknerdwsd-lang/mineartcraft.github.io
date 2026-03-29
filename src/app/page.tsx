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
          <div className={styles.footerContent}>
            <div className={styles.footerBrand}>
              <h3 className={styles.footerBrandTitle}>Mineartecraft</h3>
              <p className={styles.footerBrandText}>Peças artesanais feitas com amor e dedicação.</p>
            </div>
            
            <div className={styles.footerSocial}>
              <p className={styles.socialText}>Siga-nos no Instagram</p>
              <a 
                href={`https://www.instagram.com/${INSTAGRAM_USERNAME}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Instagram"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>

            <div className={styles.footerLinks}>
              <Link href="/termos" className={styles.footerLink}>Termos do Serviço</Link>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>&copy; 2026 Mineartecraft. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
