"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Pencil, Trash2, LogOut } from "lucide-react";
import styles from "./gestor.module.css";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  images: string[];
  createdAt: string;
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        console.error("API retornou erro:", data);
        setProducts([]); // Fallback para array vazio
        alert("Erro de conexão com o banco de dados. Atualize o arquivo .env com seu banco real e rode npx prisma db push.");
      }
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      setProducts([]);
    } finally {
      setLoading(false);
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
      </main>
    </div>
  );
}
