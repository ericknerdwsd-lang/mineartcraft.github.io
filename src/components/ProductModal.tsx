"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import styles from "./ProductModal.module.css";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  images: string[];
  category: string;
}

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  whatsappNumber: string;
}

export default function ProductModal({
  product,
  onClose,
  whatsappNumber,
}: ProductModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(product.price);

  const images = product.images || [];
  const currentImage = images[currentImageIndex];

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const whatsappMessage = encodeURIComponent(
    `Olá! Tenho interesse no produto: *${product.name}* (${formattedPrice}). Poderia me dar mais informações?`
  );
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={24} />
        </button>

        <div className={styles.content}>
          <div className={styles.imageContainer}>
            <div className={styles.mainImageWrapper}>
              {currentImage ? (
                <>
                  <Image
                    src={currentImage}
                    alt={product.name}
                    fill
                    className={styles.image}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                  {images.length > 1 && (
                    <>
                      <button 
                        className={`${styles.navButton} ${styles.prevButton}`} 
                        onClick={prevImage}
                        aria-label="Foto anterior"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button 
                        className={`${styles.navButton} ${styles.nextButton}`} 
                        onClick={nextImage}
                        aria-label="Próxima foto"
                      >
                        <ChevronRight size={24} />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className={styles.placeholder}>
                  <span>Sem imagem</span>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className={styles.gallery}>
                {images.map((img, index) => (
                  <div 
                    key={index} 
                    className={`${styles.thumbnail} ${index === currentImageIndex ? styles.thumbnailActive : ""}`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} - angular ${index + 1}`}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="60px"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.details}>
            <h2 className={styles.name}>{product.name}</h2>
            <p className={styles.price}>{formattedPrice}</p>

            {product.description && (
              <div className={styles.descriptionContainer}>
                <h3 className={styles.descriptionTitle}>Descrição</h3>
                <p className={styles.description}>{product.description}</p>
              </div>
            )}

            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappButton}
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Tenho Interesse
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
