"use client";

import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import ProductModal from "@/components/ProductModal";
import styles from "./ProductGrid.module.css";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  category: string;
}

interface ProductGridProps {
  products: Product[];
  whatsappNumber: string;
}

export default function ProductGrid({ products, whatsappNumber }: ProductGridProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <>
      {products.length === 0 ? (
        <div className={styles.empty}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={styles.emptyIcon}>
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
          <h3>Nenhum produto disponível</h3>
          <p>Em breve teremos novidades para você!</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={setSelectedProduct}
            />
          ))}
        </div>
      )}

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          whatsappNumber={whatsappNumber}
        />
      )}
    </>
  );
}
