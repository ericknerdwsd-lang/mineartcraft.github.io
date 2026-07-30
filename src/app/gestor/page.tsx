"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Pencil, Trash2, LogOut, UploadCloud, Tag, Check, X } from "lucide-react";
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

interface TagItem {
  id: string;
  slug: string;
  label: string;
  bgColor: string;
  textColor: string;
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCarousel, setLoadingCarousel] = useState(true);
  const [loadingTags, setLoadingTags] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploadingBg, setUploadingBg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Tag form state
  const [showTagForm, setShowTagForm] = useState(false);
  const [tagLabel, setTagLabel] = useState("");
  const [tagBgColor, setTagBgColor] = useState("#E8D5F5");
  const [tagTextColor, setTagTextColor] = useState("#7B2D9E");
  const [savingTag, setSavingTag] = useState(false);

  // Tag edit state
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editBgColor, setEditBgColor] = useState("");
  const [editTextColor, setEditTextColor] = useState("");

  useEffect(() => {
    fetchProducts();
    fetchCarousel();
    fetchTags();
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

  const fetchTags = async () => {
    try {
      const res = await fetch("/api/tags");
      const data = await res.json();
      if (Array.isArray(data)) {
        setTags(data);
      }
    } catch (error) {
      console.error("Erro ao buscar tags:", error);
    } finally {
      setLoadingTags(false);
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

  // ─── Tag Handlers ───

  const handleCreateTag = async () => {
    if (!tagLabel.trim()) return;
    setSavingTag(true);
    
    // Auto generate slug from label
    const generatedSlug = tagLabel.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");

    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: generatedSlug,
          label: tagLabel,
          bgColor: tagBgColor,
          textColor: tagTextColor,
        }),
      });

      if (res.ok) {
        const newTag = await res.json();
        setTags([...tags, newTag]);
        setTagLabel("");
        setTagBgColor("#E8D5F5");
        setTagTextColor("#7B2D9E");
        setShowTagForm(false);
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao criar tag.");
      }
    } catch (error) {
      console.error("Erro ao criar tag:", error);
      alert("Erro de conexão.");
    } finally {
      setSavingTag(false);
    }
  };

  const startEditTag = (tag: TagItem) => {
    setEditingTag(tag.id);
    setEditLabel(tag.label);
    setEditBgColor(tag.bgColor);
    setEditTextColor(tag.textColor);
  };

  const cancelEditTag = () => {
    setEditingTag(null);
    setEditLabel("");
    setEditBgColor("");
    setEditTextColor("");
  };

  const handleUpdateTag = async (id: string) => {
    if (!editLabel.trim()) return;
    try {
      const res = await fetch(`/api/tags/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: editLabel,
          bgColor: editBgColor,
          textColor: editTextColor,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setTags(tags.map((t) => (t.id === id ? updated : t)));
        cancelEditTag();
      } else {
        alert("Erro ao atualizar tag.");
      }
    } catch (error) {
      console.error("Erro ao atualizar tag:", error);
    }
  };

  const handleDeleteTag = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta tag?")) return;
    try {
      const res = await fetch(`/api/tags/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTags(tags.filter((t) => t.id !== id));
      }
    } catch (error) {
      console.error("Erro ao excluir tag:", error);
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
        <div className={styles.carouselSection}>
          <div className={styles.carouselHeader}>
            <h2 className={styles.carouselTitle}>Imagens do Destaque (Carrossel)</h2>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingBg || carouselImages.length >= 4}
              className={styles.carouselUploadBtn}
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
          
          <p className={styles.carouselHelp}>Faça upload de até 4 imagens para girar automaticamente no topo do catálogo. (Atual: {carouselImages.length}/4)</p>

          {loadingCarousel ? (
             <p className={styles.carouselHelp}>Carregando destaques...</p>
          ) : carouselImages.length === 0 ? (
             <p className={styles.carouselEmpty}>O carrossel usará a foto de fundo padrão. Adicione fotos aqui para substituí-la.</p>
          ) : (
            <div className={styles.carouselGrid}>
              {carouselImages.map(img => (
                <div key={img.id} className={styles.carouselItem}>
                  <Image src={img.url} alt="Destaque" fill style={{ objectFit: "cover" }} />
                  <button 
                    onClick={() => handleDeleteCarousel(img.id)}
                    className={styles.carouselDeleteBtn}
                    title="Remover Imagem"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── Seção de Tags ─── */}
        <div className={styles.tagSection}>
          <div className={styles.tagSectionHeader}>
            <div className={styles.tagTitleGroup}>
              <Tag size={20} className={styles.tagIcon} />
              <h2 className={styles.tagSectionTitle}>Tags / Categorias</h2>
            </div>
            <button
              onClick={() => setShowTagForm(!showTagForm)}
              className={styles.tagAddBtn}
            >
              <Plus size={18} />
              Nova Tag
            </button>
          </div>

          <p className={styles.tagHelp}>
            Gerencie as categorias que aparecem nos produtos e nos filtros do catálogo.
          </p>

          {/* Formulário para nova tag */}
          {showTagForm && (
            <div className={styles.tagForm}>
              <div className={styles.tagFormRow}>
                <div className={styles.tagFormField}>
                  <label className={styles.tagFormLabel}>Nome de exibição</label>
                  <input
                    type="text"
                    value={tagLabel}
                    onChange={(e) => setTagLabel(e.target.value)}
                    placeholder="ex: Decoração"
                    className={styles.tagFormInput}
                  />
                </div>
              </div>
              <div className={styles.tagFormRow}>
                <div className={styles.tagFormField}>
                  <label className={styles.tagFormLabel}>Cor de fundo</label>
                  <div className={styles.colorPickerGroup}>
                    <input
                      type="color"
                      value={tagBgColor}
                      onChange={(e) => setTagBgColor(e.target.value)}
                      className={styles.colorPicker}
                    />
                    <span className={styles.colorHex}>{tagBgColor}</span>
                  </div>
                </div>
                <div className={styles.tagFormField}>
                  <label className={styles.tagFormLabel}>Cor do texto</label>
                  <div className={styles.colorPickerGroup}>
                    <input
                      type="color"
                      value={tagTextColor}
                      onChange={(e) => setTagTextColor(e.target.value)}
                      className={styles.colorPicker}
                    />
                    <span className={styles.colorHex}>{tagTextColor}</span>
                  </div>
                </div>
                <div className={styles.tagFormField}>
                  <label className={styles.tagFormLabel}>Preview</label>
                  <span
                    className={styles.tagPreview}
                    style={{ backgroundColor: tagBgColor, color: tagTextColor }}
                  >
                    {tagLabel || "Exemplo"}
                  </span>
                </div>
              </div>
              <div className={styles.tagFormActions}>
                <button
                  onClick={handleCreateTag}
                  disabled={savingTag || !tagLabel.trim()}
                  className={styles.tagSaveBtn}
                >
                  {savingTag ? "Salvando..." : "Criar Tag"}
                </button>
                <button
                  onClick={() => setShowTagForm(false)}
                  className={styles.tagCancelBtn}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Lista de tags existentes */}
          {loadingTags ? (
            <p className={styles.tagHelp}>Carregando tags...</p>
          ) : tags.length === 0 ? (
            <p className={styles.tagEmpty}>Nenhuma tag cadastrada. Adicione sua primeira tag!</p>
          ) : (
            <div className={styles.tagList}>
              {tags.map((tag) => (
                <div key={tag.id} className={styles.tagItem}>
                  {editingTag === tag.id ? (
                    /* ─── Modo de edição ─── */
                    <div className={styles.tagEditForm}>
                      <div className={styles.tagEditRow}>
                        <div className={styles.tagFormField}>
                          <label className={styles.tagFormLabel}>Nome</label>
                          <input
                            type="text"
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            className={styles.tagFormInput}
                          />
                        </div>
                        <div className={styles.tagFormField}>
                          <label className={styles.tagFormLabel}>Cor de fundo</label>
                          <div className={styles.colorPickerGroup}>
                            <input
                              type="color"
                              value={editBgColor}
                              onChange={(e) => setEditBgColor(e.target.value)}
                              className={styles.colorPicker}
                            />
                            <span className={styles.colorHex}>{editBgColor}</span>
                          </div>
                        </div>
                        <div className={styles.tagFormField}>
                          <label className={styles.tagFormLabel}>Cor do texto</label>
                          <div className={styles.colorPickerGroup}>
                            <input
                              type="color"
                              value={editTextColor}
                              onChange={(e) => setEditTextColor(e.target.value)}
                              className={styles.colorPicker}
                            />
                            <span className={styles.colorHex}>{editTextColor}</span>
                          </div>
                        </div>
                        <div className={styles.tagFormField}>
                          <label className={styles.tagFormLabel}>Preview</label>
                          <span
                            className={styles.tagPreview}
                            style={{ backgroundColor: editBgColor, color: editTextColor }}
                          >
                            {editLabel || "Exemplo"}
                          </span>
                        </div>
                      </div>
                      <div className={styles.tagEditActions}>
                        <button
                          onClick={() => handleUpdateTag(tag.id)}
                          className={styles.tagConfirmBtn}
                          title="Salvar"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={cancelEditTag}
                          className={styles.tagCancelIconBtn}
                          title="Cancelar"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ─── Modo de visualização ─── */
                    <div className={styles.tagDisplay}>
                      <div className={styles.tagInfo}>
                        <span
                          className={styles.tagBadge}
                          style={{ backgroundColor: tag.bgColor, color: tag.textColor }}
                        >
                          {tag.label}
                        </span>
                      </div>
                      <div className={styles.tagActions}>
                        <button
                          onClick={() => startEditTag(tag)}
                          className={styles.editButton}
                          title="Editar tag"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteTag(tag.id)}
                          className={styles.deleteButton}
                          title="Excluir tag"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lista de Produtos Tradicional */}
        <div>
          <h2 className={styles.sectionTitle}>Produtos do Catálogo</h2>
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
