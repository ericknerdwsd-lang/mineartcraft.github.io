"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./HeroCarousel.module.css";
import pageStyles from "@/app/page.module.css";

interface CarouselImage {
  id: string;
  url: string;
}

interface Props {
  images: CarouselImage[];
}

export default function HeroCarousel({ images }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images]);

  if (!images || images.length === 0) {
    // Componente fallback usando a classe estática .hero configurada antes
    return (
      <section className={pageStyles.hero}>
        <div className={pageStyles.heroOverlay}>
          <div className={pageStyles.heroContent}>
            <h2 className={pageStyles.heroTitle}>CRIAÇÕES FEITAS À MÃO</h2>
            <p className={pageStyles.heroSubtitle}>Qualidade e Charme em Cada Ponto</p>
          </div>
        </div>
      </section>
    );
  }

  // Com imagens do banco
  return (
    <section className={styles.heroWrapper}>
      {images.map((img, index) => (
        <div 
          key={img.id} 
          className={`${styles.slide} ${index === currentIndex ? styles.active : ''}`}
        >
          <Image 
            src={img.url} 
            alt={`Destaque ${index + 1}`} 
            fill 
            priority={index === 0}
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            sizes="100vw"
          />
        </div>
      ))}
      {/* Texto Estático encima de tudo */}
      <div 
        className={pageStyles.heroOverlay} 
        style={{ 
          position: "absolute", 
          zIndex: 10, 
          height: "100%", 
          width: "100%", 
          top: 0, 
          left: 0, 
          display: "flex", 
          alignItems: "center" 
        }}
      >
        <div className={pageStyles.heroContent}>
          <h2 className={pageStyles.heroTitle}>CRIAÇÕES FEITAS À MÃO</h2>
          <p className={pageStyles.heroSubtitle}>Qualidade e Charme em Cada Ponto</p>
        </div>
      </div>
    </section>
  );
}
