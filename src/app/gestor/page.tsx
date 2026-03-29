"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Pencil, Trash2, LogOut, UploadCloud } from "lucide-react";
import styles from "./gestor.module.css";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  images: string[];
  createdAt: string;
}

interface CarouselImage {
  id: string;
  url: string;
  order: number;
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCarousel, setLoadingCarousel] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploadingBg, setUploadingBg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
    fetchCarousel();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        console.error("API retornou erro:", data);
        setProducts([]);
        alert("Erro de conexão com o banco de dados.");
      }
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCarousel = async () => {
    try {
      const res = await fetch("/api/carousel");
      const data = await res.json();
      if (Array.isArray(data)) {
        setCarouselImages(data);
      }
    } catch (error) {
      console.error("Erro ao buscar carrossel:", error);
    } finally {
      setLoadingCarousel(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts(products.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error("Erro ao excluir:", error);
    } finally {
      setDeleting(null);
    }
  };

  const handleUploadCarousel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (carouselImages.length >= 4) {
      alert("Limite máximo de 4 imagens atingido no carrossel.");
      return;
    }

    setUploadingBg(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Fazer upload do arquivo para o storage
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Erro no upload da imagem");
      const { url } = await uploadRes.json();

      // Salvar URL no banco do carrossel
      const carouselRes = await fetch("/api/carousel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!carouselRes.ok) throw new Error("Erro ao salvar carrossel no banco");
      const newImg = await carouselRes.json();
      setCarouselImages([...carouselImages, newImg]);

    } catch (error) {
      console.error("Erro ao processar imagem de destaque:", error);
      alert("Falha ao salvar a imagem. Tente novamente.");
    } finally {
      setUploadingBg(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteCarousel = async (id: string) => {
    if (!confirm("Remover esta imagem do destaque do topo?")) return;
    try {
      const res = await fetch(`/api/carousel/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCarouselImages(carouselImages.filter((c) => c.id !== id));
      }
    } catch (error) {
      console.error("Erro ao remover do carrossel:", error);
    }
  };

  const handleLogout = async () => {
    signOut({ callbackUrl: "/gestor/login" });
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.title}>Painel Gestor</h1>
            <p className={styles.subtitle}>
              {products.length} produto{products.length !== 1 ? "s" : ""} cadastrado{products.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className={styles.headerActions}>
            <Link href="/gestor/novo" className={styles.addButton}>
              <Plus size={20} />
              Novo Produto
            </Link>
            <button onClick={handleLogout} className={styles.logoutButton}>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {/* Seção do Carrossel (Destaques do Topo) */}
        <div className={styles.carouselSection} style={{ marginBottom: "3rem", padding: "1.5rem", background: "#f9f9f9", borderRadius: "12px", border: "1px solid #eee" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#333" }}>Imagens do Destaque (Carrossel)</h2>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingBg || carouselImages.length >= 4}
              style={{ padding: "0.5rem 1rem", background: "#4A6352", color: "white", borderRadius: "6px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <UploadCloud size={18} />
              {uploadingBg ? "Enviando..." : "Nova Foto"}
            </button>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleUploadCarousel} 
              style={{ display: "none" }} 
              ref={fileInputRef} 
            />
          </div>
          
          <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "1.5rem" }}>Faça upload de até 4 imagens para girar automaticamente no topo do catálogo. (Atual: {carouselImages.length}/4)</p>

          {loadingCarousel ? (
             <p>Carregando destaques...</p>
          ) : carouselImages.length === 0 ? (
             <p style={{ color: "#aaa", fontStyle: "italic" }}>O carrossel usará a foto de fundo padrão. Adicione fotos aqui para substituí-la.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
              {carouselImages.map(img => (
                <div key={img.id} style={{ position: "relative", width: "100%", aspectRatio: "16/9", borderRadius: "8px", overflow: "hidden", border: "1px solid #ddd" }}>
                  <Image src={img.url} alt="Destaque" fill style={{ objectFit: "cover" }} />
                  <button 
                    onClick={() => handleDeleteCarousel(img.id)}
                    style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(255,0,0,0.8)", color: "white", border: "none", padding: "6px", borderRadius: "50%", cursor: "pointer", zIndex: 10 }}
                    title="Remover Imagem"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lista de Produtos Tradicional */}
        <div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#333", marginBottom: "1rem" }}>Produtos do Catálogo</h2>
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Carregando produtos...</p>
            </div>
          ) : products.length === 0 ? (
            <div className={styles.empty}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
              <h3>Nenhum produto cadastrado</h3>
              <p>Comece adicionando seu primeiro produto!</p>
              <Link href="/gestor/novo" className={styles.addButton}>
                <Plus size={20} />
                Adicionar Produto
              </Link>
            </div>
          ) : (
            <div className={styles.table}>
              <div className={styles.tableHeader}>
                <span className={styles.colImage}>Imagem</span>
                <span className={styles.colName}>Nome</span>
                <span className={styles.colPrice}>Preço</span>
                <span className={styles.colActions}>Ações</span>
              </div>
              {products.map((product) => (
                <div key={product.id} className={styles.tableRow}>
                  <div className={styles.colImage}>
                    <div className={styles.thumbnail}>
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className={styles.thumbImage}
                          sizes="60px"
                        />
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "#c5bfb3" }}>
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="m21 15-5-5L5 21" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className={styles.colName}>{product.name}</span>
                  <span className={styles.colPrice}>{formatPrice(product.price)}</span>
                  <div className={styles.colActions}>
                    <Link
                      href={`/gestor/editar/${product.id}`}
                      className={styles.editButton}
                    >
                      <Pencil size={16} />
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className={styles.deleteButton}
                      disabled={deleting === product.id}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
