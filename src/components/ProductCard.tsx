"use client";

import Image from "next/image";
import styles from "./ProductCard.module.css";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  images: string[];
  category: string;
}

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

const categoryTags: Record<string, { label: string, colorClass: string }> = {
  amigurumis: { label: "Amigurumis", colorClass: styles.tagAmigurumi },
  roupas: { label: "Roupas", colorClass: styles.tagRoupa },
  bolsas_acessorios: { label: "Bolsas e Acessórios", colorClass: styles.tagBolsa }
};

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(product.price);

  const mainImage = product.images?.[0];
  const tagInfo = product.category ? categoryTags[product.category] : null;

  return (
    <div className={styles.card} onClick={() => onClick(product)}>
      <div className={styles.imageWrapper}>
        {tagInfo && (
           <span className={`${styles.tag} ${tagInfo.colorClass}`}>
             {tagInfo.label}
           </span>
        )}
        {mainImage ? (
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className={styles.image}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className={styles.placeholder}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
        )}
      </div>

      <div className={styles.info}>
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.price}>{formattedPrice}</p>
        <button className={styles.actionButton}>Ver detalhes</button>
      </div>
    </div>
  );
}
